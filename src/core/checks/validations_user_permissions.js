import { body, param } from 'express-validator';
import { prisma } from '../db/index.js';

export const assign_permission_validation = [
  body('permissions').isArray({ min: 1 }).withMessage('permissions debe ser un arreglo con al menos un elemento'),
  body('permissions.*.permission_id').notEmpty().withMessage('Se requiere el ID de permiso')
    .isInt().withMessage('El ID de permiso debe ser un número entero')
    .custom(async (value) => {
      const permission = await prisma.permissions.findUnique({ where: { id_permission: +value } });
      if (!permission) {throw new Error('El permiso con este ID no existe')}
    }),
  body('permissions.*.user_id')
    .notEmpty().withMessage('Se requiere el ID de usuario')
    .custom(async (value) => {
      const user = await prisma.users.findUnique({ where: { id_user: value } });
      if (!user) {throw new Error('El usuario con este ID no existe')}
    }),
  body('permissions')
    .custom(async (value) => {
      for (let i = 0; i < value.length; i++) {
        const { permission_id, user_id } = value[i];
        const existing_register = await prisma.user_permissions.findFirst({where: { permission_id, user_id }});
        if (existing_register) {throw new Error(`La combinación de permission_id ${permission_id} y user_id ${user_id} ya existe`)}
      }
      return true;
    })
];

export const delete_user_permission_validation = [
  body('ids').isArray({ min: 1 }).withMessage('ids debe ser un arreglo con al menos un elemento'),
  body('ids.*').notEmpty().withMessage('Se requiere el ID de user_permission')
    .isInt().withMessage('El ID de user_permission debe ser un número entero')
    .custom(async (value) => {
      const user_permission = await prisma.user_permissions.findUnique({ where: { id_user_permission: +value } });
      if (!user_permission) {throw new Error(`El user_permission con ID ${value} no existe`)}
    })
];

export const update_user_permissions_validation = [
  param('id')
    .custom(async (value) => {
      const user_permission = await prisma.user_permissions.findUnique({ where: { id_user_permission: +value } });
      if (!user_permission) {throw new Error('El user_permission con este ID no existe')}
    }),
  body('permission_id').notEmpty().withMessage('Se requiere el ID de permiso').isInt().withMessage('El ID de permiso debe ser un número entero')
    .custom(async (value) => {
      const permission = await prisma.permissions.findUnique({ where: { id_permission: +value } });
      if (!permission) {throw new Error('El permiso con este ID no existe')}
    }),
  body('user_id').optional().notEmpty().withMessage('Se requiere el ID de usuario')
    .custom(async (value) => {
      const user = await prisma.users.findUnique({ where: { id_user: value } });
      if (!user) {throw new Error('El usuario con este ID no existe')}
    })
];

export default {
  assign_permission_validation,delete_user_permission_validation,update_user_permissions_validation
};
