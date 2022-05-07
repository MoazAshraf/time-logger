import http from "http";
import express from "express";
import logging from "morgan";
import mongoose from "mongoose";
import Task from "./models/task.js";

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

// TODO: Setup endpoint routes

// Start the web server
const server = http.createServer(app);
server.listen(port, hostname, () => {
    console.log(`Server started on http://${hostname}:${port}`);

    // Testing Task schema
    const task = new Task({
        name: "Task A",
        intervals: [{ begin: new Date(), end: new Date() }],
    });
    task.save()
        .then((task) => {
            console.log(task);
            console.log(task.workDuration());
        })
        .then(() => {
            Task.deleteMany().exec().then(console.log);
            // Task.find().exec().then(console.log);
        });
});
