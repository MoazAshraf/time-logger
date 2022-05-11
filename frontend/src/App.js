// TODO: Deal with DevTools failed to load source map warning
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
    return tspan;
}

// Converts a number of milliseconds into a string
// TODO: custom duration to string
function msecsToString(msecs) {
    let seconds = Math.floor(msecs / 1000);
    msecs = Math.round((msecs / 1000 - seconds) * 1000);

    let minutes = Math.floor(seconds / 60);
    seconds = Math.round((seconds / 60 - minutes) * 60);

    let hours = Math.floor(minutes / 60);
    minutes = Math.round((minutes / 60 - hours) * 60);

    console.log(`${hours}:${minutes}:${seconds}.${msecs}`);
    // return result;
}

function timeSpanToString(tspan) {}

class Task extends Component {
    constructor(props) {
        super(props);
        const task = this.props.task;
        this.interval = null;
        this.startDuration = task.duration;
        this.state = { duration: this.getDuration(), isEditingName: false };
    }

    getDuration() {
        const duration = timeSpanFromPojo(this.startDuration);
        const task = this.props.task;
        if (task.state === "doing") {
            const msecs =
                Date.now() -
                Date.parse(task.intervals[task.intervals.length - 1].begin);
            duration.addMilliseconds(msecs);
        }
        return duration;
    }

    componentDidMount() {
        this.startTimer();
    }

    startTimer() {
        if (this.interval !== null || this.props.task.state !== "doing") return;
        this.interval = setInterval(() => {
            const task = this.props.task;
            if (task.state !== "doing") {
                clearInterval(this.interval);
                this.interval = null;
            } else {
                this.setState({ duration: this.getDuration() });
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = null;
    }

    // TODO: use ref
    changeName(nameInput) {
        this.props.onNameChange(nameInput.value);
        this.setState({ isEditingName: false });
    }

    render() {
        const task = this.props.task;
        this.startDuration = task.duration;
        if (task.state === "doing") this.startTimer();
        const duration = this.getDuration().toString();

        let nameHtml;
        if (this.state.isEditingName) {
            // TODO: https://stackoverflow.com/a/28890330/3673255
            nameHtml = (
                <input
                    type="text"
                    defaultValue={task.name}
                    autoFocus={true}
                    onBlur={(e) => this.changeName(e.target)}
                    onKeyUp={(e) => {
                        if (e.key === "Enter") this.changeName(e.target);
                    }}
                />
            );
        } else {
            nameHtml = (
                <span
                    onDoubleClick={() => this.setState({ isEditingName: true })}
                >
                    {task.name}
                </span>
            );
        }

        return (
            <li>
                {/* TODO: Use a form? */}
                <input
                    type="checkbox"
                    checked={task.state === "done"}
                    onChange={(e) => {
                        if (!e.target.checked) this.stopTimer();
                        this.props.onCheckboxChange(e.target.checked);
                    }}
                ></input>
                {/* TODO: Use .bind()? */}
                <button
                    onClick={() => {
                        if (this.props.task.state === "doing") this.stopTimer();
                        this.props.onButtonClick();
                    }}
                >
                    {task.state !== "doing" ? "Start" : "Stop"}
                </button>
                {nameHtml}
                <span>
                    {/* TODO: Remove <b>, add CSS */}
                    <b> {duration}</b>
                </span>
                <button onClick={this.props.onDelete}>X</button>
            </li>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { tasks: [] };
        this.handleTaskCheckChange.bind(this);
        this.handleTaskToggle.bind(this);
        this.handleTaskNameChange.bind(this);
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

    createTask(name) {
        fetch(`${apiUrl}/tasks/`, {
            method: "POST",
            body: JSON.stringify({ name: name }),
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((task) => {
                console.log(task);
                const tasks = [...this.state.tasks, task];
                this.setState({ tasks: tasks });
            });
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
            .then((res) => {
                console.log(res.status);
                if (res.status !== 200)
                    throw new Error(
                        `Server returned status code ${res.status}`
                    );
                return res;
            })
            .then((res) => res.json())
            .then((task) => {
                const tasks = this.state.tasks.map((t) => {
                    if (task._id === t._id) {
                        return task;
                    } else return t;
                });
                this.setState({ tasks: tasks });
            })
            .catch((err) => {
                console.log(err);
            });
    }

    deleteTask(task) {
        fetch(`${apiUrl}/tasks/${task._id}`, {
            method: "DELETE",
        })
            .then((res) => res.json())
            .then((result) => {
                console.log(result);
                const tasks = this.state.tasks;
                this.setState({
                    tasks: tasks.filter((t) => t._id !== task._id),
                });
            });
    }

    // TODO: Better name
    handleTaskToggle(task) {
        this.updateTask(task, {
            state: task.state === "doing" ? "todo" : "doing",
        });
    }

    handleTaskCheckChange(task, checked) {
        this.updateTask(task, { state: checked ? "done" : "todo" });
    }

    handleTaskNameChange(task, name) {
        this.updateTask(task, { name: name });
    }

    render() {
        const tasksHtml = this.state.tasks.map((task) => (
            <Task
                key={task._id}
                task={task}
                onButtonClick={() => this.handleTaskToggle(task)}
                onCheckboxChange={(checked) =>
                    this.handleTaskCheckChange(task, checked)
                }
                onNameChange={(name) => this.handleTaskNameChange(task, name)}
                onDelete={() => this.deleteTask(task)}
            />
        ));

        return (
            <div className="App">
                <h1>Time Logger</h1>
                <ul className="tasks">{tasksHtml}</ul>
                <input
                    type="text"
                    onKeyUp={(e) => {
                        if (e.key === "Enter") {
                            const name = e.target.value;
                            if (name !== "") {
                                this.createTask(e.target.value);
                                e.target.value = "";
                            }
                        }
                    }}
                />
            </div>
        );
    }
}

export default App;
