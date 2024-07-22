import { body, param } from 'express-validator';
import { prisma } from '../db/index.js';

export const create_direct_validation = [
  body('recipient_id').notEmpty().withMessage('El recipient_id no puede estar vacío')
  .custom(async (value) => {
    const user = await prisma.users.findUnique({ where: { id_user: value } });
    if (!user) {throw new Error('El usuario destinatario con este ID no existe');}
  }),
  body('content').notEmpty().withMessage('El contenido no puede estar vacío'),
  body('url_file').optional(),
  body('message_type').optional()
];

export const update_direct_validation = [
  body('content').notEmpty().withMessage('El contenido no puede estar vacío')
];

export const delete_direct_validation = [
  param('id')
    .custom(async (value) => {
      const direct_message = await prisma.direct_message.findUnique({ where: { id_direct_message: +value } });
      if (!direct_message) {throw new Error('El mensaje con este ID no existe')}
    })
];


export const get_direct_messages = async (send_id,recipient_id)=>{
      const direct_message_send = await prisma.direct_message.findFirst({ where: { OR: [{ send_id: send_id }, { recipient_id: send_id }] } });
      if (!direct_message_send) {return { error: 'El mensaje directo con este ID send no existe' }}
      const direct_message_recipiend = await prisma.direct_message.findFirst({ where: { OR: [{ send_id: recipient_id }, { recipient_id: recipient_id }] } });
      if (!direct_message_recipiend) { return { error: 'El mensaje directo con este ID recipient no existe' }}
}

export default {
  create_direct_validation,delete_direct_validation,update_direct_validation
};
