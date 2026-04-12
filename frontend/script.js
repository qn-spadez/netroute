function findRoute() {
    let source = document.getElementById("source").value;
    let destination = document.getElementById("destination").value;

    fetch("http://127.0.0.1:5000/find-route", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            source: source,
            destination: destination
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById("result").innerText = "❌ " + data.error;
        } else {
            document.getElementById("result").innerText =
                "Path: " + data.path.join(" → ") +
                "\nCost: " + data.cost +
                "\nLatency: " + data.latency;
        }
    })
    .catch(error => {
        document.getElementById("result").innerText = "Error connecting to server";
        console.error(error);
    });
}