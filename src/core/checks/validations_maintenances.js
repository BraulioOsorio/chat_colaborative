import { body } from 'express-validator';
import { prisma } from '../db/index.js';

const truncateTimeToUTC = (date) => {
    const truncatedDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    return truncatedDate;
};

export const create_maintenance_validation = [
    body('description').notEmpty().withMessage('La descripción no puede estar vacía')
        .isString().withMessage('La descripción debe ser una cadena de texto'),
    body('user_id').notEmpty().withMessage('Se requiere el ID de usuario')
        .custom(async (value) => {
            const user = await prisma.users.findUnique({ where: { id_user: value } });
            if (!user) {throw new Error('El user_id con este ID no existe')}
        }),
    body('date_maintenance').notEmpty().withMessage('La fecha de mantenimiento no puede estar vacía')
        .isISO8601().toDate().withMessage('La fecha debe estar en formato ISO8601'),
];


export const delete_messages_group = [
    body('end_date').notEmpty().withMessage('La fecha actual no puede estar vacía')
        .isISO8601().toDate().withMessage('La fecha actual debe estar en formato ISO8601')
        .custom((value) => {
            const current_date = truncateTimeToUTC(new Date());
            const end_date = truncateTimeToUTC(new Date(value));
            if (end_date > current_date) {throw new Error('La fecha actual no puede estar en el futuro')}
            return true;
        }),
    body('start_date').notEmpty().withMessage('La última fecha no puede estar vacía')
        .isISO8601().toDate().withMessage('La última fecha debe estar en formato ISO8601')
        .custom(async (value, { req }) => {
            const { id_channel } = req.body;
            const message = await prisma.messages.findFirst({ where: { channel_id: id_channel }, orderBy: { created_at: 'asc' } });
            if (message) {
                const input_date = truncateTimeToUTC(new Date(value));
                const message_date = truncateTimeToUTC(new Date(message.created_at));
                if (input_date < message_date) {throw new Error('La fecha de inicio no puede ser anterior a la fecha de creación del mensaje más antiguo en el canal especificado')}
            }
            return true;
        }),
];
