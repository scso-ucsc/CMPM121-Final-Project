"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.game = void 0;
const phaser_1 = __importDefault(require("phaser"));
const PreloadScene_1 = __importDefault(require("./scenes/PreloadScene"));
const PlayScene_1 = __importDefault(require("./scenes/PlayScene"));
const WIDTH = 480;
const HEIGHT = 480;
const config = {
    //parent: 'gameView',
    type: phaser_1.default.AUTO,
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
        //debug: true,
        //gravity: { y: 1000 }
        }
    },
    width: WIDTH,
    height: HEIGHT,
    scale: {
        mode: phaser_1.default.Scale.FIT,
        autoCenter: phaser_1.default.Scale.CENTER_BOTH
    },
    scene: [PreloadScene_1.default, PlayScene_1.default]
};
exports.game = new phaser_1.default.Game(config);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { height, width } = exports.game.config;
