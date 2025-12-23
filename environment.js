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
}