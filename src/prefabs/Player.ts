// Import necessary Phaser modules
import Phaser from "phaser";

// Player Prefab
export class Player extends Phaser.Physics.Arcade.Sprite {
    private parentScene: Phaser.Scene;
    public speed: number;
    public direction: string;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: string | number, direction: string) {
        super(scene, x, y, texture, frame);
        this.parentScene = scene;
        this.parentScene.add.existing(this); // Adding Player to Scene
        this.parentScene.physics.add.existing(this); // Adding Physics
        this.setCollideWorldBounds(true);

        // Player Variables
        this.speed = 100;
        this.direction = direction;

        // Initializing State Machine
        (scene as any).playerFSM = new StateMachine("idle", {
            idle: new IdleState(),
            move: new MoveState(),
            reap: new ReapState(),
            sow: new SowState()
        }, [scene, this]);
    }
}

// Base State Class
class State {
    protected stateMachine: StateMachine;

    setStateMachine(stateMachine: StateMachine) {
        this.stateMachine = stateMachine;
    }

    enter(scene: Phaser.Scene, player: Player): void {}
    execute(scene: Phaser.Scene, player: Player): void {}
}

// State Machine Class
export class StateMachine {
    private states: { [key: string]: State };
    private currentState: State;
    private currentStateName: string;

    constructor(initialState: string, states: { [key: string]: State }, private context: any[]) {
        this.states = states;
        this.currentStateName = initialState;
        this.currentState = states[initialState];
        this.currentState.setStateMachine(this);
        this.currentState.enter(...this.context);
    }

    transition(newState: string): void {
        if (this.currentStateName === newState) return;

        this.currentStateName = newState;
        this.currentState = this.states[newState];
        this.currentState.setStateMachine(this);
        this.currentState.enter(...this.context);
    }

    update(): void {
        this.currentState.execute(...this.context);
    }
}

// Individual States
class IdleState extends State {
    enter(scene: Phaser.Scene, player: Player): void {
        player.setVelocity(0);
        player.anims.play("idle");
    }

    execute(scene: Phaser.Scene, player: Player): void {
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

class MoveState extends State {
    execute(scene: Phaser.Scene, player: Player): void {
        const { left, right, up, down } = scene.input.keyboard.createCursorKeys();

        if (!(left.isDown || right.isDown || up.isDown || down.isDown)) {
            this.stateMachine.transition("idle");
            return;
        }

        if (left.isDown) {
            player.setVelocityX(-player.speed);
            player.setVelocityY(0);
            player.direction = "left";
        } else if (right.isDown) {
            player.setVelocityX(player.speed);
            player.setVelocityY(0);
            player.direction = "right";
        } else if (up.isDown) {
            player.setVelocityY(-player.speed);
            player.setVelocityX(0);
            player.direction = "up";
        } else if (down.isDown) {
            player.setVelocityY(player.speed);
            player.setVelocityX(0);
            player.direction = "down";
        }
        player.anims.play(`walk-${player.direction}`, true);
    }
}

class ReapState extends State {
    enter(scene: Phaser.Scene, player: Player): void {
        player.setVelocity(0);
        const playerReapTargetBox = (scene as any).playerReapTargetBox;
        playerReapTargetBox.x = player.x;
        playerReapTargetBox.y = player.y;

        scene.time.delayedCall(500, () => {
            playerReapTargetBox.x = -10;
            playerReapTargetBox.y = -10;
            this.stateMachine.transition("idle");
        });
    }
}

class SowState extends State {
    enter(scene: Phaser.Scene, player: Player): void {
        player.setVelocity(0);
        const playerSowTargetBox = (scene as any).playerSowTargetBox;
        playerSowTargetBox.x = player.x;
        playerSowTargetBox.y = player.y;

        scene.time.delayedCall(500, () => {
            playerSowTargetBox.x = -10;
            playerSowTargetBox.y = -10;
            this.stateMachine.transition("idle");
        });
    }
}
