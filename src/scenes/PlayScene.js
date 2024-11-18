class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
    this.day = 1;
    this.sunLevel = 0;
    this.waterLevel = 0;
    this.playerSeedChoice = "grass";
  }

  create() {
    this.generateSunLevel();
    this.generateWaterLevel();
    this.createGrid();
    this.createUI();
    this.bindKeys();
    this.createPlayer();
    this.createInteractions();
    this.updateGrid();
  }

  update() {
    this.playerFSM.step();
    if (Phaser.Input.Keyboard.JustDown(this.advanceKey)) {
      this.advanceDay();
    }

    if (Phaser.Input.Keyboard.JustDown(this.QKey)) {
      this.updateSeedChoice("grass");
    } else if(Phaser.Input.Keyboard.JustDown(this.WKey)){
      this.updateSeedChoice("flower");
    } else if(Phaser.Input.Keyboard.JustDown(this.EKey)){
      this.updateSeedChoice("shrub");
    }
  }

  advanceDay() {
    this.day++;
    this.generateSunLevel();
    this.generateWaterLevel();
    this.updateUI();
    this.updateGrid()
  }

  bindKeys(){
    this.keys = this.input.keyboard.createCursorKeys();
    this.XKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.CKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.QKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.WKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.EKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.advanceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  createGrid(){
    const map = this.make.tilemap({ key: "map" });
    const tileset1 = map.addTilesetImage("grasstiles", "tileset-1");

    map.createLayer("Tile Layer 1", tileset1);

    // setting up cells
    this.cellGroup = this.add.group();
    this.cellGrid = [];
    const growthWidth = 15;
    const gridHeight = 15;
    const cellSize = 32;

    for (let row = 0; row < gridHeight; row++) {
      this.cellGrid[row] = [];
      for (let col = 0; col < growthWidth; col++) {
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;

        const cell = new Cell(this, x, y, "dirtTile");
        this.cellGrid[row][col] = cell;
        this.cellGroup.add(cell);
      }
    }
  }

  createUI(){
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

    this.sunLevelText = this.add.text(this.game.config.width / 2, this.game.config.height / 10 * 1.5, `Sun Level: ${this.sunLevel}`,
      {
        fontSize: "18px",
        color: "#ffffff",
      }).setOrigin(0.5, 0.5);
    
      this.waterLevelText = this.add.text(this.game.config.width / 2, this.game.config.height / 10 * 2, `Water Level: ${this.waterLevel}`,
        {
          fontSize: "18px",
          color: "#ffffff",
        }).setOrigin(0.5, 0.5);
  }

  createPlayer(){
    this.player = new Player(this, 100, 100, "character", 0, "down");
    this.playerSowTargetBox = this.physics.add.sprite(-10, -10).setSize(1, 1); //TargetBoxes starts off screen
    this.playerReapTargetBox = this.physics.add.sprite(-10, -10).setSize(1, 1);
  }

  createInteractions(){
    this.physics.add.overlap(this.cellGroup, this.playerSowTargetBox, (cell) => {
      cell.sowCell(this.playerSeedChoice);
      return;
    });
    this.physics.add.overlap(this.cellGroup, this.playerReapTargetBox, (cell) => {
      cell.reapCell();
      return;
    });
  }

  generateSunLevel(){
    this.sunLevel = Math.floor(Math.random() * 16);
  }

  generateWaterLevel(){
    this.waterLevel = Math.floor(Math.random() * 6);
  }

  updateUI(){
    this.dayText.setText(`Day: ${this.day}`);
    this.sunLevelText.setText(`Sun Level: ${this.sunLevel}`);
    this.waterLevelText.setText(`Water Level: ${this.waterLevel}`);
  }

  updateSeedChoice(seedChoice){
    console.log("Now planting " + seedChoice);
    this.playerSeedChoice = seedChoice;
  }

  updateGrid(){
    this.cellGroup.getChildren().forEach(cell => {
      if(cell.checkIsPlanted()){
        console.log(cell);
        cell.checkCellGrowth();
      }
      cell.addWater(this.waterLevel);
    })
  }
}
