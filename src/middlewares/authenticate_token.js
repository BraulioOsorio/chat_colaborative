import jwt from 'jsonwebtoken';
import { prisma } from '../core/db/index.js';
import { SECRET_KEY, SUPABASE_URL, SUPABASE_KEY } from '../core/config/config.js';
import { create_access_token } from '../core/config/utils.js';
import tokens from '../controllers/tokens.js';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const upload = multer({
  storage: multer.memoryStorage(),
});
export const upload_file_to_supabase = async (file) => {
  const file_name = `${uuidv4()}\\${file.originalname}`;
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

async function baseAuthenticate(token) {
  if (!token) {
    return { error: 'Token no proporcionado' };
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = decoded.exp - now;
    
    const user = await prisma.users.findFirst({ 
      where: { id_user: decoded.id_user }, 
      include: { role_permission: { include: { Permissions: true } }, role: true } 
    });

    if (!user || !user.status_user) {
      const errorMessage = !user ? 'Usuario no encontrado' : 'Usuario inactivo';
      return { error: errorMessage };
    }

    let newToken = null;
    if (timeUntilExpiration >= 0 && timeUntilExpiration <= 5 * 60) {
      newToken = create_access_token(user.id_user, false);
      await tokens.update_token(token, newToken);
    }

    return { user, newToken };
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      await tokens.delete_token(token);
      return { error: 'Token expirado' };
    } else {
      return { error: 'Token inválido' };
    }
  }
}

export const authenticate_token = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  const result = await baseAuthenticate(token);

  if (result.error) {
    return res.status(401).json({ error: result.error });
  }

  if (result.newToken) {
    res.setHeader('New-Token', result.newToken);
    res.setHeader('Access-Control-Expose-Headers', 'New-Token');
    console.log('New token API:', result.newToken);
  }

  req.user = result.user;
  console.log('req.token', req.newToken);
  
  next();
};


export const authenticate_token_messages = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  const result = await baseAuthenticate(token);

  if (result.error) {
    return next({ error: result.error, id_user: result.id_user });
  }

  if (result.newToken) {
    console.log('New token websocket:', result.newToken);
    return next(null, result.user, result.newToken);
  }

  next(null, result.user);
};
export const upload_middleware = upload;
export default upload;
