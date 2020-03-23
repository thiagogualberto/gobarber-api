import Sequelize, { Model } from 'sequelize';

class File extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                path: Sequelize.STRING,
                url: {
                    type: Sequelize.VIRTUAL,
                    get() {
                        // Campo url é para definir o caminho do file.
                        return `${process.env.APP_URL}/files/${this.path}`;
                    },
                },
            },
            {
                sequelize,
            }
        );

        // retornar o model que acabou de ser inicializado.
        return this;
    }
}

export default File;
