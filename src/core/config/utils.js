import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from './config.js';
import {validationResult} from "express-validator";
import { register_token } from '../../controllers/tokens.js';
import { redisClient } from './redisClient.js';

import { DateTime } from 'luxon';
export const get_current_datetime = () => {
    let now = DateTime.now().setZone('America/Bogota').toFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    return now;
};

export const generate_user_id = (length) => {
    const randomString = uuidv4().slice(0, length);
    return randomString;
}

export const create_access_token = (user_id,status) => {
    const jwt_token = jwt.sign({ id_user: user_id }, SECRET_KEY, { expiresIn: '7m' })
    if(status){register_token(jwt_token,user_id)}
    return jwt_token
}

export const validate_server = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {return res.status(400).json({ errors: errors.array()});}
    next();
};

export function create_room_key(id1, id2) {
    const sortedIds = [id1, id2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
}
export function extract_file_name(url) {
    const last_segment = url.split('Internal/')[1]; 
    const file_name = last_segment ? last_segment.split('/').pop() : null;
    return decodeURIComponent(file_name);
}

export const cacheData = async (key, data, expirationTime = 300) => {
    try {
        await redisClient.set(key, JSON.stringify(data), 'EX', expirationTime);
    } catch (error) {
        console.error('Error al guardar en cache:', error);
    }
};

export const getCachedData = async (key) => {
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
};

export const deleteCachedData = async (key) => {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error('Error al eliminar del cache:', error);
    }
};

export const clearCache = async () => {
    try {
        await redisClient.del('*');
        console.log('Cache limpiado');
    } catch (error) {
        console.error('Error al limpiar el cache:', error);
    }
};

export const allCacheKeys = async () => {
    try {
        const keys = await redisClient.keys('*');
        console.log('Llaves en el cache:', keys);
        return keys;
    } catch (error) {
        console.error('Error al obtener las llaves del cache:', error);
    }
};
export default {generate_user_id,create_access_token};
