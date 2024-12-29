# 🏴‍☠️ Pirate Pathfinder 🗺️

## Introduction

Welcome to the **Pirate Pathfinder** project, a web-based application designed to help pirates find their way to treasure through a maze. This tool allows the user to choose from various pathfinding algorithms and visualize the progress in real-time. The application uses popular algorithms such as A*, Dijkstra, BFS, DFS, and Greedy Best-First Search to find the shortest path or best route from the pirate ship (start) to the treasure (end) while avoiding obstacles.

---

## Features

- **Multiple Algorithms**: Select between A*, Dijkstra, Greedy Best-First, BFS, and DFS algorithms.
- **Speed Control**: Adjust the speed of pathfinding visualization with a slider.
- **Maze Generation**: Generate random or recursive mazes for varied challenges.
- **Interactive Grid**: Click on grid cells to place obstacles, set the start (ship), and end (treasure) points.
- **Path Visualization**: Watch the algorithm work in real-time as it finds the shortest path.
- **Statistics**: View statistics on path length, nodes visited, and execution time.

---

## UI Mockups

### Main Page

The application interface is simple and interactive with several key elements:

1. **Algorithm Selector**: A dropdown menu to choose between different pathfinding algorithms.
2. **Speed Control**: A slider to adjust the speed of the algorithm.
3. **Control Buttons**: Buttons to start the pathfinding, reset the grid, and generate random or recursive mazes.
4. **Stats**: Display of path length, nodes visited, and execution time.
5. **Grid**: A grid where the user can interact by setting start, end, and obstacle cells.

#### Example Layout

```plaintext
-------------------------------------------------------
| 🏴‍☠️ Pirate Pathfinder 🗺️                         |
| -------------------------------------------------- |
| Algorithm: [Dropdown]                             |
| Speed: [Slider]                                   |
| [Start Button] [Reset Button]                     |
| [Random Maze Button] [Recursive Maze Button]      |
| [Clear Obstacles Button]                          |
| -------------------------------------------------- |
| Path Length: - Nodes Visited: - Time: -            |
| -------------------------------------------------- |
| Grid (Maze)                                        |
| [Grid Cells Here]                                  |
| -------------------------------------------------- |
| Legend:                                             |
| Ship (Start) ⛵     Treasure (End) 💎     Obstacle    |
| Path      🟩    Visited     🟦                         |
-------------------------------------------------------
