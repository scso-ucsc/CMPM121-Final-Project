"use strict";
import Phaser from 'phaser';
import PlayScene from "./scenes/PlayScene.ts";
import PreloadScene from "./scenes/PreloadScene.ts";

const WIDTH = 480;
const HEIGHT = 480;

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
};

const Scenes = [PreloadScene, PlayScene];

const createScene = (Scene: Phaser.Scene) => new Scene(SHARED_CONFIG);
// iterates over all the scenes, and creating a new instance of that scene with SHARED_CONFIG
const initScenes = () => Scenes.map(createScene);

const config = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  render: {
    pixelArt: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: initScenes(),
};

export const game = new Phaser.Game(config);

const { height, width } = game.config;
