const WebSocket = require("ws");
const axios = require("axios");
const readline = require("readline");

const SERVER_URL = "wss://tunnel-ngrok-alternative.onrender.com/";

async function getPort() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question("Enter your port: ", (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function main() {
    const PORT = await getPort();
    const LOCAL_URL = `http://localhost:${PORT}`;
    console.log(`Using port: ${PORT}`);

    const ws = new WebSocket(SERVER_URL);

    ws.on("open", () => {
        console.log("Connected to public server.");
    });

    ws.on("message", async (data) => {
        const { type, requestId, method, url, headers, body } = JSON.parse(data);
        if (type !== "request") return;

        try {
            const response = await axios({ method, url: LOCAL_URL + url, headers, data: body });
            ws.send(JSON.stringify({
                type: "response",
                requestId,
                status: response.status,
                headers: response.headers,
                body: response.data,
            }));
        } catch (error) {
            ws.send(JSON.stringify({
                type: "response",
                requestId,
                status: error.response?.status ?? 500,
                headers: error.response?.headers ?? {},
                body: "Error contacting local app: " + error.message,
            }));
        }
    });
}

main();