/* Importando bibliotecas úteis para o upload de arquvios para o servidor: */

import multer from 'multer';

// Biblioteca padrão do nodeJS utilizada para gerar caracteres aleatórios, ...
import crypto from 'crypto';

// extname - retorna baseada no nome de um arquivo a extensao dele
// resolve - percorrer o caminho dentro da minha aplicação
import { extname, resolve } from 'path';

// storage - como multer vai guardar os nossos arquivos de imagem
// destination - onde a imagem será salva.
// filename - formatar o nome de arquivo da nossa imagem
export default {
    storage: multer.diskStorage({
        destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
        filename: (req, file, cb) => {
            crypto.randomBytes(16, (err, res) => {
                if (err) return cb(err);

                return cb(
                    null,
                    res.toString('hex') + extname(file.originalname)
                );
            });
        },
    }),
};
