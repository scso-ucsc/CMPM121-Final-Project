class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.image("dirtTile", "assets/dirttile.png");
    this.load.tilemapTiledJSON("map", "assets/grassymap.json");
    this.load.image("tileset-1", "assets/grasstiles.png");
    this.load.spritesheet("character", "./assets/character.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
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

  create() {
    this.createPlayerAnimations();

    //Controls Text
    document.getElementById("info").innerHTML =
      "<strong>CONTROLS:</strong> ARROWS - Move | X - Reap Cell | C - Sow Cell | SPACE - Advance Time | Q - Choose Grass | W - Choose Flower | E - Choose Shrub";

    //Start Game
    this.scene.start("PlayScene");
  }
}
