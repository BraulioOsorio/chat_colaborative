import jwt from 'jsonwebtoken';
import { prisma } from '../core/db/index.js';
import { SECRET_KEY, SUPABASE_KEY, SUPABASE_URL } from '../core/config/config.js';
import { create_access_token } from '../core/config/utils.js';
import tokens from '../controllers/tokens.js'
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../websocket.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const upload = multer({
  storage: multer.memoryStorage(),
});
export const upload_file_to_supabase = async (file) => {
  const file_name = `${uuidv4()}_${file.originalname}`;
  const { data, error } = await supabase.storage
      .from('Storage Chat Internal')
      .upload(file_name, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
      });
  if (error) {
      throw new Error(error.message);
  }
  return file_name;
};
export const delete_file_from_supabase = async (file_name) => {
  try {
    const { error } = await supabase.storage
      .from('Storage Chat Internal') 
      .remove([file_name]);
    if (error) {throw new Error(`Error deleting file: ${error.message}`)}
  } catch (error) {
    console.error('Error deleting file:', error.message);
  }
};
export const authenticate_token = async (req, res, next) => {
  const auth_header = req.headers['authorization'];
  const token = auth_header && auth_header.split(' ')[1];
  if (!token) {return res.status(401).json({ error: 'Token no proporcionado' })}
  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        await tokens.delete_token(token);
        return res.status(401).json({ error: 'Token expirado' });
      } else {
        return res.status(403).json({ error: 'Token inválido' });
      }
    }
    const now = Math.floor(Date.now() / 1000);
    const time_until_expiration = decoded.exp - now;
    const user = await prisma.users.findFirst({ where: { id_user: decoded.id_user }, include: { role_permission: { include: { Permissions: true } }, role: true } });
    if ( time_until_expiration >=0 && time_until_expiration <= 5 * 60) { 
      const token_new = create_access_token(user.id_user,false);
      await tokens.update_token(token,token_new);
      return res.json({msg:"token now" ,success: true, token_new });
    }
    if (!user || !user.status_user) {
      const errorMessage = !user ? 'Usuario no encontrado' : 'Usuario inactivo';
      return res.status(!user ? 401 : 403).json({ error: errorMessage });
    }
    req.user = user;
    next();
  });
};

export const authenticate_token_messages = async (req,res,next) => {
  const auth_header = req.headers['authorization'];
  const token = auth_header && auth_header.split(' ')[1];
  if (!token) {return next('Token no proporcionado')}
  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        await tokens.delete_token(token);
        return next('Token expirado');
        user.TokenExpired = true;
      } else {
        return next('Token inválido');
      }
    }
    const now = Math.floor(Date.now() / 1000);
    const time_until_expiration = decoded.exp - now;
    const user = await prisma.users.findFirst({ where: { id_user: decoded.id_user }, include: { role_permission: { include: { Permissions: true } }, role: true } });
    if ( time_until_expiration >=0 && time_until_expiration <= 5 * 60) { 
      const token_new = create_access_token(user.id_user,false);
      await tokens.update_token(token,token_new);
      user.newToken = token_new;
    }
    if (!user || !user.status_user) {
      const errorMessage = !user ? 'Usuario no encontrado' : 'Usuario inactivo';
      return next(errorMessage);
    }
    return next(null, user); 
  });
};

export const upload_middleware = upload;

export default upload;
