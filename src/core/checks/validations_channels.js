import { body, param } from 'express-validator';
import { prisma } from '../db/index.js';

export const create_channels_validation = [
  body('name').notEmpty().withMessage('El nombre del canal no puede estar vacío'),
  body('description').optional().isString().withMessage('La descripción debe ser una cadena de texto'),
  body('image_channel').optional().isString().withMessage('La imagen debe ser una cadena de texto'),
  body('user_ids').isArray({ min: 1 }).withMessage('user_ids debe ser un arreglo con al menos un ID de usuario'),
  body('user_ids.*').isString().withMessage('Cada user_id debe ser una cadena de texto')
  .custom(async (id_user) => {
    const user = await prisma.users.findUnique({ where: { id_user }});
    if (!user) {throw new Error(`El usuario con ID ${id_user} no existe`);}
    return true;
  })
];

export const insert_users_channels_validation = [
  body('id_channel').isNumeric().notEmpty().withMessage('El ID no puede estar vacío o no es un número')
  .custom(async (value) => {
    const channel = await prisma.channels.findUnique({ where: { id_channel: +value } });
    if (!channel) {throw new Error('El canal con este ID no existe')}
  }),
  body('user_ids').isArray({ min: 1 }).withMessage('user_ids debe ser un arreglo con al menos un ID de usuario'),
  body('user_ids.*').isString().withMessage('Cada user_id debe ser una cadena de texto')
  .custom(async (id_user) => {
    const user = await prisma.users.findUnique({where: { id_user }});
    if (!user) {throw new Error(`El usuario con ID ${id_user} no existe`)}
    return true;
  })
  
];

export const update_channels_validation = [
  body('id_channel')
    .custom(async (value) => {
      const channel = await prisma.channels.findUnique({ where: { id_channel: +value } });
      if (!channel) { throw new Error('El canal con este ID no existe')}
    }),
  body('name').notEmpty().withMessage('El nombre no puede estar vacio'),
  body('description').optional(),
  body('image_channel').optional()
];

export const get_messages_validation = [
  body('id_channel')
    .custom(async (value) => {
      const channel = await prisma.channels.findUnique({ where: { id_channel: +value } });
      if (!channel)  {throw new Error('El canal con este ID no existe')}
    })
];

export const delete_channels_validation = [
  param('id')
    .custom(async (value) => {
      const channel = await prisma.channels.findUnique({ where: { id_channel: +value } });
      if (!channel) {throw new Error('El canal con este ID no existe');}
    })
];

export const send_message_validation = [
  body('channel_id')
    .custom(async (value) => {
      const channel = await prisma.channels.findUnique({ where: { id_channel: +value } });
      if (!channel) {throw new Error('El canal con este ID no existe')}
    }),
    body('content').notEmpty().withMessage('El campo no puede estar vacio'),
    body('url_file').optional(),
    body('type_message').optional(),
];

export const update_message_validation = [
  body('id_message')
    .custom(async (value) => {
      const message = await prisma.messages.findUnique({ where: { id_message: +value } });
      if (!message) {throw new Error('El mensaje con ese ID no existe')}
    }),
    body('content').notEmpty().withMessage('El contenido no puede estar vacio')
];

export const delete_message_validation = [
  body('id_message')
    .custom(async (value) => {
      const message = await prisma.messages.findUnique({ where: { id_message: +value } });
      if (!message) {throw new Error('El mensaje con ese ID no existe')}
    })
];

export const find_channels_validation = [
  param('id')
    .custom(async (value) => {
      const channel = await prisma.channels.findUnique({ where: { id_channel: +value } });
      if (!channel) {throw new Error('El canal con este ID no existe')}
    })
];

export default {
  send_message_validation,find_channels_validation,create_channels_validation,update_channels_validation,update_message_validation,
  delete_channels_validation,delete_message_validation,get_messages_validation,insert_users_channels_validation
};
