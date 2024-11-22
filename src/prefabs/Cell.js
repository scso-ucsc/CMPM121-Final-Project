//Cell Prefab
class Cell extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture){
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;

        this.setImmovable(true);

        //plant frame variable
        this.plant = null; //initialize to null, will change depending on the plant put here
        this.frameNumber = 0;

        //Cell Variables
        this.waterLevel = 0;
        this.type = "none"; //The Distinct Type of Plant: "grass", "flower", "shrub", and "none"; Cells start as "none"
        this.planted = false; //Use this variable to determine if the plant is currently growing; Will be false if type is "none"
        this.growthLevel = 0;

        //Requirements for Growth
        this.grassWaterRequirement = 5;
        this.grassSunRequirement = 3;
        this.flowerWaterRequirement = 10;
        this.flowerSunRequirement = 10;
        this.shrubWaterRequirement = 20;
        this.shrubSunRequirement = 7;
    }

    sowCell(plantType){
        if(this.planted == false){
            console.log("Planting " + plantType);
            this.type = plantType;
            this.planted = true;
            this.plant = this.scene.add.sprite(this.x, this.y, `${plantType}`);
            this.plant.anims.play(`sow-${plantType}`, true);
        }
    }

    reapCell(){
        if(this.planted == true){
            console.log("Reaped");
            this.plant.anims.play(`reap-${this.type}`, true);
            this.frameNumber = 0;
            this.type = "none";
            this.planted = false;
        }
    }

    checkNeighborCells() {
        //Get the surrounding cells in all directions (left, right, up, down)
        const directions = [
            { x: -1, y: 0 }, //left
            { x: 1, y: 0 },  //right
            { x: 0, y: -1 }, //up
            { x: 0, y: 1 }   //down
        ];
    
        let adjacentSameTypeCount = 0;
        let adjacentLowerTierCount = 0;
    
        //Loop through the directions to check adjacent cells
        for (let dir of directions) {
            const adjCell = this.scene.cellGrid[this.y / 32 + dir.y]?.[this.x / 32 + dir.x];
    
            if (adjCell && adjCell.checkIsPlanted()) {
                if (adjCell.type === this.type) {
                    adjacentSameTypeCount++;
                } else if (this.getPlantTier(adjCell.type) === this.getPlantTier(this.type) - 1) {
                    adjacentLowerTierCount++;
                }
            }
        }
    
        //Grass has special rules; it cannot grow from "none" adjacent cells
        if (this.type === "grass" && adjacentSameTypeCount < 3) {
            return adjacentSameTypeCount >= 3; //Grass needs at least 3 adjacent grass cells
        }
    
        //For flower and shrub, check for either 3 same type or 3 lower tier
        return adjacentSameTypeCount >= 3 || adjacentLowerTierCount >= 3;
    }  

    checkCellGrowth(){
        if(this.type == "grass" && this.scene.sunLevel >= this.grassSunRequirement && this.waterLevel >= this.grassWaterRequirement && this.checkNeighborCells()){
            console.log("Growing " + this.type);
            this.growthLevel += 1;
            if(this.frameNumber < 3) {
                this.frameNumber += 1;
                this.plant.anims.play(`${Number(this.frameNumber)}-${this.type}`, true);
            }
            this.waterLevel -= this.grassWaterRequirement;
        } else if(this.type == "flower" && this.scene.sunLevel >= this.flowerSunRequirement && this.waterLevel >= this.flowerWaterRequirement && this.checkNeighborCells()){
            this.growthLevel += 1;
            this.waterLevel -= this.flowerWaterRequirement;
            if(this.frameNumber < 3) {
                this.frameNumber += 1;
                this.plant.anims.play(`${Number(this.frameNumber)}-${this.type}`, true);
            }
        } else if(this.type == "shrub" && this.scene.sunLevel >= this.shrubSunRequirement && this.waterLevel >= this.shrubWaterRequirement && this.checkNeighborCells()){
            this.growthLevel += 1;
            this.waterLevel -= this.shrubWaterRequirement;
            if(this.frameNumber < 3) {
                this.frameNumber += 1;
                this.plant.anims.play(`${Number(this.frameNumber)}-${this.type}`, true);
            }
        }
    }

    checkIsPlanted(){
        return this.planted;
    }

    addWater(newWaterVal){
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
                return 0; //"none" or undefined
        }
    }
}