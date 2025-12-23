//Problem Move an agent on grid to reach a goal position
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const width = 800;
const height = 800;

const cellSize = 50; // Size of each grid cell
const gridSize = 5; // 5x5 grid
const offsetX = (cellSize * gridSize); // Offset for drawing the grid
const offsetY = (cellSize * gridSize); // Offset for drawing the grid

const start = { x: 0, y: 0 }; // Starting position of the agent
const goal = { x: 4, y: 4 }; // Goal position


canvas.width = width;
canvas.height = height;

const environment = new Environment(gridSize, start, goal);

environment.draw(ctx, cellSize, offsetX, offsetY);