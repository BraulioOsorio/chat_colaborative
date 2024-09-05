import { createClient } from 'redis';
import { REDIS_PASSWORD, REDIS_HOST, REDIS_PORT } from './config.js';

const redisClient = createClient({
    password: REDIS_PASSWORD,
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
    }
});
// Manejar errores de conexión
redisClient.on('error', (err) => console.log('Error de Redis', err));

// Conectar al cliente Redis
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Conectado a Redis');
    } catch (err) {
        console.error('Error al conectar a Redis:', err);
    }
};

export { redisClient, connectRedis };
