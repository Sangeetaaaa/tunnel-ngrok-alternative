const express = require("express");
const { WebSocketServer } = require("ws");
const { v4: uuidv4 } = require("uuid");
const cron = require("node-cron");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json()); // Parse JSON bodies

const clients = new Map();
const pendingResponses = new Map();

// Keep the server alive with a cron job (optional, depends on hosting)
cron.schedule('*/10 * * * *', () => {
  console.log('Keep the server alive with a cron job');
  fetch('https://tunnel-ngrok-alternative.onrender.com/').then(() => {
    console.log('Server alive');
  }).catch(() => {
    console.log('Server might be sleeping');
  });
});

// Create HTTP server
const server = app.listen(port, () => {
  console.log("Tunnel server running on http://localhost:" + port);
});

// Create WebSocket server
const ws = new WebSocketServer({ server });

ws.on("connection", (socket) => {
  const clientId = uuidv4();
  clients.set(clientId, socket);

  console.log("Client connected:", clientId);

  socket.on("close", () => {
    clients.delete(clientId);
    console.log("Client disconnected:", clientId);
  });

  socket.on("message", (data) => {
    try {
      const parsed = JSON.parse(data);

      if (parsed.type === "response") {
        const { requestId, status, headers, body } = parsed;

        const pending = pendingResponses.get(requestId);

        if (!pending) return;

        pending.res
          .status(status || 200)
          .set(headers || {})
          .send(body);

        pendingResponses.delete(requestId);
      }
    } catch (err) {
      console.error("Invalid message received:", err.message);
    }
  });

  // Tell client it's connected
  socket.send(
    JSON.stringify({
      type: "connected",
      clientId,
    })
  );
});

// Public HTTP route (forward to first connected client)
app.use((req, res) => {
  const client = clients.values().next().value;

  if (!client) {
    // return res.status(503).send("No app connected");
    return res.sendFile(__dirname + "/ui.html")
  }

  const requestId = uuidv4();

  // Store response so we can finish it later
  pendingResponses.set(requestId, { res });

  // Optional: timeout protection
  const timeout = setTimeout(() => {
    if (pendingResponses.has(requestId)) {
      pendingResponses.get(requestId).res
        .status(504)
        .send("Client response timeout");
      pendingResponses.delete(requestId);
    }
  }, 10000); // 10 sec timeout

  pendingResponses.get(requestId).timeout = timeout;

  client.send(
    JSON.stringify({
      type: "request",
      requestId,
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    })
  );
});