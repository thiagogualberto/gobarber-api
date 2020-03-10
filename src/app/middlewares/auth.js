import jwt from 'jsonwebtoken';

/*  promisify - Pega uma função de callback e transforma em uma função de
    maneira a utilizá-la com async/await */
import { promisify } from 'util';

import authConfig from '../../config/auth';

// Middleware de autenticação
export default async (req, res, next) => {
    // Buscar o Header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token not provided.' });
    }

    const [, token] = authHeader.split(' ');

    try {
        // decoded possui o valor retornado de jwt.verify. Infos de quando o token foi gerado.
        const decoded = await promisify(jwt.verify)(token, authConfig.secret);

        req.userId = decoded.id;

        return next();
    } catch (err) {
        // Token inválido
        return res.status(401).json({ error: 'Token invalid' });
    }
};
