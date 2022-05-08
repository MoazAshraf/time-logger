import { Router } from "express";

const statsRouter = new Router();

statsRouter.get("/", (req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Welcome to the Stats API!");
});

export default statsRouter;
