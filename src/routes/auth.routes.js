import { Router } from "express";
import { create_access_token, validate_server } from '../core/config/utils.js';
import { compareSync } from "bcrypt";
import { delete_token } from '../controllers/tokens.js';
import { login_information } from "../controllers/users.js";
import { login_validation } from "../core/checks/validations_users.js";
import { authenticate_token } from "../middlewares/authenticate_token.js";

const router = Router();

router.post('/login', login_validation, validate_server, async (req, res) => {
  const { network_user, password } = req.body;
  try {
    const login_result = await login_information(network_user);
    if (!login_result){return res.status(401).json({ error: 'Credenciales incorrectas, no encontrado' })};
    const { user, user_data } = login_result;
    const isMatch = user ? compareSync(password, user.password) : false;
    if (!user || !isMatch || !user.status_user) {
      const errorMessage = !user ? 'Credenciales incorrectas, no encontrado' : !isMatch ? 'Credenciales incorrectas,verifique sus datos' : 'Usuario inactivo';
      const statusCode = !user || !isMatch ? 401 : 403;
      return res.status(statusCode).json({ error: errorMessage });
    }
    const token = create_access_token(user.id_user, true);
    res.json({ success: true, user: user_data, permissions: user.role_permission, role: user.role.name, token });
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/logout',authenticate_token ,async (req, res) => {
  const auth_header = req.headers['authorization'];
  const token = auth_header && auth_header.split(' ')[1];
  if (!token) {return res.json({ status: false, msg: "Se encontró un error, token no proporcionado" })};
  let result = await delete_token(token);
  if (result) {return res.json({ status: true, msg: "Sesión cerrada con éxito" })}
  res.json({ status: false, msg: "Hubo un problema al cerrar la sesión" });
});

export default router