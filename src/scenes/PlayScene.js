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

    // setting up cells
    this.cellGrid = [];
    const growthWidth = 20;
    const gridHeight = 20;
    const cellSize = 32;

    for (let row = 0; row < gridHeight; row++) {
      this.cellGrid[row] = [];
      for (let col = 0; col < growthWidth; col++) {
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;

        const cell = new Cell(this, x, y, "dirtTile");
        this.cellGrid[row][col] = cell;
      }
    }

    //Binding Keys
    this.keys = this.input.keyboard.createCursorKeys();
    this.XKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.CKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.advanceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    //Creating Player
    this.player = new Player(this, 100, 100, "character", 0, "down");
    this.playerTargetBox = this.physics.add.sprite(-10, -10).setSize(10, 10); //TargetBox starts off screen
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
