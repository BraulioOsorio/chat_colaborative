document.getElementById('conversationForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('user_id', document.getElementById('recipientId').value);
    formData.append('content', document.getElementById('message').value);
    formData.append('channel_id',4);
    
    const fileInput = document.getElementById('file');
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }
    
    try {
        const response = await fetch('http://localhost:3000/collaborative_chat/channel/send_message', {
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
