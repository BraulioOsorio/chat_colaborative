import { Server } from "socket.io";
import { get_messages } from './controllers/channels.js';
import { authenticate_token_messages } from './middlewares/authenticate_token.js';
import { get_messages_conversation, get_conversations } from "./controllers/direct_message.js";
import { create_room_key } from "./core/config/utils.js";

let io;
// esta función se encarga de manejar la autenticación de los sockets, incluyendo la renovación de tokens
const handleAuthentication = async (socket, token, callback) => {
    try {
        authenticate_token_messages({ headers: { authorization: `Bearer ${token}` } }, null, async (response, user, newToken) => {
            if (response && response.error) {
                console.log('Authentication error:', response.error);
                socket.emit('error', { message: response.error });
                return;
            }
            
            socket.join(user.id_user);
            
            if (newToken) {
                socket.emit('token_renewed', { token_new: newToken });
            }
            
            await callback(user);
        });
    } catch (error) {
        console.error('Error in authentication:', error);
        socket.emit('error', { message: 'Autenticación fallida' });
    }
};
// esta función se encarga de manejar los eventos de los sockets, incluyendo la respuesta a los errores
const handleEvent = async (socket, eventName, dataCallback) => {
    try {
        const result = await dataCallback();
        if (result.error) {
            socket.emit('error', { message: result.error });
        } else {
            socket.emit(eventName, result);
        }
    } catch (error) {
        console.error(`Error in ${eventName}:`, error);
        socket.emit('error', { message: `Error al procesar ${eventName}` });
    }
};

const initialize_web_socket = (server, cors_socket) => {
    io = new Server(server, cors_socket);

    io.on('connection', (socket) => {
        socket.on('join_channel', async ({ channelId, token }) => {
            await handleAuthentication(socket, token, async (user) => {
                await handleEvent(socket, 'messages_channel', async () => {
                    const result = await get_messages(channelId, user);
                    socket.join(channelId);
                    return result.messages;
                });
            });
        });

        socket.on('direct_message', async ({ send_id, recipient_id, token }) => {
            await handleAuthentication(socket, token, async (user) => {
                const room_key = create_room_key(send_id, recipient_id);
                await handleEvent(socket, 'get_direct_messages', async () => {
                    const result = await get_messages_conversation(user.id_user, send_id, recipient_id);
                    socket.join(room_key);
                    return result;
                });
            });
        });

        socket.on('get_conversations', async ({ token }) => {
            await handleAuthentication(socket, token, async (user) => {
                await handleEvent(socket, 'conversations', async () => {
                    return await get_conversations(user.id_user);
                });
            });
        });
    });
};

export { initialize_web_socket, io };