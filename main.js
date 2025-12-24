//Problem Move an agent on grid to reach a goal position
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Get display elements
const episodeDisplay = document.getElementById('episodeDisplay');
const stepsDisplay = document.getElementById('stepsDisplay');
const minStepsDisplay = document.getElementById('minStepsDisplay');
const epsilonDisplay = document.getElementById('epsilonDisplay');

// Get control buttons
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const runPolicyBtn = document.getElementById('runPolicyBtn');

// Speed control
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
let executionDelay = 10; // 0ms = max speed

// Grid size control
const gridSizeSelect = document.getElementById('gridSizeSelect');

// Placement mode control
const placementModeSelect = document.getElementById('placementModeSelect');
let placementMode = 'danger';
placementModeSelect.addEventListener('change', () => {
    placementMode = placementModeSelect.value;
});

speedSlider.addEventListener('input', () => {
    const value = parseInt(speedSlider.value);
    // Invert: 100 = fast (0ms delay), 0 = slow (500ms delay)
    executionDelay = Math.round((100 - value) * 5); // 0-500ms range

    if (value === 100) {
        speedValue.textContent = 'Max';
    } else if (value === 0) {
        speedValue.textContent = 'Slow';
    } else {
        speedValue.textContent = `${executionDelay}ms`;
    }
});

const width = 500;
const height = 500;

let cellSize = 50; // Size of each grid cell
let gridSize = 5; // 5x5 grid
let offsetX = (width - cellSize * gridSize) / 2; // Center the grid horizontally
let offsetY = (height - cellSize * gridSize) / 2; // Center the grid vertically

let start = { x: 0, y: 0 }; // Starting position of the agent
let goal = { x: gridSize - 1, y: gridSize - 1 }; // Goal position


canvas.width = width;
canvas.height = height;

let environment = new Environment(gridSize, start, goal);
environment.dangerZones = []; // Start with empty danger zones - user can click to add

let agent = new Agent(['up', 'down', 'left', 'right'], {
    alpha: 0.5,
    gamma: 0.9,
    epsilon: 0.6
});
//alpha = Learning rate
//gamma = Discount factor
//epsilon = Exploration rate

let currentState = { ...start };
let steps = 0;
let minStep = Infinity;
let isPaused = false;
let isTraining = false;
let shouldStop = false;
let isRunningPolicy = false;
let isTrainingCompleted = false;

// Function to recalculate grid dimensions
function clampPosition(pos) {
    return {
        x: Math.max(0, Math.min(gridSize - 1, pos.x)),
        y: Math.max(0, Math.min(gridSize - 1, pos.y))
    };
}

function updateGridDimensions() {
    cellSize = Math.floor(400 / gridSize); // Adjust cell size based on grid
    offsetX = (width - cellSize * gridSize) / 2;
    offsetY = (height - cellSize * gridSize) / 2;
    // Keep user-defined start/goal, but clamp to new bounds
    start = clampPosition(start);
    goal = clampPosition(goal);
}

// Grid size change handler
gridSizeSelect.addEventListener('change', () => {
    if (isTraining) return; // Don't allow changes during training

    gridSize = parseInt(gridSizeSelect.value);
    updateGridDimensions();

    // Recreate environment with new size
    environment = new Environment(gridSize, start, goal);
    environment.dangerZones = [];

    // Reset agent
    agent = new Agent(['up', 'down', 'left', 'right'], {
        alpha: 0.5,
        gamma: 0.9,
        epsilon: 0.6
    });

    // Reset stats
    steps = 0;
    minStep = Infinity;
    currentState = { ...start };

    // Reset displays
    episodeDisplay.textContent = '0';
    stepsDisplay.textContent = '0';
    minStepsDisplay.textContent = '∞';
    epsilonDisplay.textContent = '0.60';

    drawGrid();
});

// Initial draw
function drawGrid() {
    console.log('Drawing grid');
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, width, height);
    environment.draw(ctx, cellSize, offsetX, offsetY);
}
drawGrid();

// Click handler for placement mode (danger zones/start/goal)
canvas.addEventListener('click', (e) => {
    if (isTraining || isRunningPolicy || isTrainingCompleted) return; // Don't allow changes during training or policy run

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Convert to grid coordinates
    const gridX = Math.floor((clickX - offsetX) / cellSize);
    const gridY = Math.floor((clickY - offsetY) / cellSize);

    // Check if click is within grid bounds
    if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize) return;

    if (placementMode === 'danger') {
        // Don't allow toggling start or goal
        if ((gridX === start.x && gridY === start.y) || (gridX === goal.x && gridY === goal.y)) return;
        // Toggle danger zone
        const existingIndex = environment.dangerZones.findIndex(z => z.x === gridX && z.y === gridY);
        if (existingIndex >= 0) {
            environment.dangerZones.splice(existingIndex, 1);
        } else {
            environment.dangerZones.push({ x: gridX, y: gridY });
        }
    } else if (placementMode === 'start') {
        // Prevent setting start on goal
        if (gridX === goal.x && gridY === goal.y) return;
        start = { x: gridX, y: gridY };
        environment.start = { ...start };
        currentState = { ...start };
        // Remove danger if present at new start
        environment.dangerZones = environment.dangerZones.filter(z => !(z.x === gridX && z.y === gridY));
    } else if (placementMode === 'goal') {
        // Prevent setting goal on start
        if (gridX === start.x && gridY === start.y) return;
        goal = { x: gridX, y: gridY };
        environment.goal = { ...goal };
        // Remove danger if present at new goal
        environment.dangerZones = environment.dangerZones.filter(z => !(z.x === gridX && z.y === gridY));
    }

    drawGrid();
});


