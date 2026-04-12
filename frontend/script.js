function findRoute() {
    let source = document.getElementById("source").value.trim();
    let destination = document.getElementById("destination").value.trim();
    let resultBox = document.getElementById("result");

    if (!source || !destination) {
        resultBox.innerHTML = "⚠️ Please enter both source and destination";
        return;
    }

    resultBox.innerHTML = "⏳ Finding best route...";

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
    .then(response => {
        if (!response.ok) {
            throw new Error("Server error");
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            resultBox.innerHTML = "❌ " + data.error;
        } else {
            resultBox.innerHTML =
                "📍 <b>Path:</b> " + data.path.join(" → ") + "<br><br>" +
                "💰 <b>Cost:</b> " + data.cost + "<br>" +
                "📡 <b>Latency:</b> " + data.latency;

            drawGraph(data.path); // 🔥 map-style graph
        }
    })
    .catch(error => {
        resultBox.innerHTML = "❌ Error connecting to server";
        console.error(error);
    });
}

function drawGraph(path) {

    const container = document.getElementById("network");

    // 🔹 Nodes
    const nodes = new vis.DataSet([
        { id: "A", label: "A" },
        { id: "B", label: "B" },
        { id: "C", label: "C" },
        { id: "D", label: "D" }
    ]);

    // 🔹 Edges (same as backend graph)
    const edges = new vis.DataSet([
        { id: 1, from: "A", to: "B", label: "5" },
        { id: 2, from: "A", to: "C", label: "2" },
        { id: 3, from: "B", to: "D", label: "1" },
        { id: 4, from: "C", to: "D", label: "4" }
    ]);

    // 🔥 Highlight shortest path
    for (let i = 0; i < path.length - 1; i++) {
        let from = path[i];
        let to = path[i + 1];

        edges.forEach(edge => {
            if (
                (edge.from === from && edge.to === to) ||
                (edge.from === to && edge.to === from)
            ) {
                edges.update({
                    id: edge.id,
                    color: { color: "green" },
                    width: 4
                });
            }
        });
    }

    const data = {
        nodes: nodes,
        edges: edges
    };

    const options = {
        nodes: {
            shape: "dot",
            size: 20,
            color: "#667eea",
            font: {
                color: "black",
                size: 14
            }
        },
        edges: {
            color: "#ccc",
            smooth: true,
            font: {
                align: "middle"
            }
        },
        physics: {
            enabled: true
        }
    };

    // 🔄 Clear previous graph
    container.innerHTML = "";

    new vis.Network(container, data, options);
}