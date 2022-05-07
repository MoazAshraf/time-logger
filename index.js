import http from "http";
import express from "express";
import logging from "morgan";

// HTTP Server
const hostname = "localhost";
const port = 8000;

// Create the Express application
const app = express();
app.use(logging);

// Start the web server
const server = http.createServer(app);
server.listen(port, hostname, () => {
    console.log(`Server started on http://${hostname}:${port}`);
});