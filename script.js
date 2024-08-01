document.getElementById('conversationForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('recipient_id', document.getElementById('recipientId').value);
    formData.append('content', document.getElementById('message').value);
    formData.append('message_type', document.getElementById('message').value);
    
    const fileInput = document.getElementById('file');
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }
    
    try {
        const response = await fetch('https://intern-chat-backend-production-uy3j.onrender.com/collaborative_chat/direct_message/create_conversation', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiYzFhOWY0NWEtNDUyMS00IiwiaWF0IjoxNzIyNTE2NjY4LCJleHAiOjE3MjI1MzgyNjh9.kRSRf7_uD_1Kr5VAp0m5had3plDjmpUVtEer2oFiNso' // Replace with actual token
            }
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Conversation created successfully:', result);
            alert('Conversation created successfully!');
        } else {
            console.error('Error creating conversation:', result);
            alert('Error creating conversation: ' + result.error);
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error: ' + error.message);
    }
});
