import Sequelize, { Model } from 'sequelize';

import bcrypt from 'bcryptjs';

class User extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                email: Sequelize.STRING,
                password: Sequelize.VIRTUAL,
                password_hash: Sequelize.STRING,
                provider: Sequelize.BOOLEAN,
            },
            {
                sequelize,
            }
        );

        // Executado antes de qualquer SAVE
        this.addHook('beforeSave', async user => {
            if (user.password) {
                user.password_hash = await bcrypt.hash(user.password, 8);
            }
        });

        // retornar o model que acabou de ser inicializado.
        return this;
    }

    // Recebe todos os models da aplicação
    static associate(models) {
        // belongsTo é um tipo de relacionamento.
        // models.File pertence ao model User.js pela chave estrangeira 'avatar_id'
        // Codenome para esse relacionamento se chama 'avatar'
        this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
    }

    // Verifica se as senhas batem
    checkPassword(password) {
        return bcrypt.compare(password, this.password_hash);
    }
}

export default User;
