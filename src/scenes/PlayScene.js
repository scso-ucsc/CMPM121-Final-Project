class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
    this.day = 1;
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset1 = map.addTilesetImage("grasstiles", "tileset-1");

    map.createLayer("Tile Layer 1", tileset1);

    this.dayText = this.add
      .text(
        this.game.config.width / 2,
        this.game.config.height / 10,
        `Day: ${this.day}`,
        {
          fontSize: "24px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5, 0.5);

    this.player = this.physics.add.sprite(100, 100, "character");
    this.createPlayerAnimations();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.advanceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  createPlayerAnimations() {
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("character", {
        start: 0,
        end: 3,
      }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: "walk-down",
      frames: this.anims.generateFrameNumbers("character", {
        start: 4,
        end: 7,
      }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: "walk-up",
      frames: this.anims.generateFrameNumbers("character", {
        start: 8,
        end: 11,
      }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: "walk-right",
      frames: this.anims.generateFrameNumbers("character", {
        start: 12,
        end: 15,
      }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: "walk-left",
      frames: this.anims.generateFrameNumbers("character", {
        start: 16,
        end: 19,
      }),
      frameRate: 4,
      repeat: -1,
    });
  }

  advanceDay() {
    this.day++;
    this.dayText.setText(`Day: ${this.day}`);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.advanceKey)) {
      this.advanceDay();
    }

    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-100);
      this.player.anims.play("walk-left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(100);
      this.player.anims.play("walk-right", true);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-100);
      this.player.anims.play("walk-up", true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(100);
      this.player.anims.play("walk-down", true);
    } else {
      this.player.anims.play("idle", true);
    }
  }
}
