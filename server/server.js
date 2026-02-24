// import packages
const express = require('express');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require("uuid")


const app = express();
const port = 4000;


const clients = new Map();

// Create HTTP Server
const server = app.listen(port, () => {
    console.log("tunnel server running on http://localhost:" + port)
})

// Create WebSocket server
const ws = new WebSocketServer({server});
 
ws.on("connection", (ws) => {
    const clientId = uuidv4();
    clients.set(clientId, ws)

    console.log("Client connected: " + clientId)
    ws.on("close", () => {
        clients.delete(clientId)
        console.log("Client disconnected: " + clientId)
    })
})