import 'dotenv/config';
import express from "express";
import root_router from "./routes/index.routes.js";
import logger from "morgan";
import { createServer as create_server } from 'node:http';
import cors_config from "./core/config/cors_config.js";
import { cors_socket } from "./core/config/cors_socket.js";
import { PORT } from "./core/config/config.js";
import { initialize_web_socket } from './websocket.js';
import path from 'path';
import { connectRedis } from './core/config/redisClient.js';

// Crear instancia de la aplicación Express
const app = express();
const server = create_server(app);

// Configurar middleware
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(logger('dev'));
app.use(express.json());
app.use(cors_config);
app.use('/collaborative_chat', root_router);

// Inicializar WebSocket
initialize_web_socket(server, cors_socket);

// Función para iniciar el servidor después de conectar a Redis
const startServer = async () => {
    try {
        // Conectar a Redis
        await connectRedis();
        
        // Iniciar el servidor
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to Redis or starting server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
