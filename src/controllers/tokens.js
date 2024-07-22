import { prisma } from '../core/db/index.js';

export const register_token = async (token,user_id) => {
    try {await prisma.tokens.create({data:{token:token,user_id:user_id}})} 
    catch (error) {
        console.error('Error register_token:', error);
    }
};

export const update_token = async (token_old,token_new) => {
    try {
        const token_find = await prisma.tokens.findFirst({ where: { token: token_old } });
        if (!token_find){return "token invalido"} 
        await prisma.tokens.update({where:{id_token : token_find.id_token},data:{token : token_new}})
    } catch (error) {
        console.error('Error update token:', error);
    }
}

export const delete_token = async (token) => {
    try {
        const token_find = await prisma.tokens.findFirst({ where: { token: token } });
        if (!token_find){return false}
        await prisma.tokens.delete({where:{id_token : token_find.id_token}})
        return true
    } catch (error) {
        console.error('Error delete_token:', error);
    }
}

export default {
    register_token,update_token,delete_token
};
