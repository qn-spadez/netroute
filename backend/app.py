from flask import Flask, request, jsonify
from dijkstra import dijkstra
import time
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Sample graph
graph = {
    'A': {'B': 5, 'C': 2},
    'B': {'D': 3},
    'C': {'D': 4},
    'D': {}
}

@app.route('/')
def home():
    return "Traffic Routing API is running!"

@app.route('/find-route', methods=['POST'])
def find_route():
    time.sleep(0.5)  # Simulate processing delay
    
    data = request.json
    source = data.get('source')
    destination = data.get('destination')

    if source not in graph or destination not in graph:
        return jsonify({"error": "Invalid nodes"}), 400

    path, cost = dijkstra(graph, source, destination)

    if path is None:
        return jsonify({"error": "No path found"}), 404

    return jsonify({
        "path": path,
        "cost": cost,
        "latency": "10 ms"
    })

if __name__ == '__main__':
    app.run(debug=True)
