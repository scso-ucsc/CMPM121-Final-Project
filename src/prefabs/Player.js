//Player Prefab
class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture, frame, direction){
        super(scene, x, y, texture, frame);
        this.parentScene = scene;
        this.parentScene.add.existing(this); //Adding Player to Scene
        this.parentScene.physics.add.existing(this); //Adding Physics
        this.setCollideWorldBounds(true);

        //Player Variables
        this.speed = 100;
        this.direction = direction;

        //Initialising State Machine
        scene.playerFSM = new StateMachine("idle", {
            idle: new IdleState(),
            move: new MoveState(),
            reap: new ReapState(),
            sow: new SowState()
        }, [scene, this]);
    }
}

class IdleState extends State{
    enter(scene, player){
        player.setVelocity(0);
        player.anims.play("idle");
    }

    execute(scene, player){
        const {left, right, up, down} = scene.keys;
        const XKey = scene.XKey;
        const CKey = scene.CKey;

        if(XKey.isDown){
            this.stateMachine.transition("reap");
            return;
        }

        if(CKey.isDown){
            this.stateMachine.transition("sow");
            return;
        }

        if(left.isDown || right.isDown || up.isDown || down.isDown){
            this.stateMachine.transition("move");
            return;
        }
    }
}

class MoveState extends State{
    execute(scene, player){
        const {left, right, up, down} = scene.keys;
        const XKey = scene.XKey;
        const CKey = scene.CKey;
        
        if(!(left.isDown || right.isDown || up.isDown || down.isDown)){
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

class ReapState extends State{
    enter(scene, player){
        player.setVelocity(0);
        console.log("REAP");
        scene.playerTargetBox.x = player.x;
        scene.playerTargetBox.y = player.y;
        
        scene.time.delayedCall(500, () => {
            scene.playerTargetBox.x = -10;
            scene.playerTargetBox.y = -10;
            this.stateMachine.transition("idle");
            return;
        })
    }
}

class SowState extends State{
    enter(scene, player){
        player.setVelocity(0);
        console.log("SOW");
        scene.playerTargetBox.x = player.x;
        scene.playerTargetBox.y = player.y;
        
        scene.time.delayedCall(500, () => {
            scene.playerTargetBox.x = -10;
            scene.playerTargetBox.y = -10;
            this.stateMachine.transition("idle");
            return;
        })
    }
}