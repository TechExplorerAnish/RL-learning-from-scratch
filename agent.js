class Agent {
    constructor(actions, {
        alpha = 0.01,
        gamma = 0.9,
        epsilon = 0.2
    } = {}) {
        this.actions = actions; // Possible actions the agent can take
        this.alpha = alpha; // Learning rate
        this.gamma = gamma; // Discount factor
        this.epsilon = epsilon; // Exploration rate
        this.qTable = {}; // Q-value table
    }

    // convert state object to string key
    getStateKey(state) {
        return `${state.x},${state.y}`;
    }

    // Initialize Q-values for a state if not already present
    initializeState(state) {
        const stateKey = this.getStateKey(state);
        if (!(stateKey in this.qTable)) {
            this.qTable[stateKey] = {};
            this.actions.forEach(action => {
                this.qTable[stateKey][action] = 0;
            })
        }
    }


    // Choose action using epsilon-greedy policy
    chooseAction(state) {
        this.initializeState(state);
        if (Math.random() < this.epsilon) {
            // Explore: choose a random action
            const randomIndex = Math.floor(Math.random() * this.actions.length)
            return this.actions[randomIndex];
        }
        // Exploit: choose the best action based on Q-values

        const stateKey = this.getStateKey(state);
        let maxQ = -Infinity;
        let bestAction = null;

        for (const action of this.actions) {
            const qValue = this.qTable[stateKey][action];
            if (qValue > maxQ) {
                maxQ = qValue;
                bestAction = action;
            }
        }
       
        return bestAction;
    }

    // Update Q-value based on the action taken and the reward received
    updateQValue(state, action, reward, nextState) {
        this.initializeState(state);
        this.initializeState(nextState);

        const stateKey = this.getStateKey(state);
        const nextStateKey = this.getStateKey(nextState);

        const maxNextQ = Math.max(...Object.values(this.qTable[nextStateKey]));

        // Q-learning formula
        this.qTable[stateKey][action] += this.alpha * (reward + this.gamma * maxNextQ - this.qTable[stateKey][action]);
    }

}

