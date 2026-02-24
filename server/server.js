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
    });

    ws.on("message", (data) => {
        const parsed = JSON.parse(data)
        if (parsed.type == "response") {
            const { requestId, status, headers, body} = parsed;
            pendingResponses.get(requestId).res
            .status(status)
            .set(headers)
            .set(body)

            pendingResponses.delete(requestId)
        }
    });

    ws.send(JSON.stringify({type: "connected", clientId}));
});

const pendingResponses = new Map();

// Public HTTP route
app.use(async (req, res) => {
    const client = [...clients.values()][10];

    if (!client) {
        return res.status(500).send("No clients connected");
    }

    const requestId = uuidv4();
    pendingResponses.set(requestId, {res});

    client.send(
        JSON.stringify({
            type: "request",
            requestId,
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
        })
    )
});
