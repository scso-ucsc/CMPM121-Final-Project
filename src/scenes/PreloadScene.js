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
    this.load.spritesheet("grass", "./assets/grassgrowth.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("shrub", "./assets/bushgrowth.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("flower", "./assets/flowergrowth.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  createPlantAnimations() {
    this.anims.create({
      key: "sow-grass",
      frames: this.anims.generateFrameNumbers("grass", {
        start: 0,
        end: 0,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "1-grass",
      frames: this.anims.generateFrameNumbers("grass", {
        start: 1,
        end: 1,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "2-grass",
      frames: this.anims.generateFrameNumbers("grass", {
        start: 2,
        end: 2,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "3-grass",
      frames: this.anims.generateFrameNumbers("grass", {
        start: 3,
        end: 3,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "reap-grass",
      frames: this.anims.generateFrameNumbers("grass", {
        start: 4,
        end: 4,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "sow-shrub",
      frames: this.anims.generateFrameNumbers("shrub", {
        start: 0,
        end: 0,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "1-shrub",
      frames: this.anims.generateFrameNumbers("shrub", {
        start: 1,
        end: 1,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "2-shrub",
      frames: this.anims.generateFrameNumbers("shrub", {
        start: 2,
        end: 2,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "3-shrub",
      frames: this.anims.generateFrameNumbers("shrub", {
        start: 3,
        end: 3,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "reap-shrub",
      frames: this.anims.generateFrameNumbers("shrub", {
        start: 4,
        end: 4,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "sow-flower",
      frames: this.anims.generateFrameNumbers("flower", {
        start: 0,
        end: 0,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "1-flower",
      frames: this.anims.generateFrameNumbers("flower", {
        start: 1,
        end: 1,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "2-flower",
      frames: this.anims.generateFrameNumbers("flower", {
        start: 2,
        end: 2,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "3-flower",
      frames: this.anims.generateFrameNumbers("flower", {
        start: 3,
        end: 3,
      }),
      repeat: -1,
    });
    this.anims.create({
      key: "reap-flower",
      frames: this.anims.generateFrameNumbers("flower", {
        start: 4,
        end: 4,
      }),
      repeat: -1,
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
    this.createPlantAnimations();

    //Controls Text
    document.getElementById("info").innerHTML =
      "<strong>CONTROLS:</strong> ARROWS - Move | X - Reap Cell | C - Sow Cell | SPACE - Advance Time | Q - Choose Grass | W - Choose Flower | E - Choose Shrub | Z - Undo | Y - Redo";

    //Start Game
    this.scene.start("PlayScene");
  }
}
