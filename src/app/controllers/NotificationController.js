import User from '../models/User';
import Notification from '../schemas/Notification';

class NotificationController {
    async index(req, res) {
        // Checa se o usuário logado é um prestador de serviços
        const checkIsProvider = await User.findOne({
            where: {
                id: req.userId,
                provider: true,
            },
        });

        if (!checkIsProvider) {
            return res
                .status(401)
                .json({ error: 'Only provider can load notifications.' });
        }

        // Listar as notificações ordenadas por data e limitado a 20.
        // Métodos diferentes por usar MongoDB(schemas)
        const notifications = await Notification.find({
            user: req.userId,
        })
            .sort({ createdAt: 'desc' })
            .limit(20);

        return res.json(notifications);
    }

    async update(req, res) {
        /**
         * Atualiza a notificação para lida.
         * new: true | Depois de atualizar é retornado a nova notificação
         * atualizada para ser listada
         */
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        return res.json(notification);
    }
}

export default new NotificationController();
