import {prisma} from "../../src/core/db/index.js"

export async function generate_permission() {
    const permissions = [
        {
            name: "LEER"
        },
        {
            name: "ENVIAR_MENSAJE"
        },
        {
            name: "EDITAR_MENSAJE"
        },
        {
            name: "ELIMINAR_MENSAJE"
        },
        {
            name: "ENVIAR_DOCUMENTO"
        },
    ];

    for (let permission of permissions) {
        await prisma.permissions.create({
            data: permission,
        });
    }
    
}