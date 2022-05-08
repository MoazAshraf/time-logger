import { Router } from "express";
import Task from "../models/task.js";
import bodyParser from "body-parser";

const tasksRouter = new Router();

tasksRouter
    .route("/")
    .get((req, res, next) => {
        // TODO: apply queries (e.g., todo, done)
        Task.find()
            .exec()
            .then((tasks) => {
                res.json(
                    tasks.map((task) => {
                        return task.pojoWithDuration();
                    })
                );
            });
    })
    .post((req, res, next) => {
        Task.create(req.body).then((task) => {
            if (Array.isArray(task)) {
                const tasks = task;
                res.json(
                    tasks.map((task) => {
                        return task.pojoWithDuration();
                    })
                );
            } else {
                res.json(task.pojoWithDuration());
            }
        });
    })
    .delete((req, res, next) => {
        Task.deleteMany()
            .exec()
            .then((result) => {
                res.json(result);
            });
    })
    .all((req, res, next) => {
        res.end(`${req.method} method not allowed on ${req.originalUrl}`);
    });

tasksRouter
    .route("/:taskId")
    .get((req, res, next) => {
        Task.findById(req.params.taskId)
            .exec()
            .then((task) => {
                if (task == null) {
                    const err = new Error("Not found");
                    err.status = 404;
                    next(err);
                } else {
                    res.json(task.pojoWithDuration());
                }
            });
    })
    .put((req, res, next) => {
        Task.findByIdAndUpdate(
            req.params.taskId,
            { $set: req.body },
            { new: true, runValidators: true }
        )
            .exec()
            .then((task) => {
                if (!task) {
                    const err = new Error("Not found");
                    err.status = 404;
                    next(err);
                } else {
                    res.json(task.pojoWithDuration());
                }
            })
            .catch(next);
    })
    .delete((req, res, next) => {
        Task.deleteOne({ _id: req.params.taskId })
            .exec()
            .then((result) => {
                res.json(result);
            });
    })
    .all((req, res, next) => {
        res.end(`${req.method} method not allowed on ${req.originalUrl}`);
    });

export default tasksRouter;
