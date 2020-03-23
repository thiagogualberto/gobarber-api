import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';

class Appointment extends Model {
    static init(sequelize) {
        // past - agendamentos de datas que ainda não passaram
        // cancelable - retorna se o agendamento é cancelável ou não.
        super.init(
            {
                date: Sequelize.DATE,
                canceled_at: Sequelize.DATE,
                past: {
                    type: Sequelize.VIRTUAL,
                    get() {
                        return isBefore(this.date, new Date());
                    },
                },
                cancelable: {
                    type: Sequelize.VIRTUAL,
                    get() {
                        return isBefore(new Date(), subHours(this.date, 2));
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

    // Tabela de appointment vai pertencer ao model de usuário
    // pq 1 usuário marcou o agendamento e 1 prestador  realizará o agendamento.
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        this.belongsTo(models.User, {
            foreignKey: 'provider_id',
            as: 'provider',
        });
    }
}

export default Appointment;
