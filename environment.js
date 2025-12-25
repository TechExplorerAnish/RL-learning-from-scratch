class Environment {
    /**
     * @param {number} gridSize - The size of the grid (e.g., 5 for a 5x5 grid)
     * @param {Object} start - The starting position of the agent, e.g., {x: 0, y: 0}
     * @param {Object} goal - The goal position, e.g., {x: 4, y: 4}
     */
    constructor(gridSize, start, goal) {
        this.gridSize = gridSize;
        this.start = start;
        this.goal = goal;
        this.dangerZones = []; // Array to hold danger zone positions
        this.isdangerzonevisited = false;
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

        // Draw danger zones
        ctx.fillStyle = 'red';
        this.dangerZones.forEach(zone => {
            ctx.fillRect(offsetX + zone.x * cellSize, offsetY + zone.y * cellSize, cellSize, cellSize);
        });

    }

    reset() {
        return { ...this.start };
    }

    step(state, action) {
        // let newState = { x: state.x, y: state.y };
        let { x, y } = state;
        switch (action) {
            case 'up': y--;
                break;
            case 'down': y++;
                break;
            case 'left': x--;
                break;
            case 'right': x++;
                break;
            case 'ru': x++; y--;
                break;
            case 'rd': x++; y++;
                break;
            case 'lu': x--; y--;
                break;
            case 'ld': x--; y++;
                break;
        }
        let currentReward = 0;
        // Ensure the agent stays within bounds
        x = Math.max(0, Math.min(this.gridSize - 1, x));
        y = Math.max(0, Math.min(this.gridSize - 1, y));


        const done = (x === this.goal.x && y === this.goal.y);


        if (this.dangerZones.some(zone => zone.x === x && zone.y === y)) {
            currentReward = -1; // Penalty for stepping into a danger zone
            if (!this.isdangerzonevisited)
                this.isdangerzonevisited = true;
        }
        else if (done)
            currentReward = 1; // Reward for reaching the goal
        else {
            currentReward = -0.01; // Small negative reward each step to encourage faster reaching of goal
        }
        const reward = currentReward  // Small negative reward each step to encourage faster reaching of goal

        return { state: { x, y }, reward, done, isdangerzonevisited: this.isdangerzonevisited };
    }

    showCurrentState(ctx, cellSize, offsetX = 0, offsetY = 0, state) {
        // Draw the agent's current position
        ctx.fillStyle = 'orange';
        ctx.fillRect(offsetX + state.x * cellSize, offsetY + state.y * cellSize, cellSize, cellSize);
    }
}