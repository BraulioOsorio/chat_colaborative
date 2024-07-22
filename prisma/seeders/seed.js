import {prisma} from "../../src/core/db/index.js"
import { generate_permission } from "./permission_seeder.js";
import { generate_role } from "./role_seeder.js";
import { generate_user } from "./user_seeder.js";
import { generate_user_permission } from "./user_permission_seeder.js";
async function main() {
    await generate_role()
    await generate_permission()
    await generate_user()
    await generate_user_permission()
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
