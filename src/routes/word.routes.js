import { Router } from 'express';
import validations from '../core/checks/validations_words.js';
import { authenticate_token } from '../middlewares/authenticate_token.js';
import word_crud from '../controllers/words.js';
import {validate_server} from '../core/config/utils.js'

const router = Router();
router.get('/words', authenticate_token,word_crud.get_words);
router.post('/create_word', authenticate_token, validate_server, validations.create_word_validation, word_crud.create_word)
router.get('/find_word/:id', authenticate_token, validate_server,word_crud.find_word);
router.delete('/delete_word/:id', authenticate_token, validate_server, validations.delete_word_validation,word_crud.delete_word);
router.post('/update_word', authenticate_token, validate_server, validations.update_word_validation,word_crud.update_word);
export default router;
