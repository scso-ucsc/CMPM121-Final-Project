import { plantDefinitions } from "../utils/PlantDefinitions";
import Phaser from "phaser";

class Cell extends Phaser.Physics.Arcade.Sprite {
  private scene: Phaser.Scene;
  private row: number;
  private col: number;
  private planted: boolean;
  private waterLevel: number;
  private plant: Phaser.GameObjects.Sprite | null;
  private frameNumber: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    row: number,
    col: number
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setImmovable(true);
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.plant = null;
    this.frameNumber = 0;
    this.planted = false;
    this.waterLevel = 0;
  }

  sowCell(plantType: "grass" | "flower" | "shrub"): void {
    const plantTypeCode = plantType === "grass" ? 1 : plantType === "flower" ? 2 : 3;
    
    if (this.scene.getPlantType(this.row, this.col) === 0) {
      this.scene.recordState();
      this.scene.setPlantType(this.row, this.col, plantTypeCode);
      this.scene.setGrowthLevel(this.row, this.col, 0);
      console.log(`Planted ${plantType} at (${this.row}, ${this.col})`);
      this.plant = this.scene.add.sprite(this.x, this.y, plantType);
      this.plant.anims.play(`sow-${plantType}`, true);
    }
  }

  reapCell(): void {
    if (this.scene.getPlantType(this.row, this.col) !== 0) {
      this.scene.recordState();
      this.scene.setPlantType(this.row, this.col, 0);
      this.scene.setGrowthLevel(this.row, this.col, 0);
      console.log(`Reaping plant at (${this.row}, ${this.col})`);
      if (this.plant) {
        this.plant.destroy();
        this.plant = null;
      }
    }
  }

  checkNeighborCells(): boolean {
    // Directions for adjacent cells
    const directions = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
    ];

    let adjacentSameTypeCount = 0;
    let adjacentLowerTierCount = 0;

    for (const dir of directions) {
      const adjCell =
        this.scene.cellGrid[this.y / 32 + dir.y]?.[this.x / 32 + dir.x];
        
      if (adjCell && adjCell.checkIsPlanted()) {
        const adjTier = this.getPlantTier(adjCell.type);
        const thisTier = this.getPlantTier(this.type);

        if (adjCell.type === this.type) {
          adjacentSameTypeCount++;
        } else if (adjTier === thisTier - 1) {
          adjacentLowerTierCount++;
        }
      }
    }

    if (this.type === "grass" && adjacentSameTypeCount < 3) {
      return adjacentSameTypeCount >= 3;
    }

    return adjacentSameTypeCount >= 3 || adjacentLowerTierCount >= 3;
  }

  checkCellGrowth(): void {
    const plantTypeCode = this.scene.getPlantType(this.row, this.col);
    const waterLevel = this.scene.getWaterLevel(this.row, this.col);
    const growthLevel = this.scene.getGrowthLevel(this.row, this.col);
    const sunLevel = this.scene.sunLevel;

    const plantDef = plantDefinitions.find(
      (def) => def.typeCode === plantTypeCode
    );

    if (!plantDef) return;

    for (const condition of plantDef.growthConditions) {
      if (
        sunLevel >= condition.minSun &&
        waterLevel >= condition.minWater &&
        growthLevel < 3
      ) {
        this.growPlant(
          plantDef.type,
          growthLevel,
          waterLevel,
          condition.waterRequired
        );
        break;
      }
    }
  }

  checkIsPlanted(): boolean {
    return this.planted;
  }

  addWater(newWaterVal: number): void {
    this.waterLevel += newWaterVal;
  }

  //Helper function to determine the tier of a plant type
  getPlantTier(plantType: "grass" | "flower" | "shrub"): number {
    switch (plantType) {
      case "grass":
        return 1;
      case "flower":
        return 2;
      case "shrub":
        return 3;
      default:
        return 0;
    }
  }

  updateSprite(plantType: 0 | 1 | 2 | 3, growthLevel: number): void {
    if (plantType === 0) {
      // No plant on the cell
      if (this.plant) {
        this.plant.destroy();
        this.plant = null;
      }
      this.setTexture("dirtTile");
      this.setFrame(0);
    } else {
      // Map plantType codes to their respective textures
      const plantTextureMap: { [key: number]: string } = {
        1: "grass",
        2: "flower",
        3: "shrub",
      };
  
      const plantTexture = plantTextureMap[plantType];
      if (!this.plant) {
        this.plant = this.scene.add.sprite(this.x, this.y, plantTexture);
        this.plant.setDepth(this.depth + 1);
      }
      this.plant.anims.play(`${growthLevel}-${plantTexture}`, true);
    }
  }
}

export default Cell;
