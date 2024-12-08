import Phaser from "phaser";
import ScenarioParser, {
  EventDay,
  NonEventSection,
} from "../utils/ScenarioParser";
import { plantDefinitions } from "../utils/PlantDefinitions";
import Cell from "../prefabs/Cell";
import { Player, StateMachine, MoveState } from "../prefabs/Player";
import { LocalizationManager, localLang } from "./PreloadScene";

const gamewidth: number = 480;
const gameheight: number = 480;

interface gameState {
  day: number;
  sunLevel: number;
  waterLevel: number;
  playerSeedChoice: string;
  gridState: number[]; // Convert Uint8Array to array for JSON compatibility
  undoStack: string[]; // Serialize each state
  redoStack: string[]; // Serialize each state
}

class PlayScene extends Phaser.Scene {
  day: number = 1;
  sunLevel: number = 0;
  waterLevel: number = 0;
  waterMultiplier: number = 1;
  playerSeedChoice: "grass" | "flower" | "shrub" = "grass";
  textdepth: number = 11;
  playerdepth: number = 10;
  victoryConditions: NonEventSection = {};
  weatherPolicy: NonEventSection = {};
  eventsQueue: EventDay[] = [];
  undoStack: gameState[] = [];
  redoStack: gameState[] = [];
  playerFSM: StateMachine | null = null;
  player: Player | null = null;

  //key bind variables
  keys: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  advanceKey: Phaser.Input.Keyboard.Key | null = null;
  QKey: Phaser.Input.Keyboard.Key | null = null;
  WKey: Phaser.Input.Keyboard.Key | null = null;
  EKey: Phaser.Input.Keyboard.Key | null = null;
  XKey: Phaser.Input.Keyboard.Key | null = null;
  CKey: Phaser.Input.Keyboard.Key | null = null;
  undoKey: Phaser.Input.Keyboard.Key | null = null;
  redoKey: Phaser.Input.Keyboard.Key | null = null;

  //plant and grid variables
  bytesPerCell: number = 3;
  cellGroup: Phaser.GameObjects.Group | null = null;
  gridWidth: number = 15;
  gridHeight: number = 15;
  gridState: Uint8Array = new Uint8Array(
    this.gridWidth * this.gridHeight * this.bytesPerCell
  );
  cellGrid: Cell[][] | null = null;

  //text variables
  dayText: Phaser.GameObjects.Text | null = null;
  sunLevelText: Phaser.GameObjects.Text | null = null;
  waterLevelText: Phaser.GameObjects.Text | null = null;
  seedChoiceText: Phaser.GameObjects.Text | null = null;
  saveButton1: Phaser.GameObjects.Text | null = null;
  saveButton2: Phaser.GameObjects.Text | null = null;
  saveButton3: Phaser.GameObjects.Text | null = null;
  loadButton1: Phaser.GameObjects.Text | null = null;
  loadButton2: Phaser.GameObjects.Text | null = null;
  loadButton3: Phaser.GameObjects.Text | null = null;

  // side buttons
  reapButton: Phaser.GameObjects.Image | null = null;
  sowButton: Phaser.GameObjects.Image | null = null;
  advanceButton: Phaser.GameObjects.Image | null = null;
  upButton: Phaser.GameObjects.Image | null = null;
  downButton: Phaser.GameObjects.Image | null = null;
  leftButton: Phaser.GameObjects.Image | null = null;
  rightButton: Phaser.GameObjects.Image | null = null;

  //player variables
  playerSowTargetBox: Phaser.GameObjects.Sprite | null = null;
  playerReapTargetBox: Phaser.GameObjects.Sprite | null = null;

  //localization manager
  localLang: LocalizationManager = localLang;

  constructor() {
    super("PlayScene");
  }

  async loadScenario(filePath: RequestInfo | URL) {
    const response = await fetch(filePath);
    const text = await response.text();
    const parser = new ScenarioParser(text);
    return parser.parse();
  }

