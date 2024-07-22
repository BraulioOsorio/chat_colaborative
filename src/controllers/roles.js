import { prisma } from '../core/db/index.js';

export const get_roles = async (req, res) => {
    try {
        if (req.user.role.name !== "SUPERADMIN") {return res.status(401).json({ error: 'El usuario no tiene permisos' })}
        const role_consult = await prisma.roles.findMany({include:{ role_permission:{select:{Permissions:true} }}});
        return res.json(role_consult)
    } catch (error) {
        console.error('Error get roles:', error);
        return res.status(500).json({ error: 'Internal Server Error get_roles' });
    }
}
