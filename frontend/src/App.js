import "./App.css";

function App() {
    fetch("http://localhost:8000/api")
        .then((res) => res.text())
        .then(console.log);

    return (
        <div className="App">
            <h1>Time Logger</h1>
        </div>
    );
}

export default App;
