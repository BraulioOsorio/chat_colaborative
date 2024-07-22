import { Router } from "express";
import user_routes from "./user.routes.js";
import role_routes from "./role.routes.js"
import user_permi from "./user_permissions.routes.js"
import direct_message_routes from "./direct_messages.routes.js"
import channel_routes from "./channel.routes.js"
import permission_routes from "./permission.routes.js"
import history from "./history_maintenances.routes.js"
import auth from "./auth.routes.js"
import {validate_server} from '../core/config/utils.js'
import { authenticate_token } from '../middlewares/authenticate_token.js';

const root_router = Router()
root_router.use('/user',authenticate_token,validate_server,user_routes)
root_router.use('/role',authenticate_token,validate_server,role_routes)
root_router.use('/user_permission',authenticate_token,validate_server,user_permi)
root_router.use('/direct_message',authenticate_token,validate_server,direct_message_routes)
root_router.use('/channel', authenticate_token, validate_server,channel_routes)
root_router.use('/permission',authenticate_token,validate_server,permission_routes)
root_router.use('/history',authenticate_token,validate_server,history)
root_router.use('/auth',auth)
export default root_router;
