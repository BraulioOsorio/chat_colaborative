import { prisma } from '../core/db/index.js';
import { redisClient } from '../core/config/redisClient.js';

export const assign_permission = async (req, res) => {    
    try {
        if (req.user.role.name !== "ADMIN" && req.user.role.name !== "SUPERADMIN"){return res.status(401).json({ error: 'El usuario no tiene permiso' })}
        const permissions = req.body.permissions;
        const created_permissions = [];
        for (const permission of permissions) {
            const new_permission = await prisma.user_permissions.create({data: permission});
            created_permissions.push(new_permission);
        }
        return res.json(created_permissions);
    } catch (error) {
        console.error('Error assigning permissions:', error);
        return res.status(500).json({ error: 'Internal Server Error assigning permissions' });
    }
};

export const update_user_permissions = async (req, res) => {
    try {
        if (req.user.role.name !== "ADMIN" && req.user.role.name !== "SUPERADMIN"){return res.status(401).json({ error: 'El usuario no tiene permiso' })}
        return res.json(await prisma.user_permissions.update({data:req.body ,where:{id_user_permission:+req.params.id}}))
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error update_user_permissions' });
    }
}

export const find_user_permissions = async (req, res) => {
    try {

        const cachedPermissions = await redisClient.get(`permissions:${req.body.id_user}`);
        if (cachedPermissions) {
            return res.json(JSON.parse(cachedPermissions));
        }
        const user = await prisma.users.findFirst({
            where: { id_user:req.body.id_user }, select: {
                id_user: true,role_permission: { select: { Permissions: { select: { name: true} } ,id_user_permission:true} },
            }
        });
        if (!user) {return res.status(404).json({ error: 'Usuario no encontrado' })}
        await redisClient.set(`permissions:${req.body.id_user}`, JSON.stringify(user), 'EX', 3600); // Expira en 1 hora
        res.json(user);
    } catch (error) {
        console.error('Error find user:', error);
        return res.status(500).json({ error: 'Internal Server Error find_user' });
    }
}

export const delete_user_permissions = async (req, res) => {
    try {
        if (req.user.role.name !== "ADMIN" && req.user.role.name !== "SUPERADMIN") {return res.status(401).json({ error: 'El usuario no tiene permiso' })}
        const { ids } = req.body;
        const deleted_permissions = [];
        for (const id of ids) {
            const deleted_permission = await prisma.user_permissions.delete({ where: { id_user_permission: id }});
            deleted_permissions.push(deleted_permission);
        }
        return res.json(deleted_permissions);
    } catch (error) {
        console.error('Error deleting user permissions:', error);
        return res.status(500).json({ error: 'Internal Server Error deleting user permissions' });
    }
};

export default {
    assign_permission,update_user_permissions,delete_user_permissions,find_user_permissions
};
