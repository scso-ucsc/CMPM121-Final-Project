import Phaser from "phaser";

export class LocalizationManager {
  private translations: Record<string, string> = {};
  private currentLanguage: string = "en";

  async loadLanguage(language: string): Promise<void> {
    const path = `assets/localization/${language}.json`;
    const response = await fetch(path);

    if (!response.ok) {
      console.error(`Failed to load language file for ${language}`);
      return;
    }

    this.translations = await response.json();
    this.currentLanguage = language;
  }

  getTranslation(key: string): string {
    const keys = key.split("."); // Split the key by dots, e.g., "ui.day" -> ["ui", "day"]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = this.translations;

    for (const k of keys) {
      result = result?.[k]; // Dynamically traverse the object
      if (result === undefined) {
        console.log("result undefined");
        return key; // Fallback to key if translation is missing
      }
    }

    return result;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
}

export const localLang: LocalizationManager = new LocalizationManager();
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    localLang.loadLanguage("en");
    getUserChoice();
    this.load.image("dirtTile", "assets/dirttile.png");
    this.load.tilemapTiledJSON("map", "assets/grassymap.json");
    this.load.image("tileset-1", "assets/grasstiles.png");
    this.load.image("sowbutton", "assets/sowbutton.png");
    this.load.image("reapbutton", "assets/reapbutton.png");

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
    const info = document.getElementById("info");
    if (info) {
      info.innerHTML = localLang.getTranslation("controls");
    }
    //Start Game
    this.scene.start("PlayScene");
  }
}

function getUserChoice() {
  const message =
    "Select Language | 言語を選択してください | حدد اللغة \n1 - English\n2 - 日本語\n3 - عربي";
  const userInput = window.prompt(message);

  switch (userInput) {
    case "1":
      localLang.loadLanguage("en");
      break;
    case "2":
      localLang.loadLanguage("ja");
      break;
    case "3":
      localLang.loadLanguage("ar");
      break;
    default:
      alert("Invalid selection. Please try again.");
  }
}

export default PreloadScene;
