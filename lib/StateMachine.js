//Based on https://phaser.io/news/2020/06/phaser-tutorial-series-finite-state-machine

class StateMachine {
    constructor(initialState, possibleStates, stateArgs=[]) {
        this.initialState = initialState;
        this.possibleStates = possibleStates;
        this.stateArgs = stateArgs;
        this.state = null;

        for(const state of Object.values(this.possibleStates)) {
            state.stateMachine = this;
        }
    }

    step() {
        if(this.state === null) {
            this.state = this.initialState;
            this.possibleStates[this.state].enter(...this.stateArgs);
        }

        // run the current state's execute method
        this.possibleStates[this.state].execute(...this.stateArgs);
    }

    transition(newState, ...enterArgs) {
        this.state = newState;
        this.possibleStates[this.state].enter(...this.stateArgs, ...enterArgs);
    }
}

// parent class structure for all `State` subclasses
class State {
    enter() {
        // this code happens *once* when we enter the state
    }
    execute() {
        // this code happens each update step (ie every frame)
    }
}