import { body, param } from 'express-validator';
import { prisma } from '../db/index.js';

export const validate_role = async (req, res) => {
  let id_user_proccess = null;
  const user_find = await prisma.users.findUnique({ where: { id_user: req.params.id }, include: { role: true } });
  if (req.user.role.name === "SUPERADMIN" || req.user.id_user === req.params.id && (req.user.role.name === "AGENTE" || req.user.role.name === "ADMIN")) {
    id_user_proccess = req.params.id;
  } else if (req.user.role.name === "ADMIN") {
    if (user_find.role.name === "AGENTE") {
      id_user_proccess = req.params.id;
    } else {
      return res.status(401).json({ error: 'El usuario no es agente y no puede ser actualizado' })
    }
  } else {
    return res.status(401).json({ error: 'El usuario no tiene permisos' })
  }
  return user_find;
}

export const create_user_validation = [
  body('network_user').notEmpty().withMessage('El usuario de red es requerido'),
  body('full_name').notEmpty().withMessage('El nombre completo es requerido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  body('role_id').optional()
    .custom(async (value) => {
      const role = await prisma.roles.findUnique({ where: { id_role: +value } });
      if (!role) { throw new Error('El rol con este ID no existe')}
    })
];

export const login_validation = [
  body('network_user').notEmpty().withMessage('El usuario de red es requerido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

export const find_user_validation = [
  param('id')
    .custom(async (value) => {
      const user = await prisma.users.findUnique({ where: { id_user: value } });
      if (!user) {throw new Error('El usuario con este ID no existe')}
    })
];

export const find_user_name_validation = [
  param('network_user').notEmpty().withMessage('El usuario de red no puede estar vacío')
  .matches(/^[a-zA-Z0-9]+$/).withMessage('El usuario de red solo puede contener letras y números')
];

export const delete_user_validation = [
  param('id')
    .custom(async (value) => {
      const user = await prisma.users.findUnique({ where: { id_user: value } });
      if (!user) {throw new Error('El usuario con este ID no existe')}
    })
];

export const update_user_validation = [
  param('id')
    .custom(async (value) => {
      const user = await prisma.users.findUnique({ where: { id_user: value } });
      if (!user) {throw new Error('El usuario con este ID no existe')}
    }),
  body('network_user').notEmpty().withMessage('El usuario de red no puede estar vacío'),
  body('full_name').notEmpty().withMessage('El nombre completo no puede estar vacío'),
  body('photo_url').optional(),
  body('dominio').optional(),
  body('password').optional(),
  body('role_id').isInt().optional().withMessage('El ID de rol debe ser un número entero')
    .custom(async (value) => {
      if (value !== undefined) {
        const role = await prisma.roles.findUnique({ where: { id_role: value } });
        if (!role) {throw new Error('El rol con este ID no existe')}
      }
    })
];

export default {
  create_user_validation,find_user_validation,delete_user_validation,update_user_validation,find_user_name_validation,login_validation
};
