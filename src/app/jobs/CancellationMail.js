import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

// Importa a classe de envio de email
import Mail from '../../lib/Mail';

class CancellationMail {
    // para cada job precisa de uma chave única. key faz isso.
    get key() {
        return 'CancellationMail';
    }

    /**
     * Tarefa que vai executar quando esse processo for executado
     * Ex.: Vai enviar 10 emails, o handle é chamado 10x.
     * Appointment é passado pelo parâmetro 'data'
     */
    async handle({ data }) {
        const { appointment } = data;

        // Informações do envio de e-mail
        await Mail.sendMail({
            to: `${appointment.provider.name} <${appointment.provider.email}>`,
            subject: 'Agendamento cancelado',
            template: 'cancellation',
            context: {
                provider: appointment.provider.name,
                user: appointment.user.name,
                date: format(
                    parseISO(appointment.date),
                    "'dia' dd 'de' MMMM', às' H:mm'h",
                    {
                        locale: pt,
                    }
                ),
            },
        });
    }
}

export default new CancellationMail();
