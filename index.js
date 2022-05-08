import util from "util";
import http from "http";
import express from "express";
import logging from "morgan";
import mongoose from "mongoose";
import Task from "./models/task.js";
import apiRouter from "./routes/api.js";

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
app.use(logging);

// Setup endpoint routes
// app.get("/api/tasks", () => )
app.use("/api", apiRouter);

// Start the web server
const server = http.createServer(app);
server.listen(port, hostname, () => {
    console.log(`Server started on http://${hostname}:${port}`);

    let begin = new Date();
    const intervals = [];
    sleep(100)
        .then(() => {
            intervals.push({ begin: begin, end: new Date() });
            return sleep(100);
        })
        .then(() => {
            begin = new Date();
            return sleep(100);
        })
        .then(() => {
            intervals.push({ begin: begin, end: new Date() });
        })
        .then(() => {
            // Testing Task schema
            const task = new Task({
                name: "Task A",
                intervals: intervals,
            });
            return task.save();
        })
        .then((task) => {
            console.log(task);
            console.log(task.workDuration());
        })
        .then(() => {
            // Task.deleteMany().exec().then(console.log);
            // Task.find().exec().then(console.log);
        });
});
