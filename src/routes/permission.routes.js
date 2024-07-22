import { Router } from 'express';
import { get_permissions } from '../controllers/permissions.js';

const router = Router();
router.get('/permissions',get_permissions);
export default router;
