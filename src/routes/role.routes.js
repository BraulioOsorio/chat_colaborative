import { Router } from 'express';
import { get_roles } from '../controllers/roles.js';

const router = Router();
router.get('/roles', get_roles);
export default router;
