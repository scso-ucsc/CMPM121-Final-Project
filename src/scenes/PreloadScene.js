class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.tilemapTiledJSON("map", "assets/grassymap.json");
    this.load.image("tileset-1", "assets/grasstiles.png");
  }

  create() {
    this.scene.start("PlayScene");
  }
}
