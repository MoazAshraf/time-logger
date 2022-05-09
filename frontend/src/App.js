import { Component, useState } from "react";
import "./App.css";

const apiUrl = "http://localhost:8000/api";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { tasks: [] };
    }

    componentDidMount() {
        console.log(this.state.tasks);
        if (this.state.tasks.length === 0) {
            fetch(`${apiUrl}/tasks`)
                .then((res) => res.json())
                .then((tasks) => {
                    console.log(tasks);
                    this.setState({tasks: tasks})
                });
        }
    }

    render() {
        const tasksHtml = this.state.tasks.map((task) => (
            <li key={task._id}>{task.name}</li>
        ));

        return (
            <div className="App">
                <h1>Time Logger</h1>
                <ul className="tasks">{tasksHtml}</ul>
            </div>
        );
    }
}

export default App;
