import jwt from 'jsonwebtoken';
import { prisma } from '../core/db/index.js';
import { SECRET_KEY } from '../core/config/config.js';
import { create_access_token } from '../core/config/utils.js';
import tokens from '../controllers/tokens.js'
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.mimetype.startsWith('image/') ? 'public/uploads/images' : 'public/uploads/documents';
    cb(null, path.join(process.cwd(), dir)); 
},
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension); 
    const formattedName = `${timestamp}(${baseName})${extension}`; 
    cb(null, formattedName);
  }
});

const upload = multer({ storage });

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
    if ( time_until_expiration >=0 && time_until_expiration <= 15 * 60) { 
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
      return {token_new };
    }
    if (!user || !user.status_user) {
      const errorMessage = !user ? 'Usuario no encontrado' : 'Usuario inactivo';
      return next(errorMessage);
    }
    return next(null, user); 
  });
};

export const uploadMiddleware = upload;

export default upload;