// Helper function to update display with animation
function updateDisplay(element, value) {
    element.textContent = value;
    element.classList.add('updating');
    setTimeout(() => element.classList.remove('updating'), 300);
}

// Wait while paused
async function waitWhilePaused() {
    while (isPaused && !shouldStop) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

async function train(episodes = 1000) {
    isTraining = true;
    shouldStop = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    gridSizeSelect.disabled = true;
    runPolicyBtn.disabled = true;

    for (let i = 0; i < episodes; i++) {
        if (shouldStop) break;

        let state = environment.reset();
        let done = false;
        steps = 0;
        while (!done) {
            if (shouldStop) break;
            await waitWhilePaused();

            // Clear and redraw canvas
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(0, 0, width, height); // Clear canvas
            environment.draw(ctx, cellSize, offsetX, offsetY);
            agent.initializeState(state);
            const action = agent.chooseAction(state);

            const { state: nextState, reward, done: finished , isdangerzonevisited } =
                environment.step(state, action);
            agent.updateQValue(state, action, reward, nextState);
            environment.showCurrentState(ctx, cellSize, offsetX, offsetY, nextState);
            steps++;

            // Update HTML displays
            updateDisplay(episodeDisplay, i + 1);
            updateDisplay(stepsDisplay, steps);
            updateDisplay(epsilonDisplay, agent.epsilon.toFixed(3));

            if (finished && !isdangerzonevisited) {
                minStep = Math.min(minStep, steps);
                updateDisplay(minStepsDisplay, minStep);
                if(i === episodes - 1) {
                    console.log('Training completed');
                    isTrainingCompleted = true;
                    startBtn.disabled = true;
                }
            }

            // Apply execution delay based on speed slider
            if (executionDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, executionDelay));
            }
            agent.epsilon = Math.max(0.05, agent.epsilon * 0.99); // Decay epsilon
            state = nextState;
            done = finished;
        }
    }

    isTraining = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pause';
    gridSizeSelect.disabled = false;
    isPaused = false;
    runPolicyBtn.disabled = false; // Enable running trained policy
    console.log(agent.qTable);
}

// Button event listeners
startBtn.addEventListener('click', () => {
        if(isTrainingCompleted)
            return;
        train();
});

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
});

resetBtn.addEventListener('click', () => {
    shouldStop = true;
    isPaused = false;
    isTraining = false;
    isRunningPolicy = false;
    isTrainingCompleted = false;

    environment.dangerZones = []; // Clear danger zones
    // Reset agent
    agent = new Agent(['up', 'down', 'left', 'right'], {
        alpha: 0.5,
        gamma: 0.9,
        epsilon: 0.6
    });

    // Reset stats
    steps = 0;
    minStep = Infinity;
    currentState = { ...start };

    // Ensure environment uses current start/goal
    environment.start = { ...start };
    environment.goal = { ...goal };

    // Reset displays
    episodeDisplay.textContent = '0';
    stepsDisplay.textContent = '0';
    minStepsDisplay.textContent = '∞';
    epsilonDisplay.textContent = '0.60';

    // Reset buttons
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pause';
    gridSizeSelect.disabled = false;
    runPolicyBtn.disabled = true; // qTable cleared

    // Redraw grid
    drawGrid();
});

// Run agent using learned policy (greedy, no updates)
async function runPolicy() {
    if (isTraining) return;
    isRunningPolicy = true;
    shouldStop = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    gridSizeSelect.disabled = true;
    runPolicyBtn.disabled = true;

    let state = environment.reset();
    let done = false;
    steps = 0;
    // Show epsilon as 0 during policy run
    updateDisplay(epsilonDisplay, '0.00');

    while (!done) {
        if (shouldStop) break;
        await waitWhilePaused();

        ctx.fillStyle = '#2d3748';
        ctx.fillRect(0, 0, width, height);
        environment.draw(ctx, cellSize, offsetX, offsetY);
        agent.initializeState(state);
        const action = agent.chooseGreedyAction(state);

        const { state: nextState, reward, done: finished } = environment.step(state, action);
        environment.showCurrentState(ctx, cellSize, offsetX, offsetY, nextState);
        steps++;

        updateDisplay(stepsDisplay, steps);

        if (finished) {
            minStep = Math.min(minStep, steps);
            updateDisplay(minStepsDisplay, minStep);
        }

        if (executionDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, executionDelay));
        }
        state = nextState;
        done = finished;
    }

    isRunningPolicy = false;
    // startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pause';
    // gridSizeSelect.disabled = false;
    runPolicyBtn.disabled = false;
}

runPolicyBtn.addEventListener('click', () => {
    runPolicy();
});


