import util from "util";
import http from "http";
import express from "express";
import logging from "morgan";
import mongoose from "mongoose";
import Task from "./models/task.js";
import apiRouter from "./routes/api.js";
import bodyParser from "body-parser";

// Promisify setTimeout
const sleep = util.promisify(setTimeout);

// HTTP Server
const hostname = "localhost";
const port = 8000;

// Database Server
const dbUrl = `mongodb://localhost:27017/timeLogDb`;

// Connect to the database server
const db = await mongoose.connect(dbUrl);

// Create the Express application
const app = express();
app.use(bodyParser.json());
app.use(logging("dev"));

// Setup endpoint routes
app.use("/api", apiRouter);

// Start the web server
const server = http.createServer(app);
server.listen(port, hostname, () => {
    console.log(`Server started on http://${hostname}:${port}`);
});
