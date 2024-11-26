class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
    this.day = 1;
    this.sunLevel = 0;
    this.waterLevel = 0;
    this.playerSeedChoice = "grass";
    this.textdepth = 11;
    this.playerdepth = 10;
    this.undoStack = [];
    this.redoStack = [];
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
    this.createSaveLoadUI();
    this.autoSaveInitilizer();
  }

  update() {
    this.playerFSM.step();
    if (Phaser.Input.Keyboard.JustDown(this.advanceKey)) {
      this.recordState();
      this.advanceDay();
    }

    if (Phaser.Input.Keyboard.JustDown(this.QKey)) {
      this.updateSeedChoice("grass");
    } else if (Phaser.Input.Keyboard.JustDown(this.WKey)) {
      this.updateSeedChoice("flower");
    } else if (Phaser.Input.Keyboard.JustDown(this.EKey)) {
      this.updateSeedChoice("shrub");
    }

    if (Phaser.Input.Keyboard.JustDown(this.undoKey)) {
      this.undo();
    } else if (Phaser.Input.Keyboard.JustDown(this.redoKey)) {
      this.redo();
    }
  }

  advanceDay() {
    this.day++;
    this.generateSunLevel();
    this.generateWaterLevel();
    this.updateUI();
    this.updateGrid();
    this.checkEndCondition();
  }

  bindKeys() {
    this.keys = this.input.keyboard.createCursorKeys();
    this.XKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.CKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.QKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.WKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.EKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.advanceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.undoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.redoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
  }

  //helper functions to access byte array
  getCellIndex(row, col) {
    return (row * this.gridWidth + col) * this.bytesPerCell;
  }

  getPlantType(row, col) {
    return this.gridState[this.getCellIndex(row, col)];
  }

  getWaterLevel(row, col) {
    return this.gridState[this.getCellIndex(row, col) + 1];
  }

  getGrowthLevel(row, col) {
    return this.gridState[this.getCellIndex(row, col) + 2];
  }

  setPlantType(row, col, type) {
    this.gridState[this.getCellIndex(row, col)] = type;
  }

  setWaterLevel(row, col, water) {
    this.gridState[this.getCellIndex(row, col) + 1] = water;
  }

  setGrowthLevel(row, col, growth) {
    this.gridState[this.getCellIndex(row, col) + 2] = growth;
  }

  createGrid() {
    const cellSize = 32;

    this.cellGroup = this.add.group();
    this.gridWidth = 15;
    this.gridHeight = 15;
    // For each cell: plantType, waterLevel, growthLevel
    this.bytesPerCell = 3;

    const totalCells = this.gridWidth * this.gridHeight;
    // byte array
    this.gridState = new Uint8Array(totalCells * this.bytesPerCell);

    for (let row = 0; row < this.gridHeight; row++) {
      for (let col = 0; col < this.gridWidth; col++) {
        // init the byte array and make them start with nothing
        const index = this.getCellIndex(row, col);
        this.gridState[index] = 0;
        this.gridState[index + 1] = 0;
        this.gridState[index + 2] = 0;

        // now create Cell prefab
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        const cell = new Cell(this, x, y, "dirtTile", row, col);
        this.cellGroup.add(cell);
      }
    }
  }

  createUI() {
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
    this.dayText.setDepth(this.textdepth);
    this.sunLevelText = this.add
      .text(
        this.game.config.width / 2,
        (this.game.config.height / 10) * 1.5,
        `Sun Level: ${this.sunLevel}`,
        {
          fontSize: "18px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5, 0.5);
    this.sunLevelText.setDepth(this.textdepth);
    this.waterLevelText = this.add
      .text(
        this.game.config.width / 2,
        (this.game.config.height / 10) * 2,
        `Water Level: ${this.waterLevel}`,
        {
          fontSize: "18px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5, 0.5);
    this.waterLevelText.setDepth(this.textdepth);
  }

  createPlayer() {
    this.player = new Player(this, 100, 100, "character", 0, "down");
    this.playerSowTargetBox = this.physics.add.sprite(-10, -10).setSize(1, 1); //TargetBoxes starts off screen
    this.playerReapTargetBox = this.physics.add.sprite(-10, -10).setSize(1, 1);
    this.player.setDepth(this.playerdepth);
  }

  createInteractions() {
    // sowing
    this.physics.add.overlap(
      this.cellGroup,
      this.playerSowTargetBox,
      (cell) => {
        cell.sowCell(this.playerSeedChoice);
      }
    );

    // reaping
    this.physics.add.overlap(
      this.cellGroup,
      this.playerReapTargetBox,
      (cell) => {
        cell.reapCell();
      }
    );
  }

  createSaveLoadUI() {
    this.saveButton1 = this.createSaveButton(0, 1);
    this.saveButton2 = this.createSaveButton(25, 2);
    this.saveButton3 = this.createSaveButton(50, 3);
    this.loadButton1 = this.createLoadButton(0, 1);
    this.loadButton2 = this.createLoadButton(25, 2);
    this.loadButton3 = this.createLoadButton(50, 3);
  }

  createSaveButton(yOffset, slotNumber) {
    const saveButton = this.add.text(10, 400 + yOffset, `Save Slot ${slotNumber.toString()}`, {fill: "#ffffff"}).setInteractive().on("pointerdown", () => this.saveGame(slotNumber));
    return saveButton;
  }

  createLoadButton(yOffset, slotNumber) {
    const loadButton = this.add.text(360, 400 + yOffset, `Load Slot ${slotNumber.toString()}`, {fill: "#ffffff"}).setInteractive().on("pointerdown", () => this.loadGame(slotNumber));
    return loadButton;
  }

  generateSunLevel() {
    this.sunLevel = Math.floor(Math.random() * 16);
  }

  generateWaterLevel() {
    this.waterLevel = Math.floor(Math.random() * 6);
  }

  updateUI() {
    this.dayText.setText(`Day: ${this.day}`);
    this.sunLevelText.setText(`Sun Level: ${this.sunLevel}`);
    this.waterLevelText.setText(`Water Level: ${this.waterLevel}`);
  }

  updateSeedChoice(seedChoice) {
    console.log("Now planting " + seedChoice);
    this.playerSeedChoice = seedChoice;
  }

  updateGrid() {
    this.cellGroup.getChildren().forEach((cell) => {
      const row = cell.row;
      const col = cell.col;

      // Check if planted first
      if (this.getPlantType(row, col) !== 0) {
        cell.checkCellGrowth();
      }

      // then add water to cell
      this.setWaterLevel(
        row,
        col,
        this.getWaterLevel(row, col) + this.waterLevel
      );
    });
  }

  checkEndCondition() {
    let maturePlantCount = 0;
    for (let row = 0; row < this.gridHeight; row++) {
      for (let col = 0; col < this.gridWidth; col++) {
        if (this.getGrowthLevel(row, col) >= 3) {
          maturePlantCount++;
        }
      }
    }

    if (maturePlantCount >= 5) {
      this.gameOver();
    }
  }

  gameOver() {
    alert("End Condition Met: You Win!");
  }

  //Save-Load Implementation
  saveGame(slot) {
    const gameData = {
      day: this.day,
      sunLevel: this.sunLevel,
      waterLevel: this.waterLevel,
      playerSeedChoice: this.playerSeedChoice,
      gridState: Array.from(this.gridState) //Converted into a regular array for JSON Compatibility
    };

    //Save to Local Storage
    const key = `saveSlot${slot}`;
    localStorage.setItem(key, JSON.stringify(gameData));
    alert(`Game Saved to Slot ${slot}`);
  }

  loadGame(slot) {
    const key = `saveSlot${slot}`;
    const savedData = JSON.parse(localStorage.getItem(key));

    if(!savedData){
      alert(`No saved data found in slot ${slot}`);
      return;
    }

    //Restoring Global Variables
    this.day = savedData.day;
    this.sunLevel = savedData.sunLevel;
    this.waterLevel = savedData.waterLevel;
    this.playerSeedChoice = savedData.playerSeedChoice;

    //Restoring Grid State
    this.gridState = new Uint8Array(savedData.gridState); //Convert back to Uint8Array

    this.updateUI();
    this.cellGroup.getChildren().forEach((cell) => {
      const row = cell.row;
      const col = cell.col;

      const plantType = this.getPlantType(row, col);
      const growthLevel = this.getGrowthLevel(row, col);

      cell.updateSprite(plantType, growthLevel);
    });

    alert(`Game Loaded from Slot ${slot}`);
  }

  autoSave() {
    const gameData = {
      day: this.day,
      sunLevel: this.sunLevel,
      waterLevel: this.waterLevel,
      playerSeedChoice: this.playerSeedChoice,
      gridState: Array.from(this.gridState) //Converted into a regular array for JSON Compatibility
    };

    //Save to Local Storage
    const key = `autoSave`;
    localStorage.setItem(key, JSON.stringify(gameData));
    console.log(`Successful Autosave!`);
  }

  loadAutoSave() {
    const key = `autoSave`;
    const savedData = JSON.parse(localStorage.getItem(key));

    if(!savedData){
      alert(`autoSave Not detected`);
      return;
    }

    //Restoring Global Variables
    this.day = savedData.day;
    this.sunLevel = savedData.sunLevel;
    this.waterLevel = savedData.waterLevel;
    this.playerSeedChoice = savedData.playerSeedChoice;

    //Restoring Grid State
    this.gridState = new Uint8Array(savedData.gridState); //Convert back to Uint8Array

    this.updateUI();
    this.cellGroup.getChildren().forEach((cell) => {
      const row = cell.row;
      const col = cell.col;

      const plantType = this.getPlantType(row, col);
      const growthLevel = this.getGrowthLevel(row, col);

      cell.updateSprite(plantType, growthLevel);
    });

    alert(`Game Restored Successfully!`);
  }
  autoSaveInitilizer() {
    window.addEventListener('beforeunload', () => {
      this.autoSave()
    });
    const savedData = JSON.parse(localStorage.getItem('autoSave'));
    if(savedData){
      const userChoice = window.confirm('Do you want to load from the autosave? (Click Cancel for to clear the autosave)');
        if (userChoice) {
          this.loadAutoSave();
        } else {
          localStorage.removeItem('autoSave');
        }
    }
  }

  //Undo/Redo Implementation
  recordState() {
    const currentState = {
      day: this.day,
      sunLevel: this.sunLevel,
      waterLevel: this.waterLevel,
      playerSeedChoice: this.playerSeedChoice,
      gridState: Array.from(this.gridState), //Copy the grid state
    };
    this.undoStack.push(currentState);
    this.redoStack = []; //Clear redo stack on new action
  }

  undo() {
    if (this.undoStack.length === 0) {
      console.log("Nothing to undo.");
      return;
    }

    const previousState = this.undoStack.pop();
    const currentState = {
      day: this.day,
      sunLevel: this.sunLevel,
      waterLevel: this.waterLevel,
      playerSeedChoice: this.playerSeedChoice,
      gridState: Array.from(this.gridState),
    };

    this.redoStack.push(currentState); //Save current state to redo stack
    this.restoreState(previousState);
  }

  redo() {
    if (this.redoStack.length === 0) {
      console.log("Nothing to redo.");
      return;
    }

    const nextState = this.redoStack.pop();
    const currentState = {
      day: this.day,
      sunLevel: this.sunLevel,
      waterLevel: this.waterLevel,
      playerSeedChoice: this.playerSeedChoice,
      gridState: Array.from(this.gridState),
    };

    this.undoStack.push(currentState); //Save current state to undo stack
    this.restoreState(nextState);
  }

  restoreState(state) {
    this.day = state.day;
    this.sunLevel = state.sunLevel;
    this.waterLevel = state.waterLevel;
    this.playerSeedChoice = state.playerSeedChoice;
    this.gridState = new Uint8Array(state.gridState); // Restore grid state

    this.updateUI();
    this.cellGroup.getChildren().forEach((cell) => {
      const row = cell.row;
      const col = cell.col;

      const plantType = this.getPlantType(row, col);
      const growthLevel = this.getGrowthLevel(row, col);

      cell.updateSprite(plantType, growthLevel);
    });

    console.log("State restored successfully.");
  }
}