  getPlantIcon(seedChoice: string) {
    const plantDef = plantDefinitions.find(
      (plant) => plant.type === seedChoice
    );
    return plantDef ? plantDef.icon : "";
  }

  create() {
    this.createUI();
    this.bindKeys();
    this.createPlayer();

    //Loading External DSL and applying data
    this.loadScenario(
      `assets/scenarios/defaultScenario${this.localLang
        .getCurrentLanguage()
        .toUpperCase()}.txt`
    ).then((scenario) => {
      this.day = scenario.StartingConditions.Day as number;
      this.sunLevel = scenario.StartingConditions.SunLevel as number;
      this.waterLevel = scenario.StartingConditions.WaterLevel as number;
      this.playerSeedChoice = scenario.StartingConditions.PlayerSeedChoice as
        | "grass"
        | "shrub"
        | "flower";

      this.victoryConditions = scenario.VictoryConditions as NonEventSection;
      this.weatherPolicy = scenario.WeatherPolicy as NonEventSection;
      this.eventsQueue = Object.entries(scenario.Events)
        .map(([day, event]) => {
          return { day: parseInt(day), ...event };
        })
        .sort((a: { day: number }, b: { day: number }) => a.day - b.day);

      this.createGrid();
      this.createInteractions();
      this.updateGrid();
      this.updateUI();
      this.createSideButtons();
      this.createSaveLoadUI();
      this.autoSaveInitilizer();
    });
  }

