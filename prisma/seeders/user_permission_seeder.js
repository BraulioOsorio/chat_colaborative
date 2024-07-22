import {prisma} from "../../src/core/db/index.js"

export async function generate_user_permission() {
    const user = await prisma.users.findFirst({where:{role_id:3}})
    const user_permissions = [
        {
            permission_id:1,
            user_id: user.id_user,
        }
    ];

    for (let user_permi of user_permissions) {
        await prisma.user_permissions.create({
            data: user_permi,
        });
    }
    
}