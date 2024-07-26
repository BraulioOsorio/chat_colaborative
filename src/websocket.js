import { Server } from "socket.io";
import { get_messages } from './controllers/channels.js';
import { authenticate_token_messages } from './middlewares/authenticate_token.js';
import { get_messages_conversation } from "./controllers/direct_message.js";
import { create_room_key } from "./core/config/utils.js";
import { get_conversations } from "./controllers/direct_message.js";

let io;
const initialize_web_socket  = (server, cors_socket) => {
    io = new Server(server, cors_socket);
    io.on('connection', (socket) => {
        //socket.setMaxListeners(20);
        //socket.on('disconnect', () => {console.log('Client disconnected');});
        socket.on('join_channel', async ({ channelId, token }) => {
            try {
                authenticate_token_messages({ headers: { authorization: `Bearer ${token}` } }, null, async (error, user) => {
                    if (error) {return socket.emit('error', { message: error })}
                    const result = await get_messages(channelId, user);
                    if (result.error) {
                        socket.emit('error', { message: result.error });
                    } else {
                        socket.emit('messages_channel', result.messages);
                    }
                    socket.join(channelId);
                    
                });
            } catch (error) {
                console.error('Error in authentication or fetching messages:', error);
                socket.emit('error', { message: 'Autenticación fallida o error al obtener mensajes'});
            }
        });

        socket.on('direct_message', async ({ send_id,recipient_id, token }) => {
            try {
                const room_key = create_room_key(send_id, recipient_id);
                authenticate_token_messages({ headers: { authorization: `Bearer ${token}` } }, null, async (error, user) => {
                    if (error) {return socket.emit('error', { message: error })}
                    const result = await get_messages_conversation(user.id_user,send_id,recipient_id);
                    if (result.error) {
                        socket.emit('error', { message: result.error });
                    } else {
                        socket.emit('get_direct_messages', result)
                    }
                    socket.join(room_key);
                    
                });
            } catch (error) {
                console.error('Error in authentication or fetching messages:', error);
                socket.emit('error', { message: 'Autenticación fallida o error al obtener mensajes' });
            }
        });

        socket.on('get_conversations', async ({ token }) => {
            try {
                authenticate_token_messages({ headers: { authorization: `Bearer ${token}` } },null, async (error, user) => {
                    if (error) {return socket.emit('error', { message: error });}
                    const result = await get_conversations(user.id_user);
                    if (result.error) {
                        socket.emit('error', { message: result.error });
                    } else {
                        socket.emit('conversations', result); 
                    }
                    socket.join(user.id_user);
                    
                });
            } catch (error) {
                console.error('Error in authentication or fetching messages:', error);
                socket.emit('error', { message: 'Autenticación fallida o error al obtener mensajes' });
            }
        });
    });
};

export { initialize_web_socket, io };
