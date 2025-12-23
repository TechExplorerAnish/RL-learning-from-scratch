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

// Speed control
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
let executionDelay = 0; // 0ms = max speed

speedSlider.addEventListener('input', () => {
    const value = parseInt(speedSlider.value);
    // Invert: 100 = fast (0ms delay), 0 = slow (500ms delay)
    executionDelay = Math.round((100 - value) * 5)+100; // 0-500ms range
    
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

const cellSize = 50; // Size of each grid cell
const gridSize = 5; // 5x5 grid
const offsetX = (width - cellSize * gridSize) / 2; // Center the grid horizontally
const offsetY = (height - cellSize * gridSize) / 2; // Center the grid vertically

const start = { x: 0, y: 0 }; // Starting position of the agent
const goal = { x: 4, y: 4 }; // Goal position


canvas.width = width;
canvas.height = height;

const environment = new Environment(gridSize, start, goal);
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

// Initial draw
function drawGrid() {
    console.log('Drawing grid');
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, width, height);
    environment.draw(ctx, cellSize, offsetX, offsetY);
}
drawGrid();

// Click handler for toggling danger zones
canvas.addEventListener('click', (e) => {
    if (isTraining) return; // Don't allow changes during training
    
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
    
    // Don't allow toggling start or goal
    if ((gridX === start.x && gridY === start.y) || (gridX === goal.x && gridY === goal.y)) return;
    
    // Toggle danger zone
    const existingIndex = environment.dangerZones.findIndex(z => z.x === gridX && z.y === gridY);
    if (existingIndex >= 0) {
        environment.dangerZones.splice(existingIndex, 1);
    } else {
        environment.dangerZones.push({ x: gridX, y: gridY });
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

            const { state: nextState, reward, done: finished } =
                environment.step(state, action);
            agent.updateQValue(state, action, reward, nextState);
            environment.showCurrentState(ctx, cellSize, offsetX, offsetY, nextState);
            steps++;
            
            // Update HTML displays
            updateDisplay(episodeDisplay, i + 1);
            updateDisplay(stepsDisplay, steps);
            updateDisplay(epsilonDisplay, agent.epsilon.toFixed(3));
            
            if (finished) {
                console.log(`Episode ${i + 1} finished in ${steps} steps.`);
                minStep = Math.min(minStep, steps);
                updateDisplay(minStepsDisplay, minStep);
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
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pause';
    isPaused = false;
    console.log(agent.qTable);
}

// Button event listeners
startBtn.addEventListener('click', () => {
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
    
    // Reset displays
    episodeDisplay.textContent = '0';
    stepsDisplay.textContent = '0';
    minStepsDisplay.textContent = '∞';
    epsilonDisplay.textContent = '0.60';
    
    // Reset buttons
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pause';
    
    // Redraw grid
    drawGrid();
});
