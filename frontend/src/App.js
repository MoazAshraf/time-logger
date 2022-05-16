// TODO: Deal with DevTools failed to load source map warning
import { Component } from "react";
import { TimeSpan } from "timespan";
import "./App.css";
import deleteIcon from "./images/delete-btn.png";
import startIcon from "./images/start-btn.png";
import stopIcon from "./images/stop-btn.png";

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

// TODO: Refactor to avoid duplication
// Converts a time span into a full string
function timeSpanToShortString(tspan) {
    let seconds = tspan.seconds;
    let minutes = tspan.minutes;
    let hours = tspan.hours;
    let days = tspan.days;

    let secondsStr = `${seconds} s`;
    let minutesStr = `${minutes} min`;
    let hoursStr = hours === 1 ? `${hours} hr` : `${hours} hrs`;
    let daysStr = days === 1 ? `${days} day` : `${days} days`;

    let result = secondsStr;
    if (days > 0) {
        result = daysStr;
        if (hours > 0) {
            result += ", " + hoursStr;
        }
    } else if (hours > 0) {
        result = hoursStr;
        if (minutes > 0) {
            result += ", " + minutesStr;
        }
    } else if (minutes > 0) {
        result = minutesStr;
        if (seconds > 0) {
            result += ", " + secondsStr;
        }
    }

    return result;
}

// Converts a time span into a full string
function timeSpanToFullString(tspan) {
    let milliseconds = tspan.milliseconds;
    let seconds = tspan.seconds + milliseconds / 1000;
    let minutes = tspan.minutes;
    let hours = tspan.hours;
    let days = tspan.days;

    let secondsStr = `${seconds} s`;
    let minutesStr = `${minutes} min`;
    let hoursStr = hours === 1 ? `${hours} hr` : `${hours} hrs`;
    let daysStr = days === 1 ? `${days} day` : `${days} days`;

    let result = secondsStr;
    if (minutes > 0) result = minutesStr + ", " + result;
    if (hours > 0) result = hoursStr + ", " + result;
    if (days > 0) result = daysStr + ", " + result;

    return result;
}

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
        }, 100);
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
        const duration = this.getDuration();

        let durationHtml = null;
        if (duration.msecs > 0) {
            durationHtml = (
                <span
                    className="task-duration"
                    title={timeSpanToFullString(duration)}
                >
                    {timeSpanToShortString(duration)}
                </span>
            );
        }

        let nameHtml;
        if (this.state.isEditingName) {
            // TODO: https://stackoverflow.com/a/28890330/3673255
            nameHtml = (
                <input
                    type="text"
                    className="task-name"
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
                    className="task-name"
                    onDoubleClick={() => this.setState({ isEditingName: true })}
                >
                    {task.name}
                </span>
            );
        }

        return (
            <li className={task.state === "doing" ? "task doing" : "task"}>
                {/* TODO: Use a form? */}
                <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.state === "done"}
                    onChange={(e) => {
                        if (!e.target.checked) this.stopTimer();
                        this.props.onCheckboxChange(e.target.checked);
                    }}
                ></input>
                {/* TODO: Use .bind()? */}
                <button
                    className="task-toggle-btn"
                    onClick={() => {
                        if (this.props.task.state === "doing") this.stopTimer();
                        this.props.onButtonClick();
                    }}
                >
                    <img
                        src={task.state !== "doing" ? startIcon : stopIcon}
                        alt="Toggle Start/Stop"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                </button>
                {nameHtml}
                {durationHtml}
                <button
                    className="task-delete-btn"
                    onClick={this.props.onDelete}
                >
                    <img
                        src={deleteIcon}
                        alt="Delete"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                </button>
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
            <div className="app">
                <ul className="tasks">{tasksHtml}</ul>
                <input
                    type="text"
                    id="new-task-input"
                    placeholder="New Task [Enter] to add"
                    className="new-task-input"
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
