from flask import Flask, request, jsonify
from dijkstra import dijkstra
import time
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ✅ Bidirectional graph (FIXED)
graph = {
    'A': {'B': 5, 'C': 2},
    'B': {'A': 5, 'D': 3},
    'C': {'A': 2, 'D': 4},
    'D': {'B': 3, 'C': 4}
}

@app.route('/')
def home():
    return "Traffic Routing API is running!"

@app.route('/find-route', methods=['POST'])
def find_route():
    time.sleep(0.5)  # Simulate latency

    data = request.json

    # ✅ Handle input safely
    source = data.get('source', '').upper()
    destination = data.get('destination', '').upper()
    traffic_level = data.get('traffic', 'low')

    # ✅ Validate nodes
    if source not in graph or destination not in graph:
        return jsonify({"error": "Invalid nodes"}), 400

    # 🔥 Dynamic traffic simulation
    dynamic_graph = {}

    for node in graph:
        dynamic_graph[node] = {}
        for neighbor in graph[node]:

            if traffic_level == "low":
                traffic = random.randint(1, 2)
            elif traffic_level == "medium":
                traffic = random.randint(3, 5)
            else:  # high
                traffic = random.randint(6, 10)

            dynamic_graph[node][neighbor] = graph[node][neighbor] + traffic

    # ✅ Run algorithm on dynamic graph
    path, cost = dijkstra(dynamic_graph, source, destination)

    # ✅ Handle no path
    if path is None:
        return jsonify({"error": "No path found"}), 404

    # ✅ Response
    return jsonify({
        "path": path,
        "cost": cost,
        "latency": "10 ms",
        "traffic": traffic_level
    })


if __name__ == '__main__':
    app.run(debug=True)