import { prisma } from '../core/db/index.js';

export const get_permissions = async (req, res) => {
    try {
        console.log('get_permissions');
        console.log(req.user);
        
        if (req.user.role.name !== "SUPERADMIN" && req.user.role.name !== "ADMIN") {
            return res.status(403).json({ error: 'El usuario no tiene permisos' });
        }
        const permission_consult = await prisma.permissions.findMany();
        return res.json(permission_consult);
    } catch (error) {
        console.error('Error get_permissions:', error);
        return res.status(500).json({ error: 'Internal Server Error get_permissions' });
    }
}