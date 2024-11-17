class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.tilemapTiledJSON("map", "assets/grassymap.json");
    this.load.image("tileset-1", "assets/grasstiles.png");
    this.load.spritesheet("character", "./assets/character.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    this.scene.start("PlayScene");
  }
}
