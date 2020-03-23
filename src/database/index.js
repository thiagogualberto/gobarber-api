// Faz a conexão com o banco
import Sequelize from 'sequelize';
import mongoose from 'mongoose';

// Models da aplicação
import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

// Configurações do Banco de Dados
import databaseConfig from '../config/database';

// Vetor com todos os models da aplicação
const models = [User, File, Appointment];

class Database {
    constructor() {
        this.init();
        this.mongo();
    }

    // Conecta a base de dados e carrega os models
    init() {
        this.connection = new Sequelize(databaseConfig);

        // Percorre cada model da aplicação.
        models
            .map(model => model.init(this.connection))
            .map(
                model =>
                    model.associate && model.associate(this.connection.models)
            );
    }

    mongo() {
        // useNewUrlParser: true | por causa do formato da url abaixo utilizada
        /**
         * useFindAndModify: true | configuração do mongo para a maneira que será
         *                          utilizado na hora de encontrando e modificando registros.
         */

        this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useFindAndModify: true,
            useUnifiedTopology: true,
        });
    }
}

export default new Database();
