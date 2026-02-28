const WebSocket = require("ws");
const axios = require("axios");

const SERVER_URL = "ws://localhost:4000";
const LOCAL_APP = "http://localhost:3000";

const ws = new WebSocket(SERVER_URL)

ws.on("open", () => {
    console.log("Connected to tunnel server")
})

ws.on("message", async (data) => {
    const parsed = JSON.parse(data);

    if (parsed.type == "request") {
        const {requestId, method, url, headers, body} = parsed;

        try {
            console.log(LOCAL_APP + url);
            const response = await axios({
                method,
                url: LOCAL_APP + url,
                headers,
                data: body,
            });

            ws.send(
                JSON.stringify({
                    type: "response", 
                    requestId,
                    status: response.status,
                    headers: response.headers,
                    body: response.data,
                })
            )
        } catch (error) {
            console.log(error.message);
            ws.send(
                JSON.stringify({
                    type:"response",
                    requestId,
                    status: error.response ? error.response.status : 500,
                    headers: error.response ? error.response.headers : {},
                    body: "Error contacting local app" + error,
                })
            )
        }

    }
})