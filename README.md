# 🚀 Tunnel – Simple ngrok Alternative (Node.js)

A minimal reverse tunneling system built using **Node.js** to demonstrate how tools like ngrok work internally.

This project creates:
- 🌍 A **public tunnel server**
- 💻 A **local tunnel client**
- 🔁 Reverse traffic forwarding from a public URL → to your local machine

---

# 🧠 How It Works

1. The **client** (running on your local machine) opens a persistent WebSocket connection to the **public server**.
2. The server exposes a public URL.
3. When someone accesses that public URL:
   - The server forwards the request through the WebSocket tunnel.
   - The client receives the request.
   - The client forwards it to your local app (`localhost:<port>`).
   - The response is sent back through the tunnel to the browser.

### Architecture Flow
Browser
↓
Public Tunnel Server (Render / Cloud)
↓ (WebSocket Tunnel)
Local Tunnel Client
↓
localhost:<your-port>


---

# 📁 Project Structure
tunnel-ngrok-alternative/
│
├── server/ → Public tunnel server (Deploy this)
└── client/ → Local tunnel client (Run locally)


---

# 🌍 Step 1: Deploy the Server

Deploy the **`server/` folder only** to your cloud provider (e.g., Render).

### Render Configuration

- **Root Directory:** `server`
- **Build Command:**
- npm install
- **Start Command:**
- node server.js
