import { generate_user_id } from "../../src/core/config/utils.js";
import { prisma } from "../../src/core/db/index.js";
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const SUPERADMIN_COUNT = 3;
const ADMIN_COUNT = 5;
const AGENT_COUNT = 40 - SUPERADMIN_COUNT - ADMIN_COUNT;

async function createUsers(count, roleId) {
    for (let i = 0; i < count; i++) {
        await prisma.users.create({
            data: {
                id_user: generate_user_id(35),
                network_user: `BB${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                full_name: faker.person.fullName(),
                photo_url: faker.image.avatar(),
                dominio: faker.internet.domainName(),
                password: await bcrypt.hash("chat", 10),
                status_user: faker.datatype.boolean(),
                role_id: roleId,
            },
        });
    }
}

export async function generate_user() {
    

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

    // Create users for each role
    await createUsers(SUPERADMIN_COUNT, 1); // Superadmin
    await createUsers(ADMIN_COUNT, 2);      // Admin
    await createUsers(AGENT_COUNT, 3);      // Agent

    
}
