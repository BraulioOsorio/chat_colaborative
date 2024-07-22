import { body } from 'express-validator';
import { prisma } from '../db/index.js';

export const create_role_permissions_validation = [
  body('permission_id').notEmpty().withMessage('El ID de permiso es requerido')
    .custom(async (permission_id) => {
      const existing_permission = await prisma.permissions.findUnique({ where: { id_permission: permission_id } });
      if (!existing_permission) {throw new Error(`El permiso con este ID ${permission_id} no existe`)}
    }),
  body('role_id').notEmpty().withMessage('El ID de rol es requerido')
    .custom(async (role_id) => {
      const existing_role = await prisma.roles.findUnique({ where: { role_id: role_id } });
      if (!existing_role) {throw new Error(`El rol con este ID ${role_id} no existe`)}
    })
];
