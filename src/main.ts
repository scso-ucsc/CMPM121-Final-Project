"use strict";
import Phaser from 'phaser';
import PreloadScene from "./scenes/PreloadScene";
import PlayScene from "./scenes/PlayScene";

const WIDTH = 480;
const HEIGHT = 480;


const config = {
  //parent: 'gameView',
  type: Phaser.AUTO,
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
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [PreloadScene, PlayScene]
}

export const game = new Phaser.Game(config);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { height, width } = game.config;
