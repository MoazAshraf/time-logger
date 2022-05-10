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

    handleTaskStart(task) {
        const newTaskState = task.state === "doing" ? "done" : "doing";
        fetch(`${apiUrl}/tasks/${task._id}`, {
            method: "PUT",
            body: JSON.stringify({ state: newTaskState }),
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((task) => {
                const tasks = this.state.tasks.map((t) => {
                    if (task._id === t._id) return task;
                    else return t;
                });
                this.setState({ tasks: tasks });
                console.log(task);
            });
    }

    render() {
        const tasksHtml = this.state.tasks.map((task) => {
            return (
                <li key={task._id}>
                    {task.name}
                    {/* TODO: Use .bind()? */}
                    <button onClick={() => this.handleTaskStart(task)}>
                        {task.state != "doing" ? "Start" : "Stop"}
                    </button>
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
