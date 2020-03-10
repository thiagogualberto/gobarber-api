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
        this.mongoConnection = mongoose.connect(
            'mongodb://192.168.99.100:27017/gobarber',
            { useNewUrlParser: true, useFindAndModify: true }
        );
    }
}

export default new Database();
