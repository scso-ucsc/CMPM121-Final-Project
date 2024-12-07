/* eslint-disable @typescript-eslint/no-unused-vars */
// Import necessary Phaser modules
import Phaser from "phaser";
// Player Prefab
export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, direction) {
        super(scene, x, y, texture, frame);
        this.parentScene = scene;
        this.parentScene.add.existing(this); // Adding Player to Scene
        this.parentScene.physics.add.existing(this); // Adding Physics
        this.setCollideWorldBounds(true);
        // Player Variables
        this.speed = 100;
        this.direction = direction;
        this.cTuple = [scene, this];
        // Initializing State Machine
        scene.playerFSM = new StateMachine("idle", {
            idle: new IdleState(),
            move: new MoveState(),
            reap: new ReapState(),
            sow: new SowState()
        }, this.cTuple);
    }
}
// Base State Class
class State {
    constructor() {
        this.stateMachine = null;
    }
    setStateMachine(stateMachine) {
        this.stateMachine = stateMachine;
    }
    enter(scene, player) { }
    execute(scene, player) { }
}
// State Machine Class
export class StateMachine {
    constructor(initialState, states, context) {
        this.context = context;
        this.states = states;
        this.currentStateName = initialState;
        this.currentState = states[initialState];
        this.currentState.setStateMachine(this);
        this.currentState.enter(...this.context);
    }
    transition(newState) {
        if (this.currentStateName === newState)
            return;
        this.currentStateName = newState;
        this.currentState = this.states[newState];
        this.currentState.setStateMachine(this);
        this.currentState.enter(...this.context);
    }
    update() {
        this.currentState.execute(...this.context);
    }
}
// Individual States
class IdleState extends State {
    enter(scene, player) {
        player.setVelocity(0);
        player.anims.play("idle");
    }
    execute(scene, player) {
        if (scene.input.keyboard && this.stateMachine) {
            const { left, right, up, down } = scene.input.keyboard.createCursorKeys();
            const XKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
            const CKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
            if (XKey.isDown) {
                this.stateMachine.transition("reap");
                return;
            }
            if (CKey.isDown) {
                this.stateMachine.transition("sow");
                return;
            }
            if (left.isDown || right.isDown || up.isDown || down.isDown) {
                this.stateMachine.transition("move");
                return;
            }
        }
    }
}
class MoveState extends State {
    execute(scene, player) {
        if (scene.input.keyboard && this.stateMachine) {
            const { left, right, up, down } = scene.input.keyboard.createCursorKeys();
            if (!(left.isDown || right.isDown || up.isDown || down.isDown)) {
                this.stateMachine.transition("idle");
                return;
            }
            if (left.isDown) {
                player.setVelocityX(-player.speed);
                player.setVelocityY(0);
                player.direction = "left";
            }
            else if (right.isDown) {
                player.setVelocityX(player.speed);
                player.setVelocityY(0);
                player.direction = "right";
            }
            else if (up.isDown) {
                player.setVelocityY(-player.speed);
                player.setVelocityX(0);
                player.direction = "up";
            }
            else if (down.isDown) {
                player.setVelocityY(player.speed);
                player.setVelocityX(0);
                player.direction = "down";
            }
            player.anims.play(`walk-${player.direction}`, true);
        }
    }
}
class ReapState extends State {
    enter(scene, player) {
        player.setVelocity(0);
        const playerReapTargetBox = scene.playerReapTargetBox;
        if (playerReapTargetBox) {
            playerReapTargetBox.x = player.x;
            playerReapTargetBox.y = player.y;
            scene.time.delayedCall(500, () => {
                playerReapTargetBox.x = -10;
                playerReapTargetBox.y = -10;
                if (this.stateMachine) {
                    this.stateMachine.transition("idle");
                }
            });
        }
    }
}
class SowState extends State {
    enter(scene, player) {
        player.setVelocity(0);
        const playerSowTargetBox = scene.playerSowTargetBox;
        if (playerSowTargetBox) {
            playerSowTargetBox.x = player.x;
            playerSowTargetBox.y = player.y;
            scene.time.delayedCall(500, () => {
                playerSowTargetBox.x = -10;
                playerSowTargetBox.y = -10;
                if (this.stateMachine) {
                    this.stateMachine.transition("idle");
                }
            });
        }
    }
}
//# sourceMappingURL=Player.js.map