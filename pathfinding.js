class PriorityQueue {
    constructor() {
        this.values = [];
    }

    enqueue(val, priority) {
        this.values.push({ val, priority });
        this.sort();
    }

    dequeue() {
        return this.values.shift();
    }

    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    }
}

class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

class Stack {
    constructor() {
        this.items = [];
    }

    push(item) {
        this.items.push(item);
    }

    pop() {
        return this.items.pop();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

class PathFinder {
    constructor(grid, start, end) {
        this.grid = grid;
        this.start = start;
        this.end = end;
        this.rows = grid.length;
        this.cols = grid[0].length;
    }

    getNeighbors(node) {
        const [row, col] = node;
        const neighbors = [];
        // Orthogonal directions
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],  // Cardinal directions
            [-1, -1], [-1, 1], [1, -1], [1, 1]  // Diagonal directions
        ];
        const costs = [1, 1, 1, 1, Math.SQRT2, Math.SQRT2, Math.SQRT2, Math.SQRT2];

        for (let i = 0; i < directions.length; i++) {
            const [dx, dy] = directions[i];
            const newRow = row + dx;
            const newCol = col + dy;

            if (
                newRow >= 0 && newRow < this.rows &&
                newCol >= 0 && newCol < this.cols &&
                !this.grid[newRow][newCol].isObstacle
            ) {
                // For diagonal movement, check if both adjacent cells are not obstacles
                if (i >= 4) {  // Diagonal movement
                    const [x1, y1] = [row + dx, col];
                    const [x2, y2] = [row, col + dy];
                    if (this.grid[x1][y1].isObstacle || this.grid[x2][y2].isObstacle) {
                        continue;  // Skip if diagonal path is blocked
                    }
                }
                neighbors.push({ pos: [newRow, newCol], cost: costs[i] });
            }
        }

        return neighbors;
    }

    heuristic(node) {
        // Using octile distance for better diagonal movement estimation
        const dx = Math.abs(node[0] - this.end[0]);
        const dy = Math.abs(node[1] - this.end[1]);
        return (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy);
    }

    async aStar(onVisit) {
        const pq = new PriorityQueue();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        const visited = new Set();

        const startKey = this.start.toString();
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(this.start));
        pq.enqueue(this.start, fScore.get(startKey));

        while (pq.values.length > 0) {
            const current = pq.dequeue().val;
            const currentKey = current.toString();

            if (visited.has(currentKey)) continue;
            visited.add(currentKey);

            if (current[0] === this.end[0] && current[1] === this.end[1]) {
                return this.reconstructPath(cameFrom, current);
            }

            for (const { pos: neighbor, cost } of this.getNeighbors(current)) {
                const neighborKey = neighbor.toString();
                const tentativeGScore = gScore.get(currentKey) + cost;

                if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeGScore);
                    const f = tentativeGScore + this.heuristic(neighbor);
                    fScore.set(neighborKey, f);
                    pq.enqueue(neighbor, f);
                    
                    if (onVisit && !visited.has(neighborKey)) {
                        await onVisit(neighbor);
                    }
                }
            }
        }

        return null;
    }

    async dijkstra(onVisit) {
        const pq = new PriorityQueue();
        const distances = new Map();
        const previous = new Map();
        const visited = new Set();

        const startKey = this.start.toString();
        distances.set(startKey, 0);
        pq.enqueue(this.start, 0);

        while (pq.values.length > 0) {
            const current = pq.dequeue().val;
            const currentKey = current.toString();

            if (visited.has(currentKey)) continue;
            visited.add(currentKey);

            if (current[0] === this.end[0] && current[1] === this.end[1]) {
                return this.reconstructPath(previous, current);
            }

            for (const { pos: neighbor, cost } of this.getNeighbors(current)) {
                const neighborKey = neighbor.toString();
                const distance = distances.get(currentKey) + cost;

                if (!distances.has(neighborKey) || distance < distances.get(neighborKey)) {
                    distances.set(neighborKey, distance);
                    previous.set(neighborKey, current);
                    pq.enqueue(neighbor, distance);
                    
                    if (onVisit && !visited.has(neighborKey)) {
                        await onVisit(neighbor);
                    }
                }
            }
        }

        return null;
    }

    async greedy(onVisit) {
        const pq = new PriorityQueue();
        const cameFrom = new Map();
        const visited = new Set();

        pq.enqueue(this.start, this.heuristic(this.start));

        while (pq.values.length > 0) {
            const current = pq.dequeue().val;
            const currentKey = current.toString();

            if (visited.has(currentKey)) continue;
            visited.add(currentKey);

            if (current[0] === this.end[0] && current[1] === this.end[1]) {
                return this.reconstructPath(cameFrom, current);
            }

            for (const { pos: neighbor } of this.getNeighbors(current)) {
                const neighborKey = neighbor.toString();
                if (!visited.has(neighborKey)) {
                    cameFrom.set(neighborKey, current);
                    pq.enqueue(neighbor, this.heuristic(neighbor));
                    
                    if (onVisit) {
                        await onVisit(neighbor);
                    }
                }
            }
        }

        return null;
    }

    async bfs(onVisit) {
        const queue = new Queue();
        const cameFrom = new Map();
        const visited = new Set();

        queue.enqueue(this.start);
        visited.add(this.start.toString());

        while (!queue.isEmpty()) {
            const current = queue.dequeue();
            const currentKey = current.toString();

            if (current[0] === this.end[0] && current[1] === this.end[1]) {
                return this.reconstructPath(cameFrom, current);
            }

            for (const { pos: neighbor } of this.getNeighbors(current)) {
                const neighborKey = neighbor.toString();
                if (!visited.has(neighborKey)) {
                    visited.add(neighborKey);
                    cameFrom.set(neighborKey, current);
                    queue.enqueue(neighbor);
                    
                    if (onVisit) {
                        await onVisit(neighbor);
                    }
                }
            }
        }

        return null;
    }

    async dfs(onVisit) {
        const stack = new Stack();
        const cameFrom = new Map();
        const visited = new Set();

        stack.push(this.start);
        visited.add(this.start.toString());

        while (!stack.isEmpty()) {
            const current = stack.pop();
            const currentKey = current.toString();

            if (current[0] === this.end[0] && current[1] === this.end[1]) {
                return this.reconstructPath(cameFrom, current);
            }

            for (const { pos: neighbor } of this.getNeighbors(current)) {
                const neighborKey = neighbor.toString();
                if (!visited.has(neighborKey)) {
                    visited.add(neighborKey);
                    cameFrom.set(neighborKey, current);
                    stack.push(neighbor);
                    
                    if (onVisit) {
                        await onVisit(neighbor);
                    }
                }
            }
        }

        return null;
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        let currentKey = current.toString();

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey);
            currentKey = current.toString();
            path.unshift(current);
        }

        return path;
    }
} 