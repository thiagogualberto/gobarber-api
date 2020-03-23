import Bee from 'bee-queue';

// Importa o job CancellationMail
import CancellationMail from '../app/jobs/CancellationMail';
import redisConfig from '../config/redis';

/**
 * Toda vez que tiver um novo job, ele deve ser add neste vetor.
 * Pra cada um desses jobs cria uma fila e dentro da fila armazena o
 * bee(instância que conecta com o redis) e o handle(processa a fila).
 */
const jobs = [CancellationMail];

class Queue {
    constructor() {
        /**
         * Cada tipo de backgroundjobs terá uma fila.
         * Exemplo: Envio de cancelamento de e-mail, uma fila; e-mail de
         * recuperação de senha, outra fila, ...
         */
        this.queues = {};

        // Inicialização das filas
        this.init();
    }

    init() {
        /**
         * Inicializa a fila.
         * Passa infos dos jobs. key e handle estão em CancellationMail.js
         * Pega os jobs da aplicação e insere no vetor queues
         */
        jobs.forEach(({ key, handle }) => {
            this.queues[key] = {
                bee: new Bee(key, {
                    redis: redisConfig,
                }),
                handle,
            };
        });
    }

    /**
     * Add um novo item (job) dentro da fila (queue)
     */
    add(queue, job) {
        return this.queues[queue].bee.createJob(job).save();
    }

    /**
     * Processa as filas.
     * Processa os jobs em tempo real
     */
    processQueue() {
        jobs.forEach(job => {
            // Infos da fila relacionada a um respectivo job
            const { bee, handle } = this.queues[job.key];

            // Pega a fila e dá um process nela; e pega o handle
            bee.on('failed', this.handleFailure).process(handle);
        });
    }

    // Tratar falhas nas filas
    // job.queue.name = nome da fila
    handleFailure(job, err) {
        console.log(`Queue ${job.queue.name}: FAILED`, err);
    }
}

export default new Queue();
