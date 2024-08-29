document.addEventListener('DOMContentLoaded', () => {
    const messagesDiv = document.getElementById('messages');
    const tokenInfoDiv = document.getElementById('tokenInfo');

    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiYzFhOWY0NWEtNDUyMS00IiiaWF0IjoxNzI0OTM3NTk4LCJleHAiOjE3MjQ5Mzc5NTh9.gH31c0hcS50I2hTjiZiZpPSKbQTx0LtRrVNIXkzzFcQ'; // Reemplaza con el token JWT válido
    const userId = 'c1a9f45a-4521-4'; // Reemplaza con el ID del usuario
    const recipientId = "413553d5-03a1-4"; // Reemplaza con el ID del destinatario

    // Conectar al WebSocket
    const socket = io('https://intern-chat-backend-production-uy3j.onrender.com/');

    // Unirse al canal de mensajes directos
    socket.emit('direct_message', { send_id: recipientId, recipient_id: userId, token });

    // Escuchar mensajes de la conversación
    socket.on('get_direct_messages', (messages) => {
        messages.forEach((message) => {
            // Crear un div para cada mensaje
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', message.position); // Agrega una clase según la posición ('right' o 'left')

            // Contenido del mensaje
            messageDiv.innerHTML = `
                <p><strong>${message.users_send.full_name}:</strong> ${message.content}</p>
                <p><em>Enviado el: ${new Date(message.created_at).toLocaleString()}</em></p>
            `;
            messagesDiv.appendChild(messageDiv); // Agregar el mensaje al div de mensajes
        });
    });

    // Escuchar token renovado
    socket.on('token_renewed', (data) => {
        console.log("h ",data);
        
        console.log('Nuevo Token:', data.token_new); // Imprime el nuevo token en la consola
        tokenInfoDiv.innerText = `Token Renovado: ${data.token_new}`;
    });
    socket.on('error', (error) => {
        console.error('Error:', error.message); // Imprime el mensaje de error en la consola
        tokenInfoDiv.innerText = `Error: ${error.message}`; // Muestra el mensaje de error en la página
    });
});
