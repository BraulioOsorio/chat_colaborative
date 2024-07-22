import { Router } from 'express';
import history_maintenances from '../controllers/history_maintenances.js';
import { delete_messages_group } from '../core/checks/validations_maintenances.js';

const router = Router();
router.post('/delete_group_messages', delete_messages_group, history_maintenances.delete_group_messages)
router.get('/get_history',history_maintenances.get_history_maintenances)
export default router;
