//Cell Prefab
class Cell extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture){
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;

        this.setImmovable(true);

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
        }
    }

    reapCell(){
        if(this.planted == true){
            console.log("Reaped");
            this.type = "none";
            this.planted = false;
        }
    }

    checkCellGrowth(){
        if(this.type == "grass" && this.scene.sunLevel >= 3 && this.grassSunRequirement >= this.grassWaterRequirement){
            console.log("Growing " + this.type);
            this.growthLevel += 1;
            this.waterLevel -= this.grassWaterRequirement;
        } else if(this.type == "flower" && this.scene.sunLevel >= this.flowerSunRequirement && this.waterLevel >= this.flowerWaterRequirement){
            this.growthLevel += 1;
            this.waterLevel -= this.flowerWaterRequirement;
        } else if(this.type == "shrub" && this.scene.sunLevel >= this.shrubSunRequirement && this.waterLevel >= this.shrubWaterRequirement){
            this.growthLevel += 1;
            this.waterLevel -= this.shrubWaterRequirement;
        }
    }

    checkIsPlanted(){
        return this.planted;
    }

    addWater(newWaterVal){
        this.waterLevel += newWaterVal;
    }
}