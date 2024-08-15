import { prisma } from '../core/db/index.js';
import { extract_file_name, get_current_datetime } from '../core/config/utils.js';
import { io } from '../websocket.js';
import { create_room_key } from '../core/config/utils.js';
import { get_direct_messages } from '../core/checks/validations_direct_messages.js';
import { upload_middleware, upload_file_to_supabase, delete_file_from_supabase } from '../middlewares/authenticate_token.js';
import { STORAGE_URL } from '../core/config/config.js';
import { differenceInMinutes } from 'date-fns';
export const delete_message = async (req, res) => {
    try {
        let direct_message = await prisma.direct_message.findFirst({ where: { id_direct_message: +req.params.id } })
        if (req.user.id_user !== direct_message.send_id){return res.status(401).json({ error: 'El usuario no tiene permisos ' })};
        const minutes_Difference = differenceInMinutes(date_time, new Date(direct_message.created_at));
        if(minutes_Difference > 20){return res.status(401).json({ status: false,msg:"Tiempo para Actualización agotado" })}
        let message_deleted = await prisma.direct_message.delete({ where: { id_direct_message: +req.params.id } })
        const room_key = create_room_key(message_deleted.send_id, message_deleted.recipient_id)
        io.to(room_key).emit('conversation_delete_direct', message_deleted);
        if (message_deleted.url_file != null){await delete_file_from_supabase(extract_file_name(message_deleted.url_file))}
        res.json(message_deleted)
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error delete_message' });
    }
}

export const update_message = async (req, res) => {
    try {
        let date_time = get_current_datetime()
        let direct_message = await prisma.direct_message.findFirst({ where: { id_direct_message: +req.body.id_direct_message } })
        if (!direct_message) {return res.status(401).json({ error: 'El mensage no existe' });}
        if (req.user.id_user !== direct_message.send_id){return res.status(401).json({ error: 'El usuario no tiene permisos ' })};
        const minutes_Difference = differenceInMinutes(date_time, new Date(direct_message.created_at));
        if(minutes_Difference > 20){return res.status(401).json({ status: false,msg:"Tiempo para Actualización agotado" })}
        let message_updated = await prisma.direct_message.update({ where: { id_direct_message: +req.body.id_direct_message }, data: req.body })
        const room_key = create_room_key(message_updated.send_id, message_updated.recipient_id)
        const response = {
            ...message_updated, user:{full_name: req.user.full_name,photo_url:req.user.photo_url,user_id:req.user.id_user}
        };
        io.to(room_key).emit('conversation_update_direct', response);
        res.json(message_updated)
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error update_message' });
    }
}
export const get_conversations = async (id_user) => {
    try {
        const unique_senders_messages = await prisma.direct_message.findMany({
            where: {OR: [{ recipient_id: id_user }, { send_id: id_user, }]},
            orderBy: {created_at: 'desc'},
            distinct: ['send_id', 'recipient_id'],
            select: {
                send_id: true, recipient_id: true,content:true,created_at:true,users_send: { select: { full_name: true, network_user: true,photo_url:true } },users_receive: { select: { full_name: true, network_user: true,photo_url:true } }
            }
        });
        const unique_messages = [];
        const unique_pairs = {};
        unique_senders_messages.forEach(message => {
            const key1 = `${message.send_id}_${message.recipient_id}`;
            const key2 = `${message.recipient_id}_${message.send_id}`;
            if (!unique_pairs[key1] && !unique_pairs[key2]) {
                unique_pairs[key1] = true;
                unique_pairs[key2] = true;
                const isSender = message.send_id === id_user;
                const adjustedMessage = {
                    content: message.content,send_id: message.send_id,recipient_id: message.recipient_id,date:message.created_at,
                    user_send: isSender 
                        ? {
                            full_name: message.users_send.full_name,network_user: message.users_send.network_user,id_user: message.send_id
                        }: {
                            full_name: message.users_receive.full_name,network_user: message.users_receive.network_user,id_user: message.recipient_id 
                        },
                    user_recipient: isSender 
                        ? {
                            full_name: message.users_receive.full_name,network_user: message.users_receive.network_user,photo_url:message.users_receive.photo_url,id_user: message.recipient_id 
                        }: {
                            full_name: message.users_send.full_name, network_user: message.users_send.network_user,photo_url:message.users_send.photo_url,id_user: message.send_id
                        }
                };
                unique_messages.push(adjustedMessage);
            }
        });
        return unique_messages;
    } catch (error) {
        console.error('Error get_conversations:', error);
        return { error: "Hubo un error en get_conversations" }
    }
}

export const create_conversation = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            upload_middleware.single('file')(req, res, (err) => { 
                if (err) { return reject(err); }
                resolve();
            });
        });
        const file = req.file;
        let storage = null
        if (file) {
            const relative_file_path = await upload_file_to_supabase(file)
            storage = `${STORAGE_URL}${relative_file_path}`
        }
        let date_time = get_current_datetime()
        const get_messages_validator_exist = await get_messages_conversation(req.user.id_user, req.user.id_user, req.body.recipient_id)
        const conversation = await prisma.direct_message.create({ data: { ...req.body, send_id: req.user.id_user, created_at: date_time,url_file: storage} });
        const response = {
            ...conversation,user:{full_name: req.user.full_name,photo_url:req.user.photo_url,user_id:req.user.id_user}
        };
        const room_key = create_room_key(conversation.send_id, conversation.recipient_id)
        io.to(room_key).emit('new_conversation_direct', response);
        if (get_messages_validator_exist.length === 0) {
            const new_conversations_recipient = await get_conversations(req.body.recipient_id);
            const new_conversations_send = await get_conversations(req.user.id_user);
            io.to(req.body.recipient_id).emit('new_conversations', new_conversations_recipient);
            io.to(req.user.id_user).emit('new_conversations', new_conversations_send);
        }
        return res.json(conversation)
    } catch (error) {
        console.error('Error get_conversations:', error);
        return res.status(500).json({ error: 'Internal Server Error get_conversations' });
    }
}
export const get_messages_conversation = async (id_user, send_id, recipient_id) => {
    try {
        await get_direct_messages(send_id,recipient_id)
        let date_time = get_current_datetime()
        const conversation_messages = await prisma.direct_message.findMany({
            where: {
                OR: [
                    { send_id: recipient_id, recipient_id: id_user },{ send_id: id_user, recipient_id: recipient_id },
                    { send_id: send_id, recipient_id: id_user },{ send_id: id_user, recipient_id: send_id }]
            },
            orderBy: { created_at: 'asc' },
            select: {
                id_direct_message: true, send_id: true, recipient_id: true, content: true, url_file: true, type_message: true, created_at: true, updated_at: true,
                users_send: { select: { full_name: true,photo_url:true } },users_receive: { select: { full_name: true,photo_url:true } }
            }
        });
        if (!conversation_messages){return { error: 'Error al obtener los mensajes de la conversacion' }}
        const result = conversation_messages.map(message => {
            const minutes_Difference = differenceInMinutes(date_time, new Date(message.created_at));
            return {...message,position: message.send_id === id_user ? 'right' : 'left',recent: minutes_Difference <= 20
            };
        });
        return result
        
    } catch (error) {
        console.error('Error get_messages_conversation:', error);
        return { 'error': 'internal Server error get_messages_conversation' }
    }
}

export default {
    get_conversations,create_conversation,delete_message,update_message,get_messages_conversation
};