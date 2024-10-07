const pusherKey = 'dc5a0ea4d253b93c8df7'; // Replace with your Pusher app key
const pusherCluster = 'ap2'; // Replace with your Pusher cluster
const channelName = 'chat-channel';

const params = new URLSearchParams(window.location.search);
const roomID = params.get('rc');
const nickname = params.get('nickname');

// Initialize Pusher
const pusher = new Pusher(pusherKey, {
    cluster: pusherCluster
});

// Subscribe to the channel
const channel = pusher.subscribe(channelName);

// Event listener for receiving messages
channel.bind('message-sent', function(data) {
    const msgData = data;
    const messageDiv = document.createElement("div");
    messageDiv.textContent = `${msgData.timestamp}: ${msgData.nickname}: ${msgData.message}`;
    document.getElementById("messages").appendChild(messageDiv);
});

// Send button click event
document.getElementById("sendButton").addEventListener("click", () => {
    const messageContent = document.getElementById("message").value;

    if (messageContent) {
        const chatMessage = {
            roomID: roomID,
            nickname: nickname,
            message: messageContent,
            timestamp: new Date().toLocaleString()
        };

        // Trigger the message sent event to your backend
        fetch('https://YOUR_SERVER_ENDPOINT/send-message', { // Replace with your server endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chatMessage)
        });

        document.getElementById("message").value = ''; // Clear the input
    }
});
