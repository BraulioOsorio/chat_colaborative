import { Router } from 'express';
import validations from '../core/checks/validations_direct_messages.js';
import direct_msg_crud from '../controllers/direct_message.js';

const router = Router();
router.post('/create_conversation', validations.create_direct_validation, direct_msg_crud.create_conversation)
router.delete('/delete_conversation/:id', validations.delete_direct_validation, direct_msg_crud.delete_message)
router.post('/update_conversation',validations.update_direct_validation ,direct_msg_crud.update_message)
export default router;
