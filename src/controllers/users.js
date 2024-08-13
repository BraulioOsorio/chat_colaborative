import { prisma } from '../core/db/index.js';
import {hashSync} from 'bcrypt';
import { validate_role } from '../core/checks/validations_users.js';
import { extract_file_name, generate_user_id } from '../core/config/utils.js';
import { upload_middleware, upload_file_to_supabase, delete_file_from_supabase } from '../middlewares/authenticate_token.js';
import { STORAGE_URL } from '../core/config/config.js';

export const create_user = async (req, res) => {
    let id_rol = null;
    await new Promise((resolve, reject) => {
        upload_middleware.single('file')(req, res, (err) => { 
            if (err) { return reject(err); }
            resolve();
        });
    });
    const file = req.file;
    let storage = "https://oaywoxchdfphlozkwgwx.supabase.co/storage/v1/object/public/Storage%20Chat%20Internal/default.png"
    if (file) {
        const relative_file_path = await upload_file_to_supabase(file)
        storage = `${STORAGE_URL}${relative_file_path}`
    }
    try {
        if (req.user.role.name === "ADMIN") {
            id_rol = 3;
        } else if (req.user.role.name === "SUPERADMIN") { 
            id_rol = req.body.role_id === 2 ? 2 : 3;
        } else {
            return res.status(401).json({ error: 'El usuario no tiene permiso' });
        }
        const new_user = await prisma.users.create({data: { ...req.body, id_user: generate_user_id(35), password: hashSync(req.body.password, 10), role_id: id_rol,photo_url:storage}});
        if(id_rol ===3){await prisma.user_permissions.create({data:{permission_id:1 ,user_id:new_user.id_user }})}
        return res.json(new_user);
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal Server Error create_user' });
    }
};

export const login_information = async (network_user) => {
    try {
        const user = await prisma.users.findFirst({
            where: { network_user: {equals: network_user,mode: 'insensitive'}}, select: {
                id_user: true, password: true, full_name: true, network_user: true, photo_url: true, status_user: true, role: true,
                role_permission: { select: { Permissions: { select: { name: true } } } }
            }
        });
        if(!user){return null}
        let user_data = {id_user:user.id_user,network_user: user.network_user,full_name: user.full_name,photo_url: user.photo_url}
        return { user,user_data };
    } catch (error) {
        console.error('Error login_information:', error);
        throw error;
    }
}

export const get_users = async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const skip = (page - 1) * limit;
        let users,total_users;
        if (req.user.role.name === "SUPERADMIN") {
            users = await prisma.users.findMany({skip: skip,take: limit,include: {role: true,tokens: true}});
            total_users = await prisma.users.count(); 
        } else if (req.user.role.name === "ADMIN") {
            users = await prisma.users.findMany({ skip:skip, take:limit, where: { role: { name: "AGENTE" } }, include: { role: true } })
            total_users = await prisma.users.count({where:{role:{name:"AGENTE"}}}); 
        }else{
            return res.status(401).json({ error: 'El usuario no tiene permisos' })    
        }
        const total_pages = Math.ceil(total_users / limit);
        if (limit > total_pages) {return res.status(400).json({ error: `La página solicitada (${page}) excede el número total de páginas (${total_pages})` })}
        return res.json({page,limit,total_pages,total_users,users});
    } catch (error) {
        console.error('Error get user:', error);
        return res.status(500).json({ error: 'Internal Server Error get_users' });
    }
}

export const find_user = async (req, res) => {
    try {
        if (req.user.role.name === "AGENTE"){return res.status(401).json({ error: 'El usuario no tiene permiso' })}    
        const user = await prisma.users.findUnique({ where: { id_user: req.params.id } });
        if (!user) {return res.status(404).json({ error: 'Usuario no encontrado' })}
        res.json(user);
    } catch (error) {
        console.error('Error find user:', error);
        return res.status(500).json({ error: 'Internal Server Error find_user' });
    }
}

export const find_user_name = async (req, res) => {
    try {
        const user = await prisma.users.findFirst({ where: { network_user: req.params.network_user } });
        if (!user) {return res.status(404).json({ error: 'Usuario no encontrado' })}
        res.json(user);
    } catch (error) {
        console.error('Error find user:', error);
        return res.status(500).json({ error: 'Internal Server Error find_user' });
    }
}

export const update_user = async (req, res) => {
    try {
        let find_user_proccess = await validate_role(req, res);
        if (!find_user_proccess || !find_user_proccess.id_user) {return find_user_proccess}
        let user_update = null;
        let id_user_update = find_user_proccess.id_user;
        if ((req.user.role.name === "AGENTE" && req.body.role_id) || (req.user.role.name === "ADMIN" && req.body.role_id) ){return res.status(401).json({ error: 'No puede actualizar su rol' })}
        if (req.body.password) {
            const hashed_password = await bcrypt.hash(req.body.password, 10);
            user_update = await prisma.users.update({ where: { id_user: id_user_update }, data: { ...req.body, password: hashed_password } });
        } else {
            user_update = await prisma.users.update({ where: { id_user: id_user_update }, data: req.body });
        }
        return res.json(user_update)
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error update_user' });
    }
}

export const delete_user = async (req, res) => {
    try {
        let find_user_proccess = await validate_role(req, res);
        if (!find_user_proccess || !find_user_proccess.id_user) {return find_user_proccess}
        let id_user_delete = find_user_proccess.id_user;
        let user_status = find_user_proccess.status_user;
        const user_delete = await prisma.users.update({ where: { id_user: id_user_delete }, data: { status_user: user_status = user_status ? false : true } });
        await delete_file_from_supabase(extract_file_name(user_delete.photo_url))
        if (user_delete.photo_url != null){await delete_file_from_supabase(extract_file_name(user_delete.photo_url))}
        return res.json(user_delete)
    } catch (error) {
        console.error('Error delete user:', error);
        return res.status(500).json({ error: 'Internal Server Error delete_user' });
    }
}

export default {
    create_user,delete_user,update_user,get_users,find_user,find_user_name,login_information
};


