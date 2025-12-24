# 🤖 Reinforcement Learning Grid World

An interactive visualization of **Q-Learning**, a fundamental reinforcement learning algorithm, implemented in vanilla JavaScript. Watch an AI agent learn to navigate from start to goal while avoiding danger zones!

![RL Grid World Demo](https://img.shields.io/badge/JavaScript-Vanilla-yellow) ![Algorithm-Q--Learning-blue](https://img.shields.io/badge/Algorithm-Q--Learning-blue) ![Status-Interactive-green](https://img.shields.io/badge/Status-Interactive-green)

## 📖 Table of Contents

- [Overview](#-overview)
- [How It Works](#-how-it-works)
- [Q-Learning Algorithm](#-q-learning-algorithm)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Understanding the Visualization](#-understanding-the-visualization)

---

## 🎯 Overview

This project demonstrates **Q-Learning**, a model-free reinforcement learning algorithm. The agent learns to navigate a grid from the **start position** (top-left) to the **goal position** (bottom-right) while avoiding **danger zones** that you can place interactively.

### Key Concepts Demonstrated:
- **Exploration vs Exploitation** (ε-greedy policy)
- **Temporal Difference Learning**
- **Q-Value Updates**
- **Reward Shaping**

---

## 🧠 How It Works

### The Environment

The environment is a nxn grid where:

| Cell Type | Color | Description |
|-----------|-------|-------------|
| **Start** | 🟦 Light Blue | Agent's starting position (user-selected) |
| **Goal** | 🟩 Light Green | Target destination (user-selected) |
| **Danger Zone** | 🟥 Red | Obstacles with negative reward |
| **Agent** | 🟧 Orange | Current position of the learning agent |

### The Agent

The agent can take 4 actions at each step:
- ⬆️ **Up** - Move one cell up
- ⬇️ **Down** - Move one cell down  
- ⬅️ **Left** - Move one cell left
- ➡️ **Right** - Move one cell right

### Reward Structure

| Event | Reward | Purpose |
|-------|--------|---------|
| Reaching Goal | **+1.0** | Encourage goal-seeking behavior |
| Stepping on Danger | **-1.0** | Discourage dangerous paths |
| Each Step | **-0.01** | Encourage finding shortest path |

---

## 📊 Q-Learning Algorithm

### The Q-Learning Formula

The agent updates its Q-values using the Bellman equation:

```
Q(s, a) ← Q(s, a) + α × [r + γ × max(Q(s', a')) - Q(s, a)]
```

Where:
- **Q(s, a)** = Q-value for state `s` and action `a`
- **α (alpha)** = Learning rate (how much new info overrides old)
- **r** = Reward received after taking action
- **γ (gamma)** = Discount factor (importance of future rewards)
- **s'** = Next state
- **max(Q(s', a'))** = Maximum Q-value for the next state

### Epsilon-Greedy Policy

The agent balances exploration and exploitation:

```javascript
if (Math.random() < epsilon) {
    // EXPLORE: Choose random action
    return randomAction();
} else {
    // EXPLOIT: Choose best known action
    return actionWithHighestQValue();
}
```

- **High ε (epsilon)**: More exploration (random actions)
- **Low ε**: More exploitation (best-known actions)
- **ε decay**: Gradually reduces over time (0.99× per step)

### Hyperparameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| **α (alpha)** | 0.5 | Learning rate - Higher = faster learning but less stable |
| **γ (gamma)** | 0.9 | Discount factor - Higher = more weight on future rewards |
| **ε (epsilon)** | 0.6 | Initial exploration rate - Decays to 0.05 minimum |

---

## 📁 Project Structure

```
rl-learning/
├── index.html      # Main HTML with UI components
├── style.css       # Modern responsive styling
├── main.js         # Training loop, UI controls, event handlers
├── agent.js        # Q-Learning agent implementation
├── environment.js  # Grid world environment
└── README.md       # This documentation
```

### File Descriptions

#### `agent.js` - The Learning Agent
```javascript
class Agent {
    constructor(actions, { alpha, gamma, epsilon })
    getStateKey(state)      // Convert {x,y} to "x,y" string
    initializeState(state)  // Initialize Q-values for new states
    chooseAction(state)     // Epsilon-greedy action selection
    updateQValue(...)       // Q-learning update rule
}
```

#### `environment.js` - The Grid World
```javascript
class Environment {
    constructor(gridSize, start, goal)
    draw(ctx, cellSize, offsetX, offsetY)  // Render the grid
    reset()                                 // Reset to start position
    step(state, action)                     // Execute action, return {state, reward, done}
    showCurrentState(...)                   // Draw agent position
}
```

#### `main.js` - Application Controller
- Canvas setup and rendering
- Training loop with async/await
- UI event handlers (buttons, slider, clicks)
- Pause/Resume/Reset functionality
- Speed control

---

## ✨ Features

### Interactive Controls
- **▶️ Start Training** - Begin the learning process
- **⏸️ Pause / ▶️ Resume** - Pause and resume training
- **🔄 Reset** - Clear Q-table and restart
- **📍 Placement Mode** - Switch between placing Danger Zones, Start, and Goal

### Grid Size Selector
- **Dropdown menu** - Choose grid size from 3×3 to 10×10
- Automatically adjusts cell size to fit the canvas
- Goal position updates to bottom-right corner
- Available sizes: 3×3, 4×4, 5×5 (default), 6×6, 7×7, 8×8, 10×10

### Speed Control
- **Slider** - Adjust execution speed from slow (500ms) to max (instant)
- Real-time adjustment during training

### Custom Danger Zones
- **Click on cells** to toggle danger zones before training
- Design your own maze/obstacle course
- Start and goal cells are protected
- Use Placement Mode to set the Start and Goal cells directly

### Live Statistics
- **Episode** - Current training episode (out of 1000)
- **Steps** - Steps taken in current episode
- **Best Steps** - Minimum steps achieved to reach goal
- **Epsilon** - Current exploration rate (decays over time)

---

## 🚀 Usage

### Getting Started

1. **Open** `index.html` in a web browser
2. **Select grid size** from the dropdown (3×3 to 10×10)
3. **Choose Placement Mode**: Danger Zones, Set Start, or Set Goal
4. **Click cells** on the grid to place according to the mode (optional)
5. **Adjust speed** using the slider (optional)
6. **Click "Start Training"** to begin

### Watching the Agent Learn

1. **Early episodes (high ε)**: Agent explores randomly, often hitting danger zones
2. **Mid training**: Agent starts finding paths but still explores
3. **Late episodes (low ε)**: Agent consistently takes optimal/near-optimal paths
4. **Last 10 episodes**: Slower playback to observe final learned behavior

### Tips

- Create challenging mazes to see how the agent adapts
- Watch the "Best Steps" metric decrease as learning improves
- Pause training to examine the agent's current position
- Reset and try different danger zone configurations

---

## ⚙️ Configuration

### Modify Hyperparameters

In `main.js`, adjust the agent initialization:

```javascript
let agent = new Agent(['up', 'down', 'left', 'right'], {
    alpha: 0.5,    // Learning rate (0.0 - 1.0)
    gamma: 0.9,    // Discount factor (0.0 - 1.0)
    epsilon: 0.6   // Initial exploration rate (0.0 - 1.0)
});
```

### Modify Grid Size

In `main.js`:
```javascript
const cellSize = 50;  // Pixel size of each cell
const gridSize = 5;   // 5x5 grid (change to 7 for 7x7, etc.)
```

### Modify Episode Count

In `main.js`, change the train function call:
```javascript
train(1000);  // Number of episodes
```

---

## 🎨 Understanding the Visualization

### What You'll Observe

1. **Random Movement Phase**
   - High epsilon → Agent tries random directions
   - Often gets stuck or hits danger zones
   - Many steps per episode

2. **Learning Phase**
   - Agent starts remembering good paths
   - Fewer danger zone hits
   - Step count begins decreasing

3. **Exploitation Phase**
   - Low epsilon → Agent follows learned policy
   - Consistent, efficient paths
   - Near-optimal step counts

### The Q-Table

After training, view the learned Q-values in the browser console:
```javascript
console.log(agent.qTable);
```

Example output:
```javascript
{
  "0,0": { up: -0.1, down: 0.5, left: -0.1, right: 0.3 },
  "1,0": { up: -0.2, down: 0.6, left: 0.2, right: 0.4 },
  // ... more states
}
```

Higher Q-values indicate preferred actions for each state.

---

## 📚 Learn More

### Reinforcement Learning Resources
- [Sutton & Barto - Reinforcement Learning: An Introduction](http://incompleteideas.net/book/the-book.html)
- [Q-Learning Wikipedia](https://en.wikipedia.org/wiki/Q-learning)
- [OpenAI Spinning Up](https://spinningup.openai.com/)

### Key Concepts
- **Markov Decision Process (MDP)** - The mathematical framework
- **Value Iteration** - Related dynamic programming approach
- **Deep Q-Networks (DQN)** - Neural network extension of Q-learning

---

## 🛠️ Future Improvements

- [ ] Add diagonal movement options
- [ ] Implement SARSA algorithm comparison
- [ ] Add Q-value heatmap visualization
- [ ] Save/load trained Q-tables
- [ ] Add multiple goal states
- [ ] Implement policy visualization (arrows showing best actions)

---

## 📄 License

This project is open source and available for educational purposes.

---

Made with ❤️ for learning Reinforcement Learning