import { get_current_datetime } from '../core/config/utils.js';
import { prisma } from '../core/db/index.js';
import { group_deletion_information } from './history_maintenances.js';
import { io } from '../websocket.js';

export const create_channel = async (req,res) => {
    try {
        let date_time = get_current_datetime()
        if (req.user.role.name !== "ADMIN") 
            return res.status(401).json({ error: 'El usuario no tiene permiso' });

        const { name, description, user_ids } = req.body;

        const all_user_ids = [req.user.id_user, ...user_ids];

        const new_channel = await prisma.channels.create({
            data: { name, description,created_at:date_time }
        });

        const user_channels_data = all_user_ids.map(user_id => ({
            user_id,
            channel_id: new_channel.id_channel
        }));

        await prisma.users_channels.createMany({
            data: user_channels_data
        });

        return res.json(new_channel);
    } catch (error) {
        console.error('Error al crear un canal:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};


export const get_channels = async (req, res) => {
    try {
        let channel = await prisma.channels.findMany({ where: { users_channels: { some: { user_id: req.user.id_user } } }, select: { id_channel: true, name: true } });

        return res.json(channel)
    } catch (error) {
        console.error('Error get_channels:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}


export const update_channel = async (req, res) => {
    try {
        if (req.user.role.name !== "ADMIN") 
            return res.status(401).json({ error: 'El usuario no tiene permisos' })

        let channel_update = await prisma.channels.update({ where: { id_channel:+req.body.id_channel }, data: req.body });
        return res.json(channel_update)
    } catch (error) {
        console.error('Error updating channel:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }

}

export const delete_channel = async (req, res) => {
    try {
        if (req.user.role.name !== "ADMIN") 
            return res.status(401).json({ error: 'El usuario no tiene permisos' })
        
        const find_user_admin = await prisma.channels.findMany({ where: { users_channels: { some: { user_id: req.user.id_user } } } });
        const is_user_in_channel = find_user_admin.some(channel => channel.id_channel === +req.params.id);

        if (!is_user_in_channel) {
            return res.status(403).json({ error: 'User does not have access to this channel' });
        }

        await prisma.users_channels.deleteMany({where:{channel_id:+req.params.id } })
        const channel_delete = await prisma.channels.update({where:{ id_channel:+req.params.id},data:{status_channel: false}})
        await group_deletion_information(`Canal borrado: ${channel_delete.name} `,req.user.id_user)
        return res.json(channel_delete)
    } catch (error) {
        console.error('Error delete_channel :', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export const insert_users_channel = async (req, res) => {
    try {
        if (req.user.role.name !== "ADMIN") 
            return res.status(401).json({ error: 'El usuario no tiene permiso' });
        
        const { id_channel, user_ids } = req.body;
        
        const user_channels_data = user_ids.map(user_id => ({
            user_id,
            channel_id: id_channel
        }));

        const inserts = await prisma.users_channels.createMany({
            data:user_channels_data
        });

        return res.json({status:true,inserts,msg:"insertados con éxito"});
    } catch (error) {
        console.error('Error creating insert_users_channel:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const get_channel_users = async (req, res) => {
    try {
        const { id } = req.params;
        const channel_users = await prisma.users_channels.findMany({where: { channel_id: +id},select: {users: {select: {id_user: true,full_name: true}}}});
        return res.json(channel_users);
    } catch (error) {
        console.error('Error get_channel_users:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export const get_messages = async (channelId,user) => {
    try {

        const channel_messages = await prisma.channels.findUnique({ where: { id_channel: +channelId },
            select: {id_channel: true,name: true,description: true,messages: {select: {
                id_message: true,user_id: true,content: true,url_file: true,type_message: true,created_at: true,users: {select: {full_name: true}}
                }
            }
            }
        });
        
        if (!channel_messages) {
            return { error: 'El canal con este ID no existe' };
        }

        if (channel_messages.messages.length == 0) {
            return { error: 'No hay mensajes disponibles en este canal' };
        }
        const formatted_essages = channel_messages.messages.map(message => ({
            ...message,
            position: message.user_id === user.id_user ? 'right' : 'left'
          }));
          
          const result = {
            ...channel_messages,
            messages: formatted_essages
          };  
        return result;
    } catch (error) {
        console.error('Error get_messages:', error);
        return { error: 'Error interno del servidor' };
    }
}

export const send_message = async (req,res) => {
    try {
        const user_channel = await prisma.users_channels.findFirst({ where: { user_id: req.user.id_user, channel_id: +req.body.channel_id } });

        if (!user_channel)
            return res.status(401).json({ error: 'El usuario no pertenece al canal' });

        const permissions_names = req.user.role_permission.map(rp => rp.Permissions.name);
        if (!permissions_names.includes("ENVIAR_MENSAJE") && req.user.role.name == "AGENTE")
            return res.status(401).json({ error: 'No tiene permisos' });


        const vulgar_words = await prisma.vulgar_words.findMany();
        const vulgar_words_set = new Set(vulgar_words.map(vw => vw.word.toLowerCase()));

        const censor_message = (content) => {
            return content.split(' ').map(word => {
                return vulgar_words_set.has(word.toLowerCase()) ? '*'.repeat(word.length) : word;
            }).join(' ');
        };

        const censored_content = censor_message(req.body.content);
        const message_sent = await prisma.messages.create({ data: {...req.body,content: censored_content, user_id: req.user.id_user } });

        const response = {
            ...message_sent,
            full_name: req.user.full_name
        };

        io.to(req.body.channel_id).emit('new_message_channel', response);

        return res.json(message_sent);
    } catch (error) {
        console.error('Error send_message:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export const edit_message = async (req,res) => {
    try {
        const user_message = await prisma.messages.findUnique({where:{id_message:+req.body.id_message,user_id:req.user.id_user}})
        if (!user_message)
            return res.status(401).json({ status: false,msg:"no tiene permisos de editar otro msg " });


        const vulgar_words = await prisma.vulgar_words.findMany();
        const vulgar_words_set = new Set(vulgar_words.map(vw => vw.word.toLowerCase()));

        const censor_message = (content) => {
            return content.split(' ').map(word => {
                return vulgar_words_set.has(word.toLowerCase()) ? '*'.repeat(word.length) : word;
            }).join(' ');
        };

        const censored_content = censor_message(req.body.content);
         const message_sent = await prisma.messages.update({where: { id_message: +req.body.id_message },data: {...req.body,content: censored_content}});

        const response = {
            ...message_sent,
            full_name: req.user.full_name,
        };

        io.to(message_sent.channel_id).emit('update_message_channel', response);

        return res.json(message_sent);
    } catch (error) {
        console.error('Error edit_message:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export const delete_message = async (req,res) => {
    try {
        const user_message = await prisma.messages.findUnique({where:{id_message:+req.body.id_message,user_id:req.user.id_user}})
        if (!user_message)
            return res.status(401).json({ status: false,msg:"no tiene permisos de borrar otro msg " });

        const message_delete = await prisma.messages.delete({where:{id_message:+req.body.id_message}})

        const response = {
            ...message_delete,
            full_name: req.user.full_name,
        };

        io.to(message_delete.channel_id).emit('delete_message_channel', response);

        return res.json(message_delete);
    } catch (error) {
        console.error('Error delete_message:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export default {
    create_channel,
    delete_channel,
    update_channel,
    delete_message,
    get_channels,
    get_messages,
    edit_message,
    send_message,
    insert_users_channel,
    get_channel_users
};
