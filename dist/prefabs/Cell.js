import { plantDefinitions } from "../utils/PlantDefinitions";
import Phaser from "phaser";
class Cell extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, row, col) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setImmovable(true);
        this.parentScene = scene;
        this.row = row;
        this.col = col;
        this.plant = null;
        this.frameNumber = 0;
        this.planted = false;
        this.waterLevel = 0;
    }
    sowCell(plantType) {
        const plantTypeCode = plantType === "grass" ? 1 : plantType === "flower" ? 2 : 3;
        if (this.parentScene.getPlantType(this.row, this.col) === 0) {
            this.parentScene.recordState();
            this.parentScene.setPlantType(this.row, this.col, plantTypeCode);
            this.parentScene.setGrowthLevel(this.row, this.col, 0);
            this.plant = this.scene.add.sprite(this.x, this.y, plantType);
            this.plant.anims.play(`sow-${plantType}`, true);
        }
    }
    reapCell() {
        if (this.parentScene.getPlantType(this.row, this.col) !== 0) {
            this.parentScene.recordState();
            this.parentScene.setPlantType(this.row, this.col, 0);
            this.parentScene.setGrowthLevel(this.row, this.col, 0);
            if (this.plant) {
                this.plant.destroy();
                this.plant = null;
            }
        }
    }
    checkNeighborCells() {
        var _a;
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
            if (this.parentScene.cellGrid) {
                const adjCell = (_a = this.parentScene.cellGrid[this.y / 32 + dir.y]) === null || _a === void 0 ? void 0 : _a[this.x / 32 + dir.x];
                if (adjCell && adjCell.checkIsPlanted()) {
                    const adjTier = this.getPlantTier(adjCell.type);
                    const thisTier = this.getPlantTier(this.type);
                    if (adjCell.type === this.type) {
                        adjacentSameTypeCount++;
                    }
                    else if (adjTier === thisTier - 1) {
                        adjacentLowerTierCount++;
                    }
                }
            }
        }
        if (this.type === "grass" && adjacentSameTypeCount < 3) {
            return adjacentSameTypeCount >= 3;
        }
        return adjacentSameTypeCount >= 3 || adjacentLowerTierCount >= 3;
    }
    checkCellGrowth() {
        const plantTypeCode = this.parentScene.getPlantType(this.row, this.col);
        const waterLevel = this.parentScene.getWaterLevel(this.row, this.col);
        const growthLevel = this.parentScene.getGrowthLevel(this.row, this.col);
        const sunLevel = this.parentScene.sunLevel;
        const plantDef = plantDefinitions.find((def) => def.typeCode === plantTypeCode);
        if (!plantDef)
            return;
        for (const condition of plantDef.growthConditions) {
            if (sunLevel >= condition.minSun &&
                waterLevel >= condition.minWater &&
                growthLevel < 3) {
                this.growPlant(plantDef.type, growthLevel, waterLevel, condition.waterRequired);
                break;
            }
        }
    }
    growPlant(plantType, growthLevel, waterLevel, waterRequirement) {
        if (growthLevel < 3) {
            growthLevel++;
            this.scene.setGrowthLevel(this.row, this.col, growthLevel);
            // update water level
            this.scene.setWaterLevel(this.row, this.col, waterLevel - waterRequirement);
            // update animation
            if (this.plant) {
                this.plant.anims.play(`${growthLevel}-${plantType}`, true);
            }
        }
    }
    checkIsPlanted() {
        return this.planted;
    }
    addWater(newWaterVal) {
        this.waterLevel += newWaterVal;
    }
    //Helper function to determine the tier of a plant type
    getPlantTier(plantType) {
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
    updateSprite(plantType, growthLevel) {
        if (plantType == 0) {
            if (this.plant) {
                this.plant.destroy();
                this.plant = null;
            }
            this.setTexture("dirtTile");
            this.setFrame(0);
        }
        else {
            const plantTexture = {
                1: "grass",
                2: "flower",
                3: "shrub",
            }[plantType];
            if (!this.plant) {
                this.plant = this.scene.add.sprite(this.x, this.y, plantTexture);
                this.plant.setDepth(this.depth + 1);
            }
            this.plant.anims.play(`${growthLevel}-${plantTexture}`, true);
        }
    }
}
export default Cell;
//# sourceMappingURL=Cell.js.map