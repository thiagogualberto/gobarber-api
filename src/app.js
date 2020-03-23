import 'dotenv/config';

import express from 'express';
import path from 'path';
import Youch from 'youch';
import * as Sentry from '@sentry/node';

/**
 * Extensão para detectar erros nos trechos que utilizam async. Precisa vim antes
 * da importação das rotas.
 */
import 'express-async-errors';
import routes from './routes';
import sentryConfig from './config/sentry';

import './database';

class App {
    constructor() {
        this.server = express();

        Sentry.init(sentryConfig);

        this.middlewares();
        this.routes();
        this.exceptionHandler();
    }

    // Onde será cadastrado todos os middlewares da nossa aplicação.
    middlewares() {
        // Antes de todas as rotas
        this.server.use(Sentry.Handlers.requestHandler());
        this.server.use(express.json());

        // 1º parâmetro é a rota que irá servir estes arquivos estáticos
        // 2º é o resolve com os parâmetros de cada ramificação do caminho até o arquivo.
        this.server.use(
            '/files',
            express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
        );
    }

    routes() {
        // Rotas estão implementadas em routes.js
        this.server.use(routes);

        // Depois de todas as rotas
        this.server.use(Sentry.Handlers.errorHandler());
    }

    exceptionHandler() {
        // Middleware assíncrono de tratamento de excessão.
        this.server.use(async (err, req, res, next) => {
            if (process.env.NODE_END === 'development') {
                const errors = await new Youch(err, req).toJSON();

                return res.status(500).json(errors);
            }

            return res.status(500).json({ error: 'Internal server error.' });
        });
    }
}

// Exportando uma nova instância de App.
export default new App().server;
