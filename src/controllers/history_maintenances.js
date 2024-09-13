import { get_current_datetime } from '../core/config/utils.js';
import { prisma } from '../core/db/index.js';

export const delete_group_messages = async (req, res) => {
    try {
        const channel_find = await prisma.channels.findUnique({where:{id_channel:+req.body.id_channel}})
        if (req.user.role.name !== "ADMIN") {return res.status(403).json({ error: 'El usuario no tiene permiso' })}
        const find_user_admin = await prisma.channels.findMany({ where: { users_channels: { some: { user_id: req.user.id_user } } } });
        const is_user_in_channel = find_user_admin.some(channel => channel.id_channel === channel_find.id_channel);
        if (!is_user_in_channel) {return res.status(403).json({ error: 'El usuario no tiene acceso a este canal' })}
        let start_date = new Date(req.body.start_date);
        let end_date = new Date(req.body.end_date);
        start_date.setUTCHours(0, 0, 0, 0);
        end_date.setUTCHours(23, 59, 59, 999);
        await prisma.messages.deleteMany({
            where: {
                channel_id: channel_find.id_channel,
                AND: [{ created_at: { gte: start_date.toISOString() } },{ created_at: { lte: end_date.toISOString()}}]
            }
        });
        const history = await prisma.history_maintenances.create({data:{
            date_maintenance: get_current_datetime(),user_id:req.user.id_user,
            description:`Se borraron los mensajes del grupo ${channel_find.name} entre las fechas ${start_date.toISOString()} y ${end_date.toISOString()}. `
        }})
        res.json(history)
    } catch (error) {
        console.error('Error delete_group_messages:', error);
        return res.status(500).json({ error: 'Internal Server Error delete_group_messages' });
    }
};

export const group_deletion_information = async (description,user_id) => {
    let date_time =  get_current_datetime()
    await prisma.history_maintenances.create({data:{date_maintenance:date_time,description:description,user_id:user_id}})
}
export const get_history_maintenances = async (req, res) => {
    try {
        if (req.user.role.name !== "SUPERADMIN"){return res.status(403).json({ error: 'El usuario no tiene permiso' })} 
        const maintenance = await prisma.history_maintenances.findMany();
        if (!maintenance) {return res.status(404).json({ error: 'Mantenimiento no encontrado' })}
        res.json(maintenance);
    } catch (error) {
        console.error('Error find maintenance:', error);
        return res.status(500).json({ error: 'Internal Server Error find_maintenance' });
    }
}


export default {
    delete_group_messages,get_history_maintenances
};
