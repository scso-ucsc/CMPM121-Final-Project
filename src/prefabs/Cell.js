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
    }

    sowCell(plantType){
        if(this.planted == false){
            console.log("Planted");
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
        if(this.planted == true){
            if(this.type == "grass"){
                growGrass();
            } else if(this.type == "flower"){
                growFlower();
            } else if(this.type == "shrub"){
                growShrub();
            }
        }
    }

    growGrass(){
        if(scene.sunLevel >= 3 && this.waterLevel >= 5){ //Future note: PlayScene will need to generate sunLevel each turn
            this.growthLevel += 1;
        }
    }

    growFlower(){
        if(scene.sunLevel >= 10 && this.waterLevel >= 15){
            this.growthLevel += 1;
        }
    }

    growShrub(){
        if(scene.sunLevel >= 7 && this.waterLevel >= 30){
            this.growthLevel += 1;
        }
    }
}