import { generate_user_id } from "../../src/core/config/utils.js";
import {prisma} from "../../src/core/db/index.js"

export async function generate_user() {
    const users = [
        {  
            id_user:generate_user_id(15),
            network_user: 'winder',
            full_name:"Carlos Astaneatada",
            password: '$2b$10$nSZ7gYf0suy56ajxmEGWFedyGvI3OX73Nb4TL2fy2zM4uH1mUrgx6',
            role_id: 1,
        },
        {
            id_user:generate_user_id(15),
            network_user: 'braulio',
            full_name:"Elba Ginom",
            password: '$2b$10$nSZ7gYf0suy56ajxmEGWFedyGvI3OX73Nb4TL2fy2zM4uH1mUrgx6',
            role_id: 2,
        },
        {
            id_user:generate_user_id(15),
            network_user: 'sofi',
            full_name:" Sofia Mespia Elano",
            password: '$2b$10$nSZ7gYf0suy56ajxmEGWFedyGvI3OX73Nb4TL2fy2zM4uH1mUrgx6',
            role_id: 3,
        }
    ];
    
    for (let user of users) {
        await prisma.users.create({
            data: user
        });
    }
}

