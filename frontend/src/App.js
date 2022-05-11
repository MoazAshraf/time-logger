import { Component } from "react";
import "./App.css";

const apiUrl = "http://localhost:8000/api";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { tasks: [] };
    }

    componentDidMount() {
        if (this.state.tasks.length === 0) {
            fetch(`${apiUrl}/tasks`)
                .then((res) => res.json())
                .then((tasks) => {
                    this.setState({ tasks: tasks });
                });
        }
    }

    updateTask(task, update) {
        for (const key in update) {
            if (!(key in task))
                throw new Error(`"${key}" is not a property of a task.`);
            if (task[key] === update[key])
                delete update[key];
        }
        if (Object.keys(update).length === 0)
            return;
        fetch(`${apiUrl}/tasks/${task._id}`, {
            method: "PUT",
            body: JSON.stringify(update),
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((task) => {
                const tasks = this.state.tasks.map((t) => {
                    if (task._id === t._id) return task;
                    else return t;
                });
                this.setState({ tasks: tasks });
            });
    }

    handleTaskStart(task) {
        const newTaskState = task.state === "doing" ? "done" : "doing";
        this.updateTask(task, { state: newTaskState });
    }

    handleTaskCheckChange(task, checked) {
        const newTaskState = checked ? "done" : "todo";
        this.updateTask(task, { state: newTaskState });
    }

    render() {
        console.log("render");
        const tasksHtml = this.state.tasks.map((task) => {
            return (
                <li key={task._id}>
                    {/* TODO: Use a form? */}
                    <input
                        type="checkbox"
                        checked={task.state === "done"}
                        onChange={(e) => {
                            this.handleTaskCheckChange(task, e.target.checked);
                        }}
                    ></input>
                    {/* TODO: Use .bind()? */}
                    <button onClick={() => this.handleTaskStart(task)}>
                        {task.state !== "doing" ? "Start" : "Stop"}
                    </button>
                    {task.name}
                </li>
            );
        });

        return (
            <div className="App">
                <h1>Time Logger</h1>
                <ul className="tasks">{tasksHtml}</ul>
            </div>
        );
    }
}

export default App;
