document.addEventListener('DOMContentLoaded', () => {
    const messagesDiv = document.getElementById('messages');
    const tokenInfoDiv = document.getElementById('tokenInfo');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');

    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiYzFhOWY0NWEtNDUyMS00IiwiaWF0IjoxNzI0ODQ5NTExLCJleHAiOjE3MjQ4NzExMTF9.KCuOZOsIbHpNTyIGdX11yf7TN3kVtc1-rreheSbVXp4'; // Reemplaza con el token JWT válido
    const userId = 'c1a9f45a-4521-4'; // Reemplaza con el ID del usuario
    const rescipient_id = "413553d5-03a1-4"

    // Conectar al WebSocket
    const socket = io('https://intern-chat-backend-production-uy3j.onrender.com/');

    // Unirse al canal de mensajes directos
    socket.emit('direct_message', {send_id : rescipient_id ,recipient_id: userId, token });

    // Escuchar mensajes de la conversación
    socket.on('get_direct_messages', (messages) => {
        messages.forEach((message) => {
            console.log('Message:', message);
        });
    });

    // Escuchar token renovado
    socket.on('token_renewed', (data) => {
        tokenInfoDiv.innerText = `Token Renovado: ${data.token_new}`;
    });

});
