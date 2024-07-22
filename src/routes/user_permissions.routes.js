import { Router } from 'express';
import user_permissions from '../controllers/user_permissions.js';
import validations from '../core/checks/validations_user_permissions.js';

const router = Router();
router.post('/assign_permission/', validations.assign_permission_validation,user_permissions.assign_permission)
router.delete('/delete_user_permission/', validations.delete_user_permission_validation,user_permissions.delete_user_permissions)
router.put('/update_user_permission/:id', validations.update_user_permissions_validation, user_permissions.update_user_permissions)
router.post('/find_user_permission', user_permissions.find_user_permissions)
export default router;
