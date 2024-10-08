const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files for frontend
app.use(express.static(path.join(__dirname, "public")));

// Initialize SQLite database
const db = new sqlite3.Database(":memory:");

db.serialize(() => {
    // Create messages table
    db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

// Handle new WebSocket connections
io.on("connection", (socket) => {
    console.log("A user connected");

    let nickname = ""; // Placeholder for user's nickname

    // Send previous chat messages to the new client
    db.all("SELECT username, message, timestamp FROM messages ORDER BY timestamp", [], (err, rows) => {
        if (err) {
            console.error(err);
        }
        socket.emit("previousMessages", rows);
    });

    // Handle nickname assignment
    socket.on("setNickname", (name) => {
        nickname = name; // Set the nickname for this session
        console.log(`${nickname} has joined the chat`);
    });

    // Handle incoming chat messages
    socket.on("chatMessage", (message) => {
        if (!nickname) {
            socket.emit("errorMessage", "You must set a nickname before sending messages.");
            return;
        }

        // Insert message into the database
        db.run("INSERT INTO messages (username, message) VALUES (?, ?)", [nickname, message], (err) => {
            if (err) {
                console.error(err);
            } else {
                // Broadcast the message to all connected clients
                io.emit("chatMessage", { username: nickname, message, timestamp: new Date() });
            }
        });
    });

    socket.on("disconnect", () => {
        if (nickname) {
            console.log(`${nickname} has left the chat`);
        } else {
            console.log("A user disconnected without setting a nickname");
        }
    });
});

// Start server on port 3000
server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
