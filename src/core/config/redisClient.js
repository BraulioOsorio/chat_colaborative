import { createClient } from 'redis';

// URL de Redis proporcionada por Render
const redisUrlRender = 'rediss://red-crc63bqj1k6c738hcpk0:A05cKBHRMt2R7iN5Xvn9MFLVsjashs0q@oregon-redis.render.com:6379';

const redisClient = createClient({
    password: 'N1bHkywu5IKl87rXDeyXFWBKxCxemJ02',
    socket: {
        host: 'redis-10380.c281.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 10380
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

// Exportar el cliente y la función de conexión
export { redisClient, connectRedis };
