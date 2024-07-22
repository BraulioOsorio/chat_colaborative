import { prisma } from '../core/db/index.js';

export const create_word = async (req, res) => {
    try {
        if(req.user.role.name === "ADMIN" || req.user.role.name === "AGENTE"){return res.status(401).json({ error: 'El usuario no tiene permiso' })}
        const new_word = await prisma.vulgar_words.create({data:req.body});
        return res.json(new_word);
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal Server Error create_user' });
    }
};

export const get_words = async (req, res) => {
    try {
        const words = await prisma.vulgar_words.findMany();
        return res.json(words)
    } catch (error) {
        console.error('Error get user:', error);
        return res.status(500).json({ error: 'Internal Server Error get_words' });
    }
}

// GET /api/usuarios?skip=2&take=15

export const find_word = async (req, res) => {
    try {
        if (req.user.role.name !== "SUPERADMIN"){return res.status(401).json({ error: 'El usuario no tiene permiso' })}
        const word = await prisma.vulgar_words.findFirst({where: {OR:[{ word: req.params.id },{ id_vulgar_words: +req.params.id}]}});
        if (!word) {return res.status(404).json({ error: 'word not found' })}
        res.json(word);
    } catch (error) {
        console.error('Error find word:', error);
        return res.status(500).json({ error: 'Internal Server Error find_word' });
    }
}

export const update_word = async (req, res) => {
    try {
        if (req.user.role.name !== "SUPERADMIN") {return res.status(401).json({ error: 'El usuario no tiene permiso' })}
        const word_update = await prisma.vulgar_words.update({where : {id_vulgar_words : req.body.id_vulgar_words},data:req.body})
        return res.json(word_update)
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error update_word' });
    }
}

export const delete_word = async (req, res) => {
    try {
        if (req.user.role.name !== "SUPERADMIN") {return res.status(401).json({ error: 'El usuario no tiene permiso' })}
        const word_delete = await prisma.users.delete({ where:{id_vulgar_words : req.params.id} });
        return res.json(word_delete)
    } catch (error) {
        console.error('Error delete user:', error);
        return res.status(500).json({ error: 'Internal Server Error delete_word' });
    }
}

export default {
    create_word,get_words,find_word,update_word,delete_word
};


