import { Router } from "express";
import tasksRouter from "./tasks.js";
import statsRouter from "./stats.js";

const apiRouter = new Router();

apiRouter.get("/", (req, res, next) => {
    res.end("Welcome to the API!");
});

// Mount sub-routers
apiRouter.use("/tasks", tasksRouter);
apiRouter.use("/stats", statsRouter);

// Error handler
apiRouter.use((err, req, res, next) => {
    res.statusCode = err.statusCode || err.status || 500;
    console.log(err);
    res.end(err.toString());
})

export default apiRouter;
