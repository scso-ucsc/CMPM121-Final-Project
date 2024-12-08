"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const phaser_1 = __importDefault(require("phaser"));
const ScenarioParser_1 = __importDefault(require("../utils/ScenarioParser"));
const PlantDefinitions_1 = require("../utils/PlantDefinitions");
const Cell_1 = __importDefault(require("../prefabs/Cell"));
const Player_1 = require("../prefabs/Player");
const gamewidth = 480;
const gameheight = 480;
class PlayScene extends phaser_1.default.Scene {
    constructor() {
        super("PlayScene");
        this.day = 1;
        this.sunLevel = 0;
        this.waterLevel = 0;
        this.waterMultiplier = 1;
        this.playerSeedChoice = "grass";
        this.textdepth = 11;
        this.playerdepth = 10;
        this.victoryConditions = {};
        this.weatherPolicy = {};
        this.eventsQueue = [];
        this.undoStack = [];
        this.redoStack = [];
        this.playerFSM = null;
        this.player = null;
        //key bind variables
        this.keys = null;
        this.advanceKey = null;
        this.QKey = null;
        this.WKey = null;
        this.EKey = null;
        this.XKey = null;
        this.CKey = null;
        this.undoKey = null;
        this.redoKey = null;
        //plant and grid variables
        this.bytesPerCell = 3;
        this.cellGroup = null;
        this.gridWidth = 15;
        this.gridHeight = 15;
        this.gridState = new Uint8Array(this.gridWidth * this.gridHeight * this.bytesPerCell);
        this.cellGrid = null;
        //text variables
        this.dayText = null;
        this.sunLevelText = null;
        this.waterLevelText = null;
        this.seedChoiceText = null;
        this.saveButton1 = null;
        this.saveButton2 = null;
        this.saveButton3 = null;
        this.loadButton1 = null;
        this.loadButton2 = null;
        this.loadButton3 = null;
        //player variables
        this.playerSowTargetBox = null;
        this.playerReapTargetBox = null;
    }
    loadScenario(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(filePath);
            const text = yield response.text();
            const parser = new ScenarioParser_1.default(text);
            return parser.parse();
        });
    }
    getPlantIcon(seedChoice) {
        const plantDef = PlantDefinitions_1.plantDefinitions.find((plant) => plant.type === seedChoice);
        return plantDef ? plantDef.icon : "";
    }
    create() {
        this.createUI();
        this.bindKeys();
        this.createPlayer();
        //Loading External DSL and applying data
        this.loadScenario("assets/scenarios/defaultScenario.txt").then((scenario) => {
            this.day = scenario.StartingConditions.Day;
            this.sunLevel = scenario.StartingConditions.SunLevel;
            this.waterLevel = scenario.StartingConditions.WaterLevel;
            this.playerSeedChoice = scenario.StartingConditions.PlayerSeedChoice;
            this.victoryConditions = scenario.VictoryConditions;
            this.weatherPolicy = scenario.WeatherPolicy;
            this.eventsQueue = Object.entries(scenario.Events)
                .map(([day, event]) => {
                return Object.assign({ day: parseInt(day) }, event);
            })
                .sort((a, b) => a.day - b.day);
            this.createGrid();
            this.createInteractions();
            this.updateGrid();
            this.updateUI();
            this.createSaveLoadUI();
            this.autoSaveInitilizer();
        });
    }
    update() {
        if (this.playerFSM) {
            this.playerFSM.update();
        }
        if (phaser_1.default.Input.Keyboard.JustDown(this.advanceKey)) {
            this.recordState();
            this.advanceDay();
        }
        if (phaser_1.default.Input.Keyboard.JustDown(this.QKey)) {
            this.updateSeedChoice("grass");
        }
        else if (phaser_1.default.Input.Keyboard.JustDown(this.WKey)) {
            this.updateSeedChoice("flower");
        }
        else if (phaser_1.default.Input.Keyboard.JustDown(this.EKey)) {
            this.updateSeedChoice("shrub");
        }
        if (phaser_1.default.Input.Keyboard.JustDown(this.undoKey)) {
            this.undo();
        }
        else if (phaser_1.default.Input.Keyboard.JustDown(this.redoKey)) {
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
                this.weatherPolicy.SunRange = event.SunRange;
            if (event.WaterRange)
                this.weatherPolicy.WaterRange = event.WaterRange;
            if (event.WaterMultiplier)
                this.waterMultiplier = event.WaterMultiplier;
            if (event.Message)
                alert(event.Message);
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
            this.XKey = keyboard.addKey(phaser_1.default.Input.Keyboard.KeyCodes.X);
            this.CKey = keyboard.addKey(phaser_1.default.Input.Keyboard.KeyCodes.C);
            this.QKey = keyboard.addKey(phaser_1.default.Input.Keyboard.KeyCodes.Q);
            this.WKey = keyboard.addKey(phaser_1.default.Input.Keyboard.KeyCodes.W);
            this.EKey = keyboard.addKey(phaser_1.default.Input.Keyboard.KeyCodes.E);
            this.advanceKey = keyboard.addKey(phaser_1.default.Input.Keyboard.KeyCodes.SPACE);
            this.undoKey = keyboard.addKey(phaser_1.default.Input.Keyboard.KeyCodes.Z);
            this.redoKey = keyboard.addKey(phaser_1.default.Input.Keyboard.KeyCodes.Y);
        }
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
        this.cellGroup = this.add.group({
            classType: Cell_1.default,
        });
        this.gridWidth = 15;
        this.gridHeight = 15;
        //For each cell: plantType, waterLevel, growthLevel
        this.bytesPerCell = 3;
        const totalCells = this.gridWidth * this.gridHeight;
        //byte array
        this.gridState = new Uint8Array(totalCells * this.bytesPerCell);
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                //init the byte array and make them start with nothing
                const index = this.getCellIndex(row, col);
                this.gridState[index] = 0;
                this.gridState[index + 1] = 0;
                this.gridState[index + 2] = 0;
                //now create Cell prefab
                const x = col * cellSize + cellSize / 2;
                const y = row * cellSize + cellSize / 2;
                this.cellGroup.add(new Cell_1.default(this, x, y, "dirtTile", row, col));
            }
        }
    }
    createUI() {
        this.dayText = this.add
            .text(gamewidth / 2, gameheight / 10, `Day: ${this.day}`, {
            fontSize: "24px",
            color: "#ffffff",
        })
            .setOrigin(0.5, 0.5);
        this.dayText.setDepth(this.textdepth);
        this.sunLevelText = this.add
            .text(gamewidth / 2, (gameheight / 10) * 1.5, `Sun Level: ${this.sunLevel}`, {
            fontSize: "18px",
            color: "#ffffff",
        })
            .setOrigin(0.5, 0.5);
        this.sunLevelText.setDepth(this.textdepth);
        this.waterLevelText = this.add
            .text(gamewidth / 2, (gameheight / 10) * 2, `Water Level: ${this.waterLevel}`, {
            fontSize: "18px",
            color: "#ffffff",
        })
            .setOrigin(0.5, 0.5);
        this.waterLevelText.setDepth(this.textdepth);
        this.seedChoiceText = this.add
            .text(gamewidth / 2, (gameheight / 10) * 2.5, `Seed Choice: ${this.playerSeedChoice}`, { fontSize: "18px", color: "#ffffff" })
            .setOrigin(0.5, 0.5);
        this.seedChoiceText.setDepth(this.textdepth);
    }
    createPlayer() {
        this.player = new Player_1.Player(this, 100, 100, "character", 0, "down");
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
            this.physics.add.overlap(this.cellGroup, this.playerSowTargetBox, (cell) => {
                if (cell instanceof Cell_1.default) {
                    cell.sowCell(this.playerSeedChoice);
                }
            });
            //reaping
            this.physics.add.overlap(this.cellGroup, this.playerReapTargetBox, (cell) => {
                if (cell instanceof Cell_1.default) {
                    cell.reapCell();
                }
                else {
                    console.log("Cell Group not Cell!");
                }
            });
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
    createSaveButton(yOffset, slotNumber) {
        const saveButton = this.add
            .text(10, 400 + yOffset, `Save Slot ${slotNumber.toString()}`, {
            color: "#ffffff",
        })
            .setInteractive()
            .on("pointerdown", () => this.saveGame(slotNumber));
        return saveButton;
    }
    createLoadButton(yOffset, slotNumber) {
        const loadButton = this.add
            .text(360, 400 + yOffset, `Load Slot ${slotNumber.toString()}`, {
            color: "#ffffff",
        })
            .setInteractive()
            .on("pointerdown", () => this.loadGame(slotNumber));
        return loadButton;
    }
    generateWeather() {
        const [sunMin, sunMax] = this.weatherPolicy.SunRange;
        const [waterMin, waterMax] = this.weatherPolicy.WaterRange;
        this.sunLevel = Math.floor(Math.random() * (sunMax - sunMin + 1)) + sunMin;
        this.waterLevel =
            (Math.floor(Math.random() * (waterMax - waterMin + 1)) + waterMin) *
                this.waterMultiplier;
    }
    updateUI() {
        const seedIcon = this.getPlantIcon(this.playerSeedChoice);
        this.dayText.setText(`Day: ${this.day}`);
        this.sunLevelText.setText(`Sun Level: ${this.sunLevel}`);
        this.waterLevelText.setText(`Water Level: ${this.waterLevel}`);
        this.seedChoiceText.setText(`Seed Choice: ${seedIcon} ${this.playerSeedChoice}`);
    }
    updateSeedChoice(seedChoice) {
        this.pushUndoState();
        const seedIcon = this.getPlantIcon(seedChoice);
        this.seedChoiceText.setText(`Seed Choice: ${seedIcon} ${seedChoice}`);
        this.playerSeedChoice = seedChoice;
    }
    updateGrid() {
        this.cellGroup
            .getChildren()
            .forEach((cell) => {
            if (cell instanceof Cell_1.default) {
                const row = cell.row;
                const col = cell.col;
                //Check if planted first
                if (this.getPlantType(row, col) !== 0) {
                    cell.checkCellGrowth();
                }
                //then add water to cell
                this.setWaterLevel(row, col, this.getWaterLevel(row, col) + this.waterLevel);
            }
            else {
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
        if (maturePlantCount >=
            this.victoryConditions.MaturePlantsRequired) {
            this.gameOver("win");
            return;
        }
        if (this.day >= this.victoryConditions.MaximumDays) {
            this.gameOver("lose");
            return;
        }
    }
    gameOver(outcome) {
        if (outcome === "lose") {
            alert("End Condition Not Met: You Lose!");
        }
        else {
            alert("End Condition Met: You Win!");
        }
    }
    //Save-Load Implementation
    saveGame(slot) {
        const gameData = {
            day: this.day,
            sunLevel: this.sunLevel,
            waterLevel: this.waterLevel,
            playerSeedChoice: this.playerSeedChoice,
            gridState: Array.from(this.gridState),
            undoStack: this.undoStack.map((state) => JSON.stringify(state)),
            redoStack: this.redoStack.map((state) => JSON.stringify(state)), // Serialize each state
        };
        const key = `saveSlot${slot}`;
        localStorage.setItem(key, JSON.stringify(gameData));
        alert(`Game Saved to Slot ${slot}`);
    }
    loadGame(slot) {
        const key = `saveSlot${slot}`;
        const savedData = JSON.parse(localStorage.getItem(key));
        if (!savedData) {
            alert(`No saved data found in slot ${slot}`);
            return;
        }
        // Restore main game state
        this.day = savedData.day;
        this.sunLevel = savedData.sunLevel;
        this.waterLevel = savedData.waterLevel;
        this.playerSeedChoice = savedData.playerSeedChoice;
        this.gridState = new Uint8Array(savedData.gridState);
        // Restore undo/redo stacks
        this.undoStack = (savedData.undoStack || []).map((state) => JSON.parse(state));
        this.redoStack = (savedData.redoStack || []).map((state) => JSON.parse(state));
        this.updateUI();
        this.cellGroup
            .getChildren()
            .forEach((cell) => {
            if (cell instanceof Cell_1.default) {
                const row = cell.row;
                const col = cell.col;
                const plantType = this.getPlantType(row, col);
                const growthLevel = this.getGrowthLevel(row, col);
                cell.updateSprite(plantType, growthLevel);
            }
            else {
                console.log("Cell Group not Cell!");
            }
        });
        alert(`Game Loaded from Slot ${slot}`);
    }
    autoSave() {
        const gameData = {
            day: this.day,
            sunLevel: this.sunLevel,
            waterLevel: this.waterLevel,
            playerSeedChoice: this.playerSeedChoice,
            gridState: Array.from(this.gridState),
            undoStack: this.undoStack.map((state) => JSON.stringify(state)),
            redoStack: this.redoStack.map((state) => JSON.stringify(state)), // Serialize each state
        };
        // Save to local storage
        const key = `autoSave`;
        localStorage.setItem(key, JSON.stringify(gameData));
    }
    loadAutoSave() {
        const key = `autoSave`;
        const savedData = JSON.parse(localStorage.getItem(key));
        if (!savedData) {
            alert(`No autosave detected`);
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
        this.cellGroup
            .getChildren()
            .forEach((cell) => {
            if (cell instanceof Cell_1.default) {
                const row = cell.row;
                const col = cell.col;
                const plantType = this.getPlantType(row, col);
                const growthLevel = this.getGrowthLevel(row, col);
                cell.updateSprite(plantType, growthLevel);
            }
            else {
                console.log("Cell Group not Cell!");
            }
        });
    }
    autoSaveInitilizer() {
        window.addEventListener("beforeunload", () => {
            this.autoSave();
        });
        const savedData = JSON.parse(localStorage.getItem("autoSave"));
        if (savedData) {
            const userChoice = window.confirm("Do you want to load from the autosave? (Click Cancel for to clear the autosave)");
            if (userChoice) {
                this.loadAutoSave();
            }
            else {
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
        this.undoStack.push(currentState);
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
            });
            //Restore state from undo stack
            const previousState = this.undoStack.pop();
            if (previousState) {
                this.day = previousState.day;
                this.sunLevel = previousState.sunLevel;
                this.waterLevel = previousState.waterLevel;
                this.playerSeedChoice = previousState.playerSeedChoice;
                this.gridState = new Uint8Array(previousState.gridState); //Convert back to Uint8Array
            }
            //Update UI and grid
            this.updateUI();
            this.cellGroup
                .getChildren()
                .forEach((cell) => {
                if (cell instanceof Cell_1.default) {
                    const row = cell.row;
                    const col = cell.col;
                    const plantType = this.getPlantType(row, col);
                    const growthLevel = this.getGrowthLevel(row, col);
                    cell.updateSprite(plantType, growthLevel);
                }
                else {
                    console.log("Cell Group not Cell!");
                }
            });
        }
        else {
            alert("No more actions to undo!");
        }
    }
    redo() {
        if (this.redoStack.length === 0) {
            alert("No actions to redo!");
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
        if (state) {
            this.day = state.day;
            this.sunLevel = state.sunLevel;
            this.waterLevel = state.waterLevel;
            this.playerSeedChoice = state.playerSeedChoice;
            this.gridState = new Uint8Array(state.gridState); //Restore grid state
        }
        this.updateUI();
        this.cellGroup
            .getChildren()
            .forEach((cell) => {
            if (cell instanceof Cell_1.default) {
                const row = cell.row;
                const col = cell.col;
                const plantType = this.getPlantType(row, col);
                const growthLevel = this.getGrowthLevel(row, col);
                cell.updateSprite(plantType, growthLevel);
            }
            else {
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
        if (this.undoStack.length === 0 ||
            JSON.stringify(this.undoStack[this.undoStack.length - 1]) !==
                JSON.stringify(currentState)) {
            this.undoStack.push(currentState);
        }
        //Limit the size of the undo stack (optional)
        if (this.undoStack.length > 50) {
            this.undoStack.shift(); //Remove the oldest state to prevent memory issues
        }
    }
}
exports.default = PlayScene;
