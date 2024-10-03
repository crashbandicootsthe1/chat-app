<?php
// chat.php
session_start();
if (!isset($_SESSION['nickname'])) {
    header('Location: index.html');
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <title>Chat Room</title>
</head>
<body>
    <div class="chat-container">
        <div id="messages"></div>
        <input type="text" id="messageInput" placeholder="Type a message...">
        <button id="sendMessage">Send</button>
        <button id="leaveRoom">Leave Room</button>
    </div>
    <script src="script.js"></script>
</body>
</html>
