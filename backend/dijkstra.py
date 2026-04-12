import heapq

def dijkstra(graph, start, end):
    # Priority queue (min heap)
    queue = [(0, start, [])]
    visited = set()

    while queue:
        (cost, node, path) = heapq.heappop(queue)

        if node in visited:
            continue

        visited.add(node)
        path = path + [node]

        if node == end:
            return path, cost

        for neighbor, weight in graph[node].items():
            if neighbor not in visited:
                heapq.heappush(queue, (cost + weight, neighbor, path))

    return None, float("inf")


# Example graph
graph = {
    'A': {'B': 5, 'C': 2},
    'B': {'D': 3},
    'C': {'D': 4},
    'D': {}
}

# Test
if __name__ == "__main__":
    path, cost = dijkstra(graph, 'A', 'D')
    print("Path:", path)
    print("Cost:", cost)