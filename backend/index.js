import util from "util";
import path from "path";
import http from "http";
import express from "express";
import logging from "morgan";
import mongoose from "mongoose";
import Task from "./models/task.js";
import apiRouter from "./routes/api.js";
import bodyParser from "body-parser";
import cors from "cors";
import { exit } from "process";

// Promisify setTimeout
const sleep = util.promisify(setTimeout);

// HTTP Server
const hostname = "0.0.0.0";
const port = 8000;

// Database Server
const dbUrl = `mongodb://localhost:27017/timeLogDb`;

// Connect to the database server
try {
    const db = await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 3000,
    });
} catch (err) {
    console.error(err.toString());
    exit(1);
}

console.log(path.resolve("../frontend/build"));
// Create the Express application
const app = express();
app.use(cors());
app.use(express.static(path.resolve("../frontend/build")));
app.use(bodyParser.json());
app.use(logging("dev"));

// Setup endpoint routes
app.use("/api", apiRouter);

// Start the web server
const server = http.createServer(app);
server.listen(port, hostname, () => {
    console.log(`Server started on http://${hostname}:${port}`);
});
