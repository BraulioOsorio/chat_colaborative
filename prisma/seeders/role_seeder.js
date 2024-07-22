    import {prisma} from "../../src/core/db/index.js"

    export async function generate_role() {
        const roles = [
            {
                name: "SUPERADMIN"
            },
            {
                name: "ADMIN"
            },
            {
                name: "AGENTE"
            },
        ];

        for (let role of roles) {
            await prisma.roles.create({
                data: role,
            });
        }
        
    }