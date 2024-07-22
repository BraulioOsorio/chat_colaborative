import { body, param } from 'express-validator';
import { prisma } from '../db/index.js';

export const create_word_validation = [
  body('word').notEmpty().withMessage('El nombre del canal no puede estar vacío')
  .custom(async (value) => {
    const word = await prisma.vulgar_words.findFirst({ where:{word:{equals: value,mode: 'insensitive'}}});
    if (word) {throw new Error('la palabra ya existe')}
  }),
  
];

export const update_word_validation = [
  body('id')
    .custom(async (value) => {
      const vulgar_word = await prisma.vulgar_words.findUnique({ where: { id_vulgar_words: +value } });
      if (!vulgar_word) {throw new Error('La palabra con este id no existe')}
    }),
    body('word').notEmpty().withMessage('La palabra no puede estar vacia.')
];

export const delete_word_validation = [
  param('id')
    .custom(async (value) => {
      const vulgar_word = await prisma.vulgar_words.findUnique({ where: { id_vulgar_words: +value } });
      if (!vulgar_word) {throw new Error('La palabra con este id no existe')}
    })
];

export default {
  delete_word_validation,update_word_validation,create_word_validation
};
