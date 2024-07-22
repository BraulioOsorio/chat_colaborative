import { Router } from 'express';
import validations from '../core/checks/validations_users.js';
import user_crud from '../controllers/users.js';

const router = Router();
router.get('/users',user_crud.get_users);
router.post('/create_user', validations.create_user_validation, user_crud.create_user);
router.get('/find_user/:id', validations.find_user_validation,user_crud.find_user);
router.get('/find_user_name/:network_user', validations.find_user_name_validation,user_crud.find_user_name);
router.put('/delete_user/:id', validations.delete_user_validation,user_crud.delete_user);
router.put('/update_user/:id', validations.update_user_validation,user_crud.update_user);
export default router;
