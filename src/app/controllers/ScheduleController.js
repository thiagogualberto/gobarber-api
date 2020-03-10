import { startOfDay, endOfDay, parseISO } from 'date-fns';

// Operador para trabalhar between do sequelize
import { Op } from 'sequelize';
import User from '../models/User';
import Appointment from '../models/Appointment';

class ScheduleController {
    async index(req, res) {
        // Verifica se o usuário logado é prestador de serviço
        const checkUserProvider = await User.findOne({
            where: { id: req.userId, provider: true },
        });

        if (!checkUserProvider) {
            return res.status(401).json({ error: 'User is not a provider.' });
        }

        const { date } = req.query;

        const parseDate = parseISO(date);

        /**
         * Lista todos os agendamentos, ordenados por data, que o prestador é igual ao
         * usuário logado com a data do dia e que não foram cancelados.
         * Idéia do bettween
         */
        const appointments = await Appointment.findAll({
            where: {
                provider_id: req.userId,
                canceled_at: null,
                date: {
                    [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)],
                },
            },
            order: ['date'],
        });

        return res.json({ appointments });
    }
}

export default new ScheduleController();
