let websocket;
const messagesDiv = document.getElementById('messages');

document.getElementById('createRoom').onclick = createRoom;
document.getElementById('joinRoom').onclick = joinRoom;
document.getElementById('sendMessage').onclick = sendMessage;
document.getElementById('leaveRoom').onclick = leaveRoom;

function connectWebSocket(roomCode) {
    websocket = new WebSocket(`ws://localhost:8080/websocket.php?room=${roomCode}`);

    websocket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        messagesDiv.innerHTML += `<div>${message.nickname}: ${message.content}</div>`;
    };
}

function createRoom() {
    const nickname = document.getElementById('nickname').value;
    const roomCode = generateRoomCode();
    sessionStorage.setItem('nickname', nickname);
    sessionStorage.setItem('roomCode', roomCode);
    connectWebSocket(roomCode);
    window.location.href = 'chat.php';
}

function joinRoom() {
    const nickname = document.getElementById('nickname').value;
    const roomCode = document.getElementById('roomCode').value;
    sessionStorage.setItem('nickname', nickname);
    sessionStorage.setItem('roomCode', roomCode);
    connectWebSocket(roomCode);
    window.location.href = 'chat.php';
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = {
        nickname: sessionStorage.getItem('nickname'),
        content: messageInput.value
    };
    websocket.send(JSON.stringify(message));
    messageInput.value = '';
}

function leaveRoom() {
    websocket.close();
    window.location.href = 'index.html';
}

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 7);
}
