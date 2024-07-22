import { Router } from 'express';
import validations from '../core/checks/validations_channels.js';
import channels_crud from '../controllers/channels.js';

const router = Router();
router.get('/channels', channels_crud.get_channels)
router.get('/user_channels/:id', validations.find_channels_validation,channels_crud.get_channel_users)
router.post('/create_channel', validations.create_channels_validation, channels_crud.create_channel)
router.post('/insert_users_channel', validations.insert_users_channels_validation, channels_crud.insert_users_channel)
router.put('/delete_channel/:id', validations.delete_channels_validation, channels_crud.delete_channel)
router.post('/update_channel', validations.update_channels_validation, channels_crud.update_channel)
router.post('/send_message',validations.send_message_validation, channels_crud.send_message)
router.post('/update_message',validations.update_message_validation, channels_crud.edit_message)
router.post('/delete_message',validations.delete_message_validation, channels_crud.delete_message)
export default router;
