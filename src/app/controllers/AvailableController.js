import {
    startOfDay,
    endOfDay,
    setHours,
    setMinutes,
    setSeconds,
    format,
    isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvailableController {
    async index(req, res) {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Invalid date' });
        }

        const searchDate = Number(date);

        // Busca todos os agendamentos da data que o usuário enviou
        const appointments = await Appointment.findAll({
            where: {
                provider_id: req.params.providerId,
                canceled_at: null,
                date: {
                    [Op.between]: [
                        startOfDay(searchDate),
                        endOfDay(searchDate),
                    ],
                },
            },
        });

        // Todos os horários disponíveis que um agendador possui
        const schedule = [
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
            '17:00',
            '18:00',
            '19:00',
        ];

        // Objeto que irá retornar as datas disponíveis para o usuário
        const available = schedule.map(time => {
            const [hour, minute] = time.split(':');

            // Possui as datas no formato 2020-03-20 08:00:00
            const value = setSeconds(
                setMinutes(setHours(searchDate, hour), minute),
                0
            );

            /**
             * time é a representação 08:00. value com a formatação modificada.
             * available - Verifica se o value é depois de agora e se o horário
             * não está marcado.
             */
            return {
                time,
                value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
                available:
                    isAfter(value, new Date()) &&
                    !appointments.find(a => format(a.date, 'HH:mm') === time),
            };
        });

        return res.json(available);
    }
}

export default new AvailableController();
