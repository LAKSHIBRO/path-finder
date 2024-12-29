class PiratePathfinder {
    constructor() {
        this.gridSize = 20;
        this.grid = [];
        this.start = null;
        this.end = null;
        this.isPlacingStart = false;
        this.isPlacingEnd = false;
        this.isRunning = false;
        this.isDragging = false;
        this.isErasing = false;
        this.animationSpeed = 50;
        this.visitedNodesCount = 0;
        this.algorithmDescriptions = {
            astar: "A* combines Dijkstra's shortest path with a heuristic to guide the search towards the goal. It guarantees the shortest path while being more efficient than Dijkstra's algorithm.",
            dijkstra: "Dijkstra's algorithm finds the shortest path by exploring nodes in order of their distance from the start. It guarantees the shortest path but explores more nodes than A*.",
            greedy: "Greedy Best-First Search always explores the node that appears closest to the goal. It's very fast but doesn't guarantee the shortest path.",
            bfs: "Breadth-First Search explores nodes in layers, visiting all nodes at a given distance before moving further. It guarantees the shortest path in unweighted graphs.",
            dfs: "Depth-First Search explores as far as possible along each branch before backtracking. It's memory-efficient but doesn't guarantee the shortest path."
        };

        this.initializeGrid();
        this.setupEventListeners();
        this.updateAlgorithmDescription();
        this.resetStats();
    }

    resetStats() {
        document.getElementById('pathLength').textContent = 'Path Length: -';
        document.getElementById('visitedNodes').textContent = 'Nodes Visited: -';
        document.getElementById('executionTime').textContent = 'Time: -';
        this.visitedNodesCount = 0;
    }

    updateStats(pathLength, visitedNodes, executionTime) {
        document.getElementById('pathLength').textContent = `Path Length: ${pathLength.toFixed(2)}`;
        document.getElementById('visitedNodes').textContent = `Nodes Visited: ${visitedNodes}`;
        document.getElementById('executionTime').textContent = `Time: ${executionTime}ms`;
    }

    initializeGrid() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';
        this.grid = [];

        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                this.grid[i][j] = {
                    element: cell,
                    isObstacle: false,
                    isStart: false,
                    isEnd: false
                };
                
                gridElement.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        const grid = document.getElementById('grid');
        
        // Mouse events for drag functionality
        grid.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                this.handleMouseDown(e);
            }
        });
        
        grid.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleCellDrag(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.isErasing = false;
        });

        // Prevent context menu on right click
        grid.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Touch events for mobile support
        grid.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            if (target.classList.contains('cell')) {
                this.handleMouseDown({ target });
            }
        });

        grid.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDragging) {
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                if (target && target.classList.contains('cell')) {
                    this.handleCellDrag({ target });
                }
            }
        });

        grid.addEventListener('touchend', () => {
            this.isDragging = false;
            this.isErasing = false;
        });

        // Button event listeners
        document.getElementById('startBtn').addEventListener('click', () => this.startPathfinding());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGrid());
        document.getElementById('algorithm').addEventListener('change', () => this.updateAlgorithmDescription());
        document.getElementById('randomMazeBtn').addEventListener('click', () => this.generateRandomMaze());
        document.getElementById('recursiveMazeBtn').addEventListener('click', () => this.generateRecursiveMaze());
        document.getElementById('clearObstaclesBtn').addEventListener('click', () => this.clearObstacles());
        document.getElementById('speed').addEventListener('input', (e) => {
            this.animationSpeed = 101 - e.target.value;
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.resetGrid();
            } else if (e.key === ' ' && !this.isRunning) {
                e.preventDefault();
                this.startPathfinding();
            } else if (e.key === 'c' || e.key === 'C') {
                this.clearObstacles();
            }
        });
    }

    handleMouseDown(e) {
        if (this.isRunning) return;
        
        const cell = e.target;
        if (!cell.classList.contains('cell')) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (!this.start || (this.start[0] === row && this.start[1] === col)) {
            this.setStart(row, col);
        } else if (!this.end || (this.end[0] === row && this.end[1] === col)) {
            this.setEnd(row, col);
        } else {
            this.isDragging = true;
            this.isErasing = this.grid[row][col].isObstacle;
            this.toggleObstacle(row, col);
        }
    }

    handleCellDrag(e) {
        if (this.isRunning) return;

        const cell = e.target;
        if (!cell.classList.contains('cell')) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Don't modify start or end points while dragging
        if (
            (this.start && this.start[0] === row && this.start[1] === col) ||
            (this.end && this.end[0] === row && this.end[1] === col)
        ) return;

        // Set or erase obstacles based on initial click
        if (this.isErasing) {
            if (this.grid[row][col].isObstacle) {
                this.toggleObstacle(row, col);
            }
        } else {
            if (!this.grid[row][col].isObstacle) {
                this.toggleObstacle(row, col);
            }
        }
    }

    setStart(row, col) {
        if (this.start) {
            const [oldRow, oldCol] = this.start;
            this.grid[oldRow][oldCol].element.innerHTML = '';
            this.grid[oldRow][oldCol].isStart = false;
        }
        
        if (this.end && this.end[0] === row && this.end[1] === col) {
            this.end = null;
        }

        this.start = [row, col];
        this.grid[row][col].isStart = true;
        this.grid[row][col].isObstacle = false;
        this.grid[row][col].element.innerHTML = '⛵';
        this.clearPath();
    }

    setEnd(row, col) {
        if (this.end) {
            const [oldRow, oldCol] = this.end;
            this.grid[oldRow][oldCol].element.innerHTML = '';
            this.grid[oldRow][oldCol].isEnd = false;
        }

        if (this.start && this.start[0] === row && this.start[1] === col) return;

        this.end = [row, col];
        this.grid[row][col].isEnd = true;
        this.grid[row][col].isObstacle = false;
        this.grid[row][col].element.innerHTML = '💎';
        this.clearPath();
    }

    toggleObstacle(row, col) {
        if (
            (this.start && this.start[0] === row && this.start[1] === col) ||
            (this.end && this.end[0] === row && this.end[1] === col)
        ) return;

        this.grid[row][col].isObstacle = !this.grid[row][col].isObstacle;
        this.grid[row][col].element.classList.toggle('obstacle');
        this.clearPath();
    }

    updateAlgorithmDescription() {
        const algorithm = document.getElementById('algorithm').value;
        const description = this.algorithmDescriptions[algorithm];
        document.getElementById('algorithmDescription').textContent = description;
    }

    generateRandomMaze() {
        if (this.isRunning) return;
        this.clearObstacles();
        
        const density = 0.3; // 30% obstacle density
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (
                    (!this.start || this.start[0] !== i || this.start[1] !== j) &&
                    (!this.end || this.end[0] !== i || this.end[1] !== j) &&
                    Math.random() < density
                ) {
                    this.grid[i][j].isObstacle = true;
                    this.grid[i][j].element.classList.add('obstacle');
                }
            }
        }
        this.clearPath();
    }

    generateRecursiveMaze() {
        if (this.isRunning) return;
        this.clearObstacles();
        
        // Fill the grid with obstacles
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (!this.start || this.start[0] !== i || this.start[1] !== j) {
                    if (!this.end || this.end[0] !== i || this.end[1] !== j) {
                        this.grid[i][j].isObstacle = true;
                        this.grid[i][j].element.classList.add('obstacle');
                    }
                }
            }
        }

        const recursiveDivision = (x1, y1, x2, y2, orientation) => {
            if (x2 - x1 < 2 || y2 - y1 < 2) return;

            if (orientation === 'horizontal') {
                const y = Math.floor(Math.random() * (y2 - y1 - 1)) + y1 + 1;
                const hole = Math.floor(Math.random() * (x2 - x1)) + x1;

                for (let x = x1; x < x2; x++) {
                    if (x !== hole && this.isValidCell(x, y)) {
                        this.grid[y][x].isObstacle = true;
                        this.grid[y][x].element.classList.add('obstacle');
                    }
                }

                recursiveDivision(x1, y1, x2, y, 'vertical');
                recursiveDivision(x1, y + 1, x2, y2, 'vertical');
            } else {
                const x = Math.floor(Math.random() * (x2 - x1 - 1)) + x1 + 1;
                const hole = Math.floor(Math.random() * (y2 - y1)) + y1;

                for (let y = y1; y < y2; y++) {
                    if (y !== hole && this.isValidCell(x, y)) {
                        this.grid[y][x].isObstacle = true;
                        this.grid[y][x].element.classList.add('obstacle');
                    }
                }

                recursiveDivision(x1, y1, x, y2, 'horizontal');
                recursiveDivision(x + 1, y1, x2, y2, 'horizontal');
            }
        };

        recursiveDivision(0, 0, this.gridSize, this.gridSize, Math.random() < 0.5 ? 'horizontal' : 'vertical');
        this.clearPath();
    }

    isValidCell(x, y) {
        return (
            (!this.start || this.start[0] !== y || this.start[1] !== x) &&
            (!this.end || this.end[0] !== y || this.end[1] !== x)
        );
    }

    clearObstacles() {
        if (this.isRunning) return;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (
                    (!this.start || this.start[0] !== i || this.start[1] !== j) &&
                    (!this.end || this.end[0] !== i || this.end[1] !== j)
                ) {
                    this.grid[i][j].isObstacle = false;
                    this.grid[i][j].element.classList.remove('obstacle');
                }
            }
        }
        this.clearPath();
    }

    async startPathfinding() {
        if (this.isRunning || !this.start || !this.end) return;
        
        this.isRunning = true;
        document.getElementById('startBtn').disabled = true;
        
        this.clearPath();
        this.resetStats();
        
        const pathFinder = new PathFinder(this.grid, this.start, this.end);
        const algorithm = document.getElementById('algorithm').value;
        
        const onVisit = async (node) => {
            const [row, col] = node;
            if (!this.grid[row][col].isStart && !this.grid[row][col].isEnd) {
                this.grid[row][col].element.classList.add('visited');
                this.visitedNodesCount++;
            }
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed));
        };

        const startTime = performance.now();
        let path;
        switch (algorithm) {
            case 'astar':
                path = await pathFinder.aStar(onVisit);
                break;
            case 'dijkstra':
                path = await pathFinder.dijkstra(onVisit);
                break;
            case 'greedy':
                path = await pathFinder.greedy(onVisit);
                break;
            case 'bfs':
                path = await pathFinder.bfs(onVisit);
                break;
            case 'dfs':
                path = await pathFinder.dfs(onVisit);
                break;
        }
        const endTime = performance.now();

        if (path) {
            await this.visualizePath(path);
            const pathLength = this.calculatePathLength(path);
            this.updateStats(pathLength, this.visitedNodesCount, Math.round(endTime - startTime));
        }

        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
    }

    calculatePathLength(path) {
        let length = 0;
        for (let i = 1; i < path.length; i++) {
            const dx = path[i][0] - path[i-1][0];
            const dy = path[i][1] - path[i-1][1];
            length += Math.sqrt(dx * dx + dy * dy);
        }
        return length;
    }

    async visualizePath(path) {
        for (let i = 0; i < path.length; i++) {
            const [row, col] = path[i];
            if (!this.grid[row][col].isStart && !this.grid[row][col].isEnd) {
                this.grid[row][col].element.classList.remove('visited');
                this.grid[row][col].element.classList.add('path');
                await new Promise(resolve => setTimeout(resolve, this.animationSpeed));
            }
        }
    }

    clearPath() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j].element.classList.remove('path', 'visited');
            }
        }
    }

    resetGrid() {
        this.start = null;
        this.end = null;
        this.isRunning = false;
        this.isDragging = false;
        this.isErasing = false;
        this.initializeGrid();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PiratePathfinder();
}); 
