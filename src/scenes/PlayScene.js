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

    //Binding Keys
    this.keys = this.input.keyboard.createCursorKeys();
    this.advanceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    //Creating Player
    this.player = new Player(this, 100, 100, "character", 0, "down");
  }

  advanceDay() {
    this.day++;
    this.dayText.setText(`Day: ${this.day}`);
  }

  update() {
    this.playerFSM.step();
    if (Phaser.Input.Keyboard.JustDown(this.advanceKey)) {
      this.advanceDay();
    }
  }
}
