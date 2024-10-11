import { generate_user_id } from "../../src/core/config/utils.js";
import { prisma } from "../../src/core/db/index.js";
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const USERS_TO_CREATE = 10;
const SALT_ROUNDS = 10;

export async function generate_user() {
    console.log('Starting to seed users...');

    const roles = await Promise.all([
        prisma.roles.upsert({
            where: { id_role: 1 },
            update: {},
            create: { id_role: 1, name: 'SUPERADMIN' },
        }),
        prisma.roles.upsert({
            where: { id_role: 2 },
            update: {},
            create: { id_role: 2, name: 'ADMIN' },
        }),
        prisma.roles.upsert({
            where: { id_role: 3 },
            update: {},
            create: { id_role: 3, name: 'AGENTE' },
        }),
    ]);

    const existingUsers = [
        {  
            id_user: generate_user_id(35),
            network_user: 'winder',
            full_name: "Carlos Astaneatada",
            password: '$2b$10$nSZ7gYf0suy56ajxmEGWFedyGvI3OX73Nb4TL2fy2zM4uH1mUrgx6',
            role_id: 1,
        },
        {
            id_user: generate_user_id(35),
            network_user: 'braulio',
            full_name: "Elba Ginom",
            password: '$2b$10$nSZ7gYf0suy56ajxmEGWFedyGvI3OX73Nb4TL2fy2zM4uH1mUrgx6',
            role_id: 2,
        },
        {
            id_user: generate_user_id(35),
            network_user: 'sofi',
            full_name: " Sofia Mespia Elano",
            password: '$2b$10$nSZ7gYf0suy56ajxmEGWFedyGvI3OX73Nb4TL2fy2zM4uH1mUrgx6',
            role_id: 3,
        }
    ];
    
    for (let user of existingUsers) {
        await prisma.users.create({
            data: user
        });
    }

    for (let i = 0; i < USERS_TO_CREATE; i++) {
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        
        await prisma.users.create({
            data: {
                id_user: generate_user_id(35),
                network_user: faker.internet.userName(),
                full_name: faker.person.fullName(),
                photo_url: faker.image.avatar(),
                dominio: faker.internet.domainName(),
                password: await bcrypt.hash("chat", SALT_ROUNDS),
                status_user: faker.datatype.boolean(),
                role_id: randomRole.id_role,
            },
        });
    }

    console.log('User seeding finished.');
}

