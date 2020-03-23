import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';

// Locale do date-fns de português
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';

// Importação do schema mongoDB
import Notification from '../schemas/Notification';

// Importa o job de cancelamento
import CancellationMail from '../jobs/CancellationMail';

// Importa a fila
import Queue from '../../lib/Queue';

class AppointmentController {
    async index(req, res) {
        const { page = 1 } = req.query;
        /**
         * Lista todos os agendamentos do usuário logado (user_id = req.userId):
         * que não foram cancelados (canceled_at = null), ordenados por data,
         * selecionando os atributos 'id' e 'date'. Mostrando o relacionamento
         * deste agendamento com o provider (prestador de serviço) e o avatar
         * deste prestador de serviço.
         */
        // past - agendamentos de datas que ainda não passaram
        // cancelable - retorna se o agendamento é cancelável ou não.
        const appointments = await Appointment.findAll({
            where: { user_id: req.userId, canceled_at: null },
            order: ['date'],
            attributes: ['id', 'date', 'past', 'cancelable'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['id', 'path', 'url'],
                        },
                    ],
                },
            ],
        });
        return res.json(appointments);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            provider_id: Yup.number().required(),
            date: Yup.date().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails.' });
        }

        const { provider_id, date } = req.body;

        /**
         * Check if provider_id is a provider
         */
        const checkIsProvider = await User.findOne({
            where: { id: provider_id, provider: true },
        });

        if (!checkIsProvider) {
            return res.status(401).json({
                error: 'You can only create appointments with providers.',
            });
        }

        if (req.userId === provider_id) {
            return res.status(401).json({
                error: 'You can not create appointments with yourself.',
            });
        }

        /**
         * Check for past dates
         */
        // parseISO - Transforma a string da requisição em um objeto date do JS
        // O objeto gerado é usado na startOfHour
        // startOfHour - pega somente o início da hora e não minutos e segundos
        const hourStart = startOfHour(parseISO(date));

        // Verifica se hourStart está antes da data atual.
        if (isBefore(hourStart, new Date())) {
            return res
                .status(400)
                .json({ error: 'Past dates are not permitted.' });
        }

        /**
         * Check date availability
         */
        const checkAvailability = await Appointment.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart,
            },
        });

        if (checkAvailability) {
            return res
                .status(400)
                .json({ error: 'Appointment date is not available.' });
        }

        // Cria o registro na tabela 'appointments'.
        const appointment = await Appointment.create({
            user_id: req.userId,
            provider_id,
            date,
        });

        /**
         * Notify appointment provider
         */
        const user = await User.findByPk(req.userId);

        const formattedDate = format(
            hourStart,
            "'dia' dd 'de' MMMM', às' H:mm'h",
            { locale: pt }
        );

        // Cria uma nova notificação
        await Notification.create({
            content: `Novo agendamento de ${user.name} para ${formattedDate}`,
            user: provider_id,
        });

        return res.json(appointment);
    }

    async delete(req, res) {
        // Busca os dados do agendamento e inclui(include) os dados do prestador
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['name', 'email'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['name'],
                },
            ],
        });

        /**
         * Verifica se o id do usuário do agendamento é diferente do
         * usuário que ta logado. Se for diferente, ele não é o dono
         * do agendamento e não pode cancelar o mesmo.
         */
        if (appointment.user_id !== req.userId) {
            return res.status(401).json({
                error: "You don't have permission to cancel this appointment.",
            });
        }

        /**
         * subHours - Reduz o número de horas de um agendamento.
         * Se dateWithSub for antes da data atual, o agendamento não pode
         * ser cancelado.
         */
        const dateWithSub = subHours(appointment.date, 2);
        if (isBefore(dateWithSub, new Date())) {
            return res.status(401).json({
                error: 'You can only cancel appointments 2 hours in advance.',
            });
        }

        // Seta o campo canceled_at com a data que foi feito o cancelamento.
        appointment.canceled_at = new Date();
        await appointment.save();

        await Queue.add(CancellationMail.key, {
            appointment,
        });

        return res.json(appointment);
    }
}

export default new AppointmentController();
