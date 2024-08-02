document.getElementById('conversationForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('recipientId').value);
    formData.append('description', document.getElementById('message').value);
    formData.append('user_ids',["413553d5-03a1-4","2f7b3610-48da-4155-aaa9-13f8f622cc1"]);
    console.log(formData);
    const fileInput = document.getElementById('file');
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }
    
    try {
        const response = await fetch('http://localhost:3000/collaborative_chat/channel/create_channel', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiYzFhOWY0NWEtNDUyMS00IiwiaWF0IjoxNzIyNjA2NzgyLCJleHAiOjE3MjI2MjgzODJ9.1iPyHLb7y0JVNr0buW_7wgWRBmLC-FouwlA3YOUHPmw' // Replace with actual token
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