  update() {
    if (this.playerFSM) {
      this.playerFSM.update();
    }
    if (
      Phaser.Input.Keyboard.JustDown(
        this.advanceKey as Phaser.Input.Keyboard.Key
      )
    ) {
      this.recordState();
      this.advanceDay();
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.QKey as Phaser.Input.Keyboard.Key)
    ) {
      this.updateSeedChoice("grass");
    } else if (
      Phaser.Input.Keyboard.JustDown(this.WKey as Phaser.Input.Keyboard.Key)
    ) {
      this.updateSeedChoice("flower");
    } else if (
      Phaser.Input.Keyboard.JustDown(this.EKey as Phaser.Input.Keyboard.Key)
    ) {
      this.updateSeedChoice("shrub");
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.undoKey as Phaser.Input.Keyboard.Key)
    ) {
      this.undo();
    } else if (
      Phaser.Input.Keyboard.JustDown(this.redoKey as Phaser.Input.Keyboard.Key)
    ) {
      this.redo();
    }
  }

  advanceDay() {
    this.pushUndoState();
    this.day++;
    this.generateWeather();

    const event = this.eventsQueue.find((e) => e.day === this.day);
    if (event) {
      if (event.SunRange)
        this.weatherPolicy.SunRange = event.SunRange as number[];
      if (event.WaterRange) this.weatherPolicy.WaterRange = event.WaterRange;
      if (event.WaterMultiplier)
        this.waterMultiplier = event.WaterMultiplier as number;
      if (event.Message) alert(event.Message);
      if (event.MaturePlantsRequired)
        this.victoryConditions.MaturePlantsRequired =
          event.MaturePlantsRequired;
    }

    this.updateUI();
    this.updateGrid();
    this.checkEndCondition();
  }

  bindKeys() {
    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.keys = keyboard.createCursorKeys();
      this.XKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
      this.CKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
      this.QKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      this.WKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.EKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.advanceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.undoKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
      this.redoKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
    }
  }

  findNearestCell(): Cell | null {
    //if (!this.cellGrid || !this.player) return null;

    const playerX = this.player.x;
    const playerY = this.player.y;

    let closestCell: Cell | null = null;
    let minDistance = Infinity;

    this.cellGrid.forEach((row) => {
      row.forEach((cell) => {
        const distance = Phaser.Math.Distance.Between(
          playerX,
          playerY,
          cell.x,
          cell.y
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestCell = cell;
        }
      });
    });

    if (closestCell) {
      console.log(
        `Nearest cell found at (${closestCell.row}, ${closestCell.col})`
      );
    } else {
      console.log("No cell found within range.");
    }

    return closestCell;
  }

  //helper functions to access byte array
  getCellIndex(row: number, col: number) {
    return (row * this.gridWidth + col) * this.bytesPerCell;
  }

  getPlantType(row: number, col: number) {
    return this.gridState[this.getCellIndex(row, col)];
  }

  getWaterLevel(row: number, col: number) {
    return this.gridState[this.getCellIndex(row, col) + 1];
  }

  getGrowthLevel(row: number, col: number) {
    return this.gridState[this.getCellIndex(row, col) + 2];
  }

  setPlantType(row: number, col: number, type: number) {
    this.gridState[this.getCellIndex(row, col)] = type;
  }

  setWaterLevel(row: number, col: number, water: number) {
    this.gridState[this.getCellIndex(row, col) + 1] = water;
  }

  setGrowthLevel(row: number, col: number, growth: number) {
    this.gridState[this.getCellIndex(row, col) + 2] = growth;
  }

  createGrid() {
    const cellSize = 32;

    this.cellGroup = this.add.group({
      classType: Cell,
    });

    // init cellGrid
    this.cellGrid = [];
    this.gridWidth = 15;
    this.gridHeight = 15;
    //For each cell: plantType, waterLevel, growthLevel
    this.bytesPerCell = 3;

    const totalCells = this.gridWidth * this.gridHeight;

    this.gridState = new Uint8Array(totalCells * this.bytesPerCell);

    for (let row = 0; row < this.gridHeight; row++) {
      const rowArray: Cell[] = [];

      for (let col = 0; col < this.gridWidth; col++) {
        //init the byte array and make them start with nothing
        const index = this.getCellIndex(row, col);
        this.gridState[index] = 0;
        this.gridState[index + 1] = 0;
        this.gridState[index + 2] = 0;

        //now create Cell prefab
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        const cell = new Cell(this, x, y, "dirtTile", row, col);

        this.cellGroup.add(cell);
        rowArray.push(cell);
      }

      this.cellGrid.push(rowArray);
    }
  }

  createUI() {
    this.dayText = this.add
      .text(
        (gamewidth as number) / 2,
        (gameheight as number) / 10,
        `${this.localLang.getTranslation("ui.day")}${this.day}`,
        {
          fontSize: "24px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5, 0.5);
    this.dayText.setDepth(this.textdepth);

    this.sunLevelText = this.add
      .text(
        (gamewidth as number) / 2,
        ((gameheight as number) / 10) * 1.5,
        `${this.localLang.getTranslation("ui.sun")}${this.sunLevel}`,
        {
          fontSize: "18px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5, 0.5);
    this.sunLevelText.setDepth(this.textdepth);

    this.waterLevelText = this.add
      .text(
        (gamewidth as number) / 2,
        ((gameheight as number) / 10) * 2,
        `${this.localLang.getTranslation("ui.water")}${this.waterLevel}`,
        {
          fontSize: "18px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5, 0.5);
    this.waterLevelText.setDepth(this.textdepth);

    this.seedChoiceText = this.add
      .text(
        (gamewidth as number) / 2,
        ((gameheight as number) / 10) * 2.5,
        `${this.localLang.getTranslation(
          "ui.seed"
        )}${this.localLang.getTranslation("ui." + this.playerSeedChoice)}`,
        { fontSize: "18px", color: "#ffffff" }
      )
      .setOrigin(0.5, 0.5);
    this.seedChoiceText.setDepth(this.textdepth);
  }

  createSideButtons() {
    const grassButton = this.add.image(50, 250, "grassbutton").setInteractive();
    grassButton.on("pointerdown", () => {
      this.updateSeedChoice("grass");
    });

    const flowerButton = this.add
      .image(50, 300, "flowerbutton")
      .setInteractive();
    flowerButton.on("pointerdown", () => {
      this.updateSeedChoice("flower");
    });

    const shrubButton = this.add.image(50, 350, "shrubbutton").setInteractive();
    shrubButton.on("pointerdown", () => {
      this.updateSeedChoice("shrub");
    });

    this.reapButton = this.add.image(50, 100, "reapbutton").setInteractive();

    this.sowButton = this.add.image(50, 150, "sowbutton").setInteractive();

    this.advanceButton = this.add
      .image(50, 200, "advancebutton")
      .setInteractive();

    this.upButton = this.add.image(425, 200, "upbutton").setInteractive();
    this.downButton = this.add.image(425, 250, "downbutton").setInteractive();
    this.leftButton = this.add.image(425, 300, "leftbutton").setInteractive();
    this.rightButton = this.add.image(425, 350, "rightbutton").setInteractive();

    this.reapButton.on("pointerdown", () => {
      const nearestCell = this.findNearestCell();
      if (nearestCell) {
        nearestCell.reapCell();
        console.log(`Reaped cell at (${nearestCell.row}, ${nearestCell.col})`);
      } else {
        console.log("No nearest cell found to reap.");
      }
    });

    this.sowButton.on("pointerdown", () => {
      const nearestCell = this.findNearestCell();
      if (nearestCell) {
        nearestCell.sowCell(this.playerSeedChoice);
        console.log(
          `Sowed cell at (${nearestCell.row}, ${nearestCell.col}) with ${this.playerSeedChoice}`
        );
      } else {
        console.log("No nearest cell found to sow.");
      }
    });

    this.advanceButton.on("pointerdown", () => {
      console.log("Advancing to the next day.");
      this.advanceDay();
    });

    const moveState = new MoveState();

    this.upButton.on("pointerdown", () => {
      console.log("Moving up.");
      moveState.execute(this, this.player);
      this.input.keyboard.emit("keydown-UP");
    });

    this.downButton.on("pointerdown", () => {
      console.log("Moving down.");
      moveState.execute(this, this.player);
      this.input.keyboard.emit("keydown-DOWN");
    });

    this.leftButton.on("pointerdown", () => {
      console.log("Moving left.");
      moveState.execute(this, this.player);
      this.input.keyboard.emit("keydown-LEFT");
    });

    this.rightButton.on("pointerdown", () => {
      console.log("Moving right.");
      moveState.execute(this, this.player);
      this.input.keyboard.emit("keydown-RIGHT");
    });
  }

  createPlayer() {
    this.player = new Player(this, 100, 100, "character", 0, "down");
    this.playerSowTargetBox = this.physics.add
      .sprite(-10, -10, "")
      .setSize(1, 1); //TargetBoxes starts off screen
    this.playerReapTargetBox = this.physics.add
      .sprite(-10, -10, "")
      .setSize(1, 1);
    this.player.setDepth(this.playerdepth);
  }

  createInteractions() {
    //sowing
    if (this.cellGroup) {
      this.physics.add.overlap(
        this.cellGroup,
        this.playerSowTargetBox as Phaser.GameObjects.Sprite,
        (cell) => {
          if (cell instanceof Cell) {
            cell.sowCell(this.playerSeedChoice);
          }
        }
      );
      //reaping
      this.physics.add.overlap(
        this.cellGroup,
        this.playerReapTargetBox as Phaser.GameObjects.Sprite,
        (cell) => {
          if (cell instanceof Cell) {
            cell.reapCell();
          } else {
            console.log("Cell Group not Cell!");
          }
        }
      );
    }
  }

  createSaveLoadUI() {
    this.saveButton1 = this.createSaveButton(0, 1);
    this.saveButton2 = this.createSaveButton(25, 2);
    this.saveButton3 = this.createSaveButton(50, 3);
    this.loadButton1 = this.createLoadButton(0, 1);
    this.loadButton2 = this.createLoadButton(25, 2);
    this.loadButton3 = this.createLoadButton(50, 3);
  }

  createSaveButton(yOffset: number, slotNumber: number) {
    const saveButton = this.add
      .text(
        10,
        400 + yOffset,
        `${this.localLang.getTranslation(
          "ui.save_slot"
        )}${slotNumber.toString()}`,
        {
          color: "#ffffff",
        }
      )
      .setInteractive()
      .on("pointerdown", () => this.saveGame(slotNumber));
    return saveButton;
  }

  createLoadButton(yOffset: number, slotNumber: number) {
    const loadButton = this.add
      .text(
        360,
        400 + yOffset,
        `${this.localLang.getTranslation(
          "ui.load_slot"
        )}${slotNumber.toString()}`,
        {
          color: "#ffffff",
        }
      )
      .setInteractive()
      .on("pointerdown", () => this.loadGame(slotNumber));
    return loadButton;
  }

  generateWeather() {
    const [sunMin, sunMax] = this.weatherPolicy.SunRange as number[];
    const [waterMin, waterMax] = this.weatherPolicy.WaterRange as number[];

    this.sunLevel = Math.floor(Math.random() * (sunMax - sunMin + 1)) + sunMin;
    this.waterLevel =
      (Math.floor(Math.random() * (waterMax - waterMin + 1)) + waterMin) *
      this.waterMultiplier;
  }

  updateUI() {
    const seedIcon = this.getPlantIcon(this.playerSeedChoice);
    (this.dayText as Phaser.GameObjects.Text).setText(
      `${this.localLang.getTranslation("ui.day")}${this.day}`
    );
    (this.sunLevelText as Phaser.GameObjects.Text).setText(
      `${this.localLang.getTranslation("ui.sun")}${this.sunLevel}`
    );
    (this.waterLevelText as Phaser.GameObjects.Text).setText(
      `${this.localLang.getTranslation("ui.water")}${this.waterLevel}`
    );
    (this.seedChoiceText as Phaser.GameObjects.Text).setText(
      `${this.localLang.getTranslation(
        "ui.seed"
      )}${seedIcon} ${this.localLang.getTranslation(
        "ui." + this.playerSeedChoice
      )}`
    );
  }

  updateSeedChoice(seedChoice: "grass" | "flower" | "shrub") {
    this.pushUndoState();

    const seedIcon = this.getPlantIcon(seedChoice);
    (this.seedChoiceText as Phaser.GameObjects.Text).setText(
      `${this.localLang.getTranslation(
        "ui.seed"
      )}${seedIcon} ${this.localLang.getTranslation("ui." + seedChoice)}`
    );
    this.playerSeedChoice = seedChoice;
  }

  updateGrid() {
    (this.cellGroup as Phaser.GameObjects.Group)
      .getChildren()
      .forEach((cell) => {
        if (cell instanceof Cell) {
          const row = cell.row;
          const col = cell.col;

          //Check if planted first
          if (this.getPlantType(row, col) !== 0) {
            cell.checkCellGrowth();
          }

          //then add water to cell
          this.setWaterLevel(
            row,
            col,
            this.getWaterLevel(row, col) + this.waterLevel
          );
        } else {
          console.log("Cell Group not Cell!");
        }
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

    if (
      maturePlantCount >=
      (this.victoryConditions.MaturePlantsRequired as number)
    ) {
      this.gameOver("win");
      return;
    }

    if (this.day >= (this.victoryConditions.MaximumDays as number)) {
      this.gameOver("lose");
      return;
    }
  }

  gameOver(outcome: string) {
    if (outcome === "lose") {
      alert(`${this.localLang.getTranslation("alerts.lost")}`);
    } else {
      alert(`${this.localLang.getTranslation("alerts.won")}`);
    }
  }

  //Save-Load Implementation
  saveGame(slot: number) {
    const gameData: gameState = {
      day: this.day,
      sunLevel: this.sunLevel,
      waterLevel: this.waterLevel,
      playerSeedChoice: this.playerSeedChoice,
      gridState: Array.from(this.gridState), // Convert Uint8Array to array for JSON compatibility
      undoStack: this.undoStack.map((state) => JSON.stringify(state)), // Serialize each state
      redoStack: this.redoStack.map((state) => JSON.stringify(state)), // Serialize each state
    };

    const key = `saveSlot${slot}`;
    localStorage.setItem(key, JSON.stringify(gameData));
    alert(`${this.localLang.getTranslation("alerts.saved")}${slot}`);
  }

  loadGame(slot: number) {
    const key = `saveSlot${slot}`;
    const savedData = JSON.parse(localStorage.getItem(key) as string);

    if (!savedData) {
      alert(`${this.localLang.getTranslation("alerts.no_save")}${slot}`);
      return;
    }

    // Restore main game state
    this.day = savedData.day;
    this.sunLevel = savedData.sunLevel;
    this.waterLevel = savedData.waterLevel;
    this.playerSeedChoice = savedData.playerSeedChoice;
    this.gridState = new Uint8Array(savedData.gridState);

    // Restore undo/redo stacks
    this.undoStack = (savedData.undoStack || []).map((state: string) =>
      JSON.parse(state)
    );
    this.redoStack = (savedData.redoStack || []).map((state: string) =>
      JSON.parse(state)
    );

    this.updateUI();
    (this.cellGroup as Phaser.GameObjects.Group)
      .getChildren()
      .forEach((cell) => {
        if (cell instanceof Cell) {
          const row = cell.row;
          const col = cell.col;
          const plantType = this.getPlantType(row, col);
          const growthLevel = this.getGrowthLevel(row, col);
          cell.updateSprite(plantType, growthLevel);
        } else {
          console.log("Cell Group not Cell!");
        }
      });

    alert(`${this.localLang.getTranslation("alerts.loaded")}${slot}`);
  }

  autoSave() {
    console.log("AutoSave triggered");
    const gameData: gameState = {
      day: this.day,
      sunLevel: this.sunLevel,
      waterLevel: this.waterLevel,
      playerSeedChoice: this.playerSeedChoice,
      gridState: Array.from(this.gridState), // Converted into a regular array for JSON compatibility
      undoStack: this.undoStack.map((state) => JSON.stringify(state)), // Serialize each state
      redoStack: this.redoStack.map((state) => JSON.stringify(state)), // Serialize each state
    };

    // Save to local storage
    const key = `autoSave`;
    localStorage.setItem(key, JSON.stringify(gameData));
  }

  loadAutoSave() {
    const key = `autoSave`;
    const savedData = JSON.parse(localStorage.getItem(key) as string);

    if (!savedData) {
      alert(`${this.localLang.getTranslation("alerts.no_auto")}`);
      return;
    }

    // Restoring global variables
    this.day = savedData.day;
    this.sunLevel = savedData.sunLevel;
    this.waterLevel = savedData.waterLevel;
    this.playerSeedChoice = savedData.playerSeedChoice;
    this.gridState = new Uint8Array(savedData.gridState); // Convert back to Uint8Array

    // Restore undo/redo stacks
    this.undoStack = savedData.undoStack || [];
    this.redoStack = savedData.redoStack || [];

    // Update the UI and cells
    this.updateUI();
    (this.cellGroup as Phaser.GameObjects.Group)
      .getChildren()
      .forEach((cell) => {
        if (cell instanceof Cell) {
          const row = cell.row;
          const col = cell.col;

          const plantType = this.getPlantType(row, col);
          const growthLevel = this.getGrowthLevel(row, col);

          cell.updateSprite(plantType, growthLevel);
        } else {
          console.log("Cell Group not Cell!");
        }
      });
  }
  autoSaveInitilizer() {
    window.addEventListener("beforeunload", () => {
      this.autoSave();
    });
    const savedData = JSON.parse(localStorage.getItem("autoSave") as string);
    if (savedData) {
      const userChoice = window.confirm(
        `${this.localLang.getTranslation("alerts.autosave")}`
      );
      if (userChoice) {
        this.loadAutoSave();
      } else {
        localStorage.removeItem("autoSave");
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
    this.undoStack.push(currentState as gameState);
    this.redoStack = []; //Clear redo stack on new action
  }

  undo() {
    if (this.undoStack.length > 0) {
      //Push current state to redo stack before undoing
      this.redoStack.push({
        day: this.day,
        sunLevel: this.sunLevel,
        waterLevel: this.waterLevel,
        playerSeedChoice: this.playerSeedChoice,
        gridState: Array.from(this.gridState), //Convert to JSON-compatible format
      } as gameState);

      //Restore state from undo stack
      const previousState = this.undoStack.pop();
      if (previousState) {
        this.day = previousState.day;
        this.sunLevel = previousState.sunLevel;
        this.waterLevel = previousState.waterLevel;
        this.playerSeedChoice = previousState.playerSeedChoice as
          | "grass"
          | "flower"
          | "shrub";
        this.gridState = new Uint8Array(previousState.gridState); //Convert back to Uint8Array
      }

      //Update UI and grid
      this.updateUI();
      (this.cellGroup as Phaser.GameObjects.Group)
        .getChildren()
        .forEach((cell) => {
          if (cell instanceof Cell) {
            const row = cell.row;
            const col = cell.col;

            const plantType = this.getPlantType(row, col);
            const growthLevel = this.getGrowthLevel(row, col);

            cell.updateSprite(plantType, growthLevel);
          } else {
            console.log("Cell Group not Cell!");
          }
        });
    } else {
      alert(`${this.localLang.getTranslation("alerts.undo")}`);
    }
  }

  redo() {
    if (this.redoStack.length === 0) {
      alert(`${this.localLang.getTranslation(`alerts.redo`)}`);
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

    this.undoStack.push(currentState as gameState); //Save current state to undo stack
    this.restoreState(nextState);
  }

  restoreState(
    state:
      | {
          day: number;
          sunLevel: number;
          waterLevel: number;
          playerSeedChoice: string;
          gridState: Iterable<number>;
        }
      | undefined
  ) {
    if (state) {
      this.day = state.day;
      this.sunLevel = state.sunLevel;
      this.waterLevel = state.waterLevel;
      this.playerSeedChoice = state.playerSeedChoice as
        | "grass"
        | "flower"
        | "shrub";
      this.gridState = new Uint8Array(state.gridState); //Restore grid state
    }

    this.updateUI();
    (this.cellGroup as Phaser.GameObjects.Group)
      .getChildren()
      .forEach((cell) => {
        if (cell instanceof Cell) {
          const row = cell.row;
          const col = cell.col;
          const plantType = this.getPlantType(row, col);
          const growthLevel = this.getGrowthLevel(row, col);
          cell.updateSprite(plantType, growthLevel);
        } else {
          console.log("Cell Group not Cell!");
        }
      });
  }

  pushUndoState() {
    const currentState = {
      day: this.day,
      sunLevel: this.sunLevel,
      waterLevel: this.waterLevel,
      playerSeedChoice: this.playerSeedChoice,
      gridState: Array.from(this.gridState), //Convert to JSON-compatible format
    };

    //Avoid pushing duplicate states
    if (
      this.undoStack.length === 0 ||
      JSON.stringify(this.undoStack[this.undoStack.length - 1]) !==
        JSON.stringify(currentState)
    ) {
      this.undoStack.push(currentState as gameState);
    }

    //Limit the size of the undo stack (optional)
    if (this.undoStack.length > 50) {
      this.undoStack.shift(); //Remove the oldest state to prevent memory issues
    }
  }
}

export default PlayScene;
