"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PlayScene_js_1 = __importDefault(require("./scenes/PlayScene.js"));
const WIDTH = 480;
const HEIGHT = 480;
const SHARED_CONFIG = {
    width: WIDTH,
    height: HEIGHT,
};
const Scenes = [PreloadScene, PlayScene_js_1.default];
const createScene = (Scene) => new Scene(SHARED_CONFIG);
// iterates over all the scenes, and creating a new instance of that scene with SHARED_CONFIG
const initScenes = () => Scenes.map(createScene);
let config = Object.assign(Object.assign({ type: Phaser.AUTO }, SHARED_CONFIG), { render: {
        pixelArt: true,
    }, physics: {
        default: "arcade",
        arcade: {
            debug: true,
        },
    }, scene: initScenes() });
let game = new Phaser.Game(config);
let { height, width } = game.config;
//# sourceMappingURL=main.js.map