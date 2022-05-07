import http from "http";
import express from "express";
import logging from "morgan";
import mongoose from "mongoose";

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

// Start the web server
const server = http.createServer(app);
server.listen(port, hostname, () => {
    console.log(`Server started on http://${hostname}:${port}`);

    // Testing Mongoose
    const kittySchema = new mongoose.Schema({
        name: String,
    });
    const Kitten = new mongoose.model("Kitten", kittySchema);
    Kitten.create({ name: "Ajax" })
        .then(() => {
            return Kitten.find({}).exec();
        })
        .then(console.log);
});
