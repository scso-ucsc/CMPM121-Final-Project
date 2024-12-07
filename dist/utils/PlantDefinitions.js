export const plantDefinitions = [
    {
        type: "grass",
        typeCode: 1,
        growthConditions: [
            {
                minSun: 3,
                minWater: 5,
                waterRequired: 5,
            },
        ],
        icon: "🌱",
    },
    {
        type: "flower",
        typeCode: 2,
        growthConditions: [
            {
                minSun: 10,
                minWater: 10,
                waterRequired: 10,
            },
        ],
        icon: "🌼",
    },
    {
        type: "shrub",
        typeCode: 3,
        growthConditions: [
            {
                minSun: 7,
                minWater: 20,
                waterRequired: 20,
            },
        ],
        icon: "🌳",
    },
];
//# sourceMappingURL=PlantDefinitions.js.map