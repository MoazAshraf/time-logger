import { Component } from "react";
import { TimeSpan } from "timespan";
import "./App.css";

const apiUrl = "http://localhost:8000/api";

// Creates a TimeSpan object from a plain-old JavaScript object with
// the structure of a timespan
function timeSpanFromPojo(pojo) {
    const tspan = new TimeSpan();
    for (const key in pojo) {
        tspan[key] = pojo[key];
    }
    console.log(tspan);
    return tspan;
}

// Converts a number of milliseconds into a string
// TODO: custom duration to string
function msecsToString(msecs) {
    let seconds = Math.floor(msecs / 1000);
    msecs = Math.round(((msecs / 1000) - seconds) * 1000);

    let minutes = Math.floor(seconds / 60);
    seconds = Math.round(((seconds / 60) - minutes) * 60);

    let hours = Math.floor(minutes / 60);
    minutes = Math.round(((minutes / 60) - hours) * 60);

    console.log(`${hours}:${minutes}:${seconds}.${msecs}`);
    // return result;
}

function timeSpanToString(tspan) {
    
}

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
            if (task[key] === update[key]) delete update[key];
        }
        if (Object.keys(update).length === 0) return;
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
            // let timerHtml = null;
            // if (task.state === "doing")
            // TODO: remove bold, replace with CSS
            // TODO: fix spacing
            // TODO: increment duration during "doing"
            let duration = timeSpanFromPojo(task.duration);
            duration = duration.toString();
            console.log(duration);

            const timerHtml = (
                <span>
                    <b> {duration}</b>
                </span>
            );
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
                    <span>{task.name}</span>
                    {timerHtml}
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
