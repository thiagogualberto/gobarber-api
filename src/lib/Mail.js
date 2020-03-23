import nodemailer from 'nodemailer';
import { resolve } from 'path';

import exphbs from 'express-handlebars';
import nodemailerhbs from 'nodemailer-express-handlebars';

import mailConfig from '../config/mail';

class Mail {
    constructor() {
        const { host, port, secure, auth } = mailConfig;

        // Cria conexão com serviço externo para enviar e-mail
        // Utiliza configurações do mailConfig
        // Só envia e-mail se o usuário estiver autenticado(auth.user)
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: auth.user ? auth : null,
        });

        this.configureTemplates();
    }

    configureTemplates() {
        // Define caminho para onde estará os templates
        const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');

        /**
         * .use para adicionar configuração no transporter.
         * 'compile' é como que compila/formata os templates de email.
         * nodemailer-express-handlebars age sobre o 'compile' do nodemailer.
         */
        this.transporter.use(
            'compile',
            nodemailerhbs({
                viewEngine: exphbs.create({
                    layoutsDir: resolve(viewPath, 'layouts'),
                    partialsDir: resolve(viewPath, 'partials'),
                    defaultLayout: 'default',
                    extname: '.hbs',
                }),
                viewPath,
                extName: '.hbs',
            })
        );
    }

    // Responsável por enviar o e-mail
    // Pega o conteúdo do mailConfig + message e envia.
    sendMail(message) {
        return this.transporter.sendMail({
            ...mailConfig.default,
            ...message,
        });
    }
}

export default new Mail();
