import express from 'express';
import path from 'path';
import routes from './routes';

import './database';

class App {
    constructor() {
        this.server = express();

        this.middlewares();
        this.routes();
    }

    // Onde será cadastrado todos os middlewares da nossa aplicação.
    middlewares() {
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
    }
}

// Exportando uma nova instância de App.
export default new App().server;
