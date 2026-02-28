// index.js
const express = require("express");
const app = express();

app.get("/hello", (req, res) => {
  res.send("Hello from LOCALHOST 3000 🚀");
});

app.listen(3000, () => {
  console.log("Local app running on port 3000");
});