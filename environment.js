class Environment{
    /**
     * @param {number} gridSize - The size of the grid (e.g., 5 for a 5x5 grid)
     * @param {Object} start - The starting position of the agent, e.g., {x: 0, y: 0}
     * @param {Object} goal - The goal position, e.g., {x: 4, y: 4}
     */
    constructor(gridSize, start, goal){
        this.gridSize = gridSize;
        this.start = start;
        this.goal = goal;
    }

    draw(ctx, cellSize, offsetX = 0, offsetY = 0) {
        // Draw the grid
        ctx.strokeStyle = 'white';
        for (let i = 0; i <= this.gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(offsetX + i * cellSize, offsetY);
            ctx.lineTo(offsetX + i * cellSize, offsetY + this.gridSize * cellSize);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + i * cellSize);
            ctx.lineTo(offsetX + this.gridSize * cellSize, offsetY + i * cellSize);
            ctx.stroke();
        }

        // Draw the start position
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(offsetX + this.start.x * cellSize, offsetY + this.start.y * cellSize, cellSize, cellSize);

        // Draw the goal position
        ctx.fillStyle = 'lightgreen';
        ctx.fillRect(offsetX + this.goal.x * cellSize, offsetY + this.goal.y * cellSize, cellSize, cellSize);

    }
}