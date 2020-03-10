import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

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
        const appointments = await Appointment.findAll({
            where: { user_id: req.userId, canceled_at: null },
            order: ['date'],
            attributes: ['id', 'date'],
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
         * Notify appointment pro
         */

        const user = await User.findByPk(req.userId);

        const formattedDate = format(
            hourStart,
            "'dia' dd 'de' MMMM', às' H:mm'h",
            { locale: pt }
        );

        await Notification.create({
            content: `Novo agendamento de ${user.name} para ${formattedDate}`,
            user: provider_id,
        });

        return res.json(appointment);
    }
}

export default new AppointmentController();
