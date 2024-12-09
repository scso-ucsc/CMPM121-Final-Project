# Devlogs

## Devlog Entry Intro - 11/14/2024

### Introducing the Team

Tools Lead: Alexander Halim

Engine Lead: Liam Murray

Production Lead, Tools and Engine Assistant: Sean Eric So

Gameplay Design Lead: Carter Gruebel

Aesthetic Design Lead: Jason Torres

### Tools and Materials

We have chosen to use Phaser3 as our main framework. This is because we all have experience with making games in Phaser3 from our time at CMPM120 - Game Development Experience. While for some of us it has been a while since we've last used Phaser3, having prior experience with this framework will allow us to tackle this project much more effectively compared to one that some of us have never used before. Furthermore, as this framework specializes in video games designed for the web, using it will help to further expand our knowledge on those types of games.

As a result of us using Phaser3 as our framework, the programming language and data language will be JavaScript and JSON expectedly. This is also because we all have some experience with coding in these languages before, making us more equipped to make a game using them.

For the other tools that we plan on utilizing for this project, we will be using Visual Studio Code as our IDE, and Photoshop, Paint.net, or Gimp for the process of creating visual assets. These are all tools that we currently use for our other game design projects and so we are comfortable and confident in our ability to work on them. In the case for the visual design tools, as some of us have never used these before, this project will also be a great source of exposure and experience with these tools.

Lastly, for our alternate platform choice, we plan on changing our primary language to TypeScript. This is because whilst TypeScript is similar to JavaScript, it does come with some unique features that we've recently been introduced to during our time in this course. Thus, by switching to this language, we will be given more experience with this new language as well as develop a better understanding of how it compares to the likes of JavaScript.

### Outlook

By developing this project, we are looking to be able to expand our knowledge of the TypeScript language and learn more about how it compares with JavaScript. We are also aiming to focus on the portability of both the JavaScript and TypeScript languages, and potentially create a game that is accessible on all web platforms without requiring our players to download it first. As a result of this, the most difficult part about this project would be the transition from JavaScript to TypeScript, as the two language's difference in abilities can result in some problems occuring down the line. Therefore, we will be sure to research how we can effectively make the switch between languages before implementing it so that we are better prepared for this challenge.

## Devlog Entry 0 - 11/22/2024

### How we satisfied the software requirements

F0.a: For the player movement, a Finite State Machine (FSM) was implemented onto the Player prefab. This FSM features a Move state that is accessed whenever an arrow key is pressed, setting the player object's velocity in the desired direction. When moving either horizontally or vertically, the opposite's velocity will be set to 0, preventing the ability to walk diagonally. Originally, the movement function was handled in the PlayScene but Sean opted to handle it into a Player prefab instead for better maintenance/organization. The grid is initialized by setting up a 2D array and then looping over each row and then each column of the grid. Each cell is positioned based on its column & row index and "cellSize / 2" is used to center the cell within its grid space. The newly created cells are then stored in the 2D array.

F0.b: The manual activation for advancing the time revolved around the day variable and the advanceDay() function. We established days as our time value and a text object was created to display it on the top of the screen. The manual activation is keybinded to the spacebar which increments the day by 1 everytime it is pressed.

F0.c: In order to implement this requirement, we implemented two states in the Player FSM: Sow and Reap. The Sow state and Reap state are entered upon pressing the C and X keys, respectively. Upon doing so, the textureless sprites playerSowTargetBox and playerReapTargetBox will be moved onto the player's exact location, depending on which respective state was accessed. Our play scene will constantly check to see if any of these target boxes overlap with a cell on the grid, and upon doing so will trigger a function within the overlapped cell's prefab that will either sow a new plant into that cell or reap the current one. These functions will check to see if there are currently any plants in that cell to perform the required action. Furthermore, the target boxes are very small, making it difficult for an event in which multiple cells are interacted with can occur. This will enable the player to interact with the exact cell they are standing on.

F0.d: Whenever the advanceDay() function is pressed, a new water and sun level will be generated and assigned to the waterLevel and sunLevel variables, respectively. These values are generated using the Math.random() function combined with the Math.floor() function to ensure that the generated value is an integer. They have also been set to have a max value with a minimum value of 0. Each cell on the grid will then have the newly generated waterLevel added to their respective waterLevel values, whereas the sunLevel value is left alone is only accessed by the cell at the beginning of each day.

F0.e: Each cell prefab on the grid, contains its own plant type and growth level value. These individual values are updated by interacting with the rest of the scene, with the plant type being determined by what seed the player sowed into it and the growth level being determined by the conditions of the grid. Players can select what type of plant they would like to currently sow, and can select from either grass, a flower, or a shrub by using the Q, W, and E keys respectively. This type is stored in a variables called playerSeedChoice from the play scene, and is passed as an argument whenever the player sows into a cell. This data is then passed the Phaser animation engine, which changes the appearance of a sprite object on that cell. This communicates to the player that their action has indeed occured, and that a plant is growing. There are 5 different frames for each state that the plant can be in (Sowed, growth 1, 2, 3, and reaped), and 3 different plants that can be grown.

F0.f: To implement this requirement, whenever the advanceDay() function is called, each cell in the cell group will be checked to see if a plant has been planted into it. If this value returns true, then a subsequent check to see whether or not the current sun level and that cell's water level meets the required values. If met, the cell's growth level will increase by 1. Additionally, when the cells are iterated over, they will run a check that detects whether the surrounding plants permit for a plant to start growing at level 1. The requirements are that a cell can start growing a specific plant if they are surrounded by three or more of the same plant or the plant a tier below it (i.e. grass is tier 1, flower is tier 2).

F0.g: To implement this requirement, we added in game over condition for the player needing to have at least a total of 5 plants that had a growth level of 3. We added in the checkEndCondition() function that will check if the player has satisfied the end game requirements when the player advances to the next day. This function iterates through all planted cells, counting the number of plants that meet the required growth level. Once the end game conditions are met the gameOver() function will trigger and an alert on the page will pop up notifying the player that they have won. By implementing this feature, we successfully provide a clear and functional play scenario completion system as required.

### Reflection

Now that we have finished this part of the assignment, although we have stuck to our original plan of using Phaser3, JavaScript, and Visual Studio Code as our tools and materials, we did end up adjusting our roles as well as adopting others' whilst we tackled each requirement. For instance, since Alexander and Sean implemented most of requirements F0.a to F0.f, Carter ended up assuming more of an Engine Lead role as he volunteered to develop the function that checks what cells are around the other cells in order to determine if that cell can grow. Meanwhile, Jason took up more of a Gameplay Design Lead as he implemented the game's end conditions and Liam took on the role of the Aesthetics Design Lead as he designed all of the sprites for each cell. There is still the possibility that we will all perform the original roles that we decided upon as more of a leadership role, though we would argue that each of our roles are still very flexible and that we will assist each other from time to time.

## Devlog Entry 1 - 11/27/2024

### How we satisfied the software requirements

F0.a to F0.g: Same as last week.

F1.a: The game's grid state now uses a single continguous byte array that uses the AoS approach. Each cell is represented by 3 consecutive bytes (plant type, water level, and growth level). There are getter and setter functions used to apply updates to the byte array. The cellGroup remains as a visual representation of the grid state.

![F1.a data structure diagram](./assets/f1a_diagram.png)

F1.b: To implement this requirement we added a saveGame() and loadGame() function into our play scene. The saveGame() function will store the game's current data, including the global variables and state of the grid, into a constant which is then saved into the hardware's local storage. The loadGame() function extracts this data and then set the scene's current values to those extracted. After this is conducted, the entire grid and UI are updated to represent the new data. A new function updateSprite() was added to the Cell prefab in order to properly display the correct state upon being loaded. Our project currently displays three save and load buttons each, enabling the player to saved three different states at any time. These buttons are created with the newly implemented createSaveLoadUI() function that is also featured in our play scene. Players may click on this buttons to implement their respective functions.

F1.c: The autosave mechanic was pretty straight forward once the saveGame() and loadGame() were implemented. Essentially, there is an autosave slot in localStorage that acts much the same way that the other save slots do. When the browser is reloaded or closed suddenly, a window listener detects this (using a "beforeunload" event) and uses an adapted version of the saveGame() function to create an autosave. Then, upon reloading the game, if an autosave is detected, it prompts the user to choose if they want to load the save. If they select yes, the game is restored to its previous state. The autosave is not visible to the player, as it is meant to be used only during unexpected closures.

F1.d: The undo and redo mechanics were fairly easy to implement. The mechanics were implemented using lists that are pushed to and popped from stacks that hold the pertinent information in them. This information includes sun level, water level, player state and much more. The redo stack is cleared when a save state is loaded, but the undo stack is saved based on which instance the player decides to load.

### Reflection

The biggest change that our project had to adjust to as a result of implementing the F1 requirements was the addition of a byte array to represent our grid. This change ultimately affected how our individual prefabs interacted with the grid in terms of how our variables got stored and how they got updated. This has greatly affected how we plan on developing the gameplay design aspect of our project, especially knowing we will have to change programming languages in the future. This is because our prefabs no longer act as individual game objects but rather game objects that follow a separate attribute, similar to how flyweight patterns work. However, upon completing this change, it became a lot easier to implement the other requirements as it was now much easier to store the necessary data. With this new stage of our project, we have also begun adopting the roles that we originally set out to fulfill moreso than we did whilst working on F0, such as Carter looking into more ways in which we can improve the gameplay and Jason beginning to look into UI/UX elements to add and make our project feel more like a game. Whilst these ideas haven't been implemented fully at the moment, we can expect to see these items come into fruition very soon. Nonetheless, our roles are still pretty flexible with each of us embracing other people's roles to assist whenever we can.

## Devlog Entry 2 - 12/2/2024

### How we satisfied the software requirements

### F0+F1

F0.d: With the addition of our External DSL, the sun level and water level of the current day is instead determined by a new function generateWeather(). This function takes the minimum and maximum values for both sun and water from our defaultScenario.txt file and generates a random number between them accordingly. Additional, should the event WaterMultiplier exist, then the generated water value will be doubled for the day. This occurs when the event signifying a rainstorm from the defaultScenario.txt has occurred.

F0.g: Like with the minimum and maximum values of the sun and water levels, our win condition is also defined in our external DSL. The supplied value from this text file is checked against the current number of mature plants on the player's grid. If the player has reached the desired amount of plants, they win. Additionally, a lose condition has also been added via this external DSL, which is called when the player has reached day 20 and hasn't grown enough mature plants.

No major changes were made to the other preceeding requirements.

### External DSL for Scenario Design

Our External DSL is featured in the defaultScenario.txt that's being kept in the new scenarios folder that's inside our assets folder. It is parsed by our new ScenarioParser.js module that gets called by our play scene. Our DSL is mostly INI-inspired but includes some TOML aspects so that it may include arrays, nested keys, and game-specific data needed for our project. The following is an example segment of our DSL:

```[Events]
Day 5:
    SunRange = [5, 15]
    WaterRange = [0, 3]
    Message = "There is a drought! The sun is stronger than ever but water levels are now low."
```

In our code sample above, we are using INI for the sake of defining our headers, such as with `[Events]`, in order to store the desired values in the correct fields to then be later used by our project. TOML is then used for array values such as the `SunRange = [5, 15]` to represent the minimum and maximum values of sun our game can generate after this specific day. TOML is also used for typed data, as demonstrated with our `Message`. Both INI and TOML were used specifically because they are easier to read and offers simple syntax, making them less complicated to decipher.

### Internal DSL for Plants and Growth Conditions

The Internal DSL is handled in the PlantDefinitions.js seen in the utils folder. The plantDefinitions array acts as the central catalog for all the plant types in the game. Each plant type has the following properties as seen in the grass example below:

```
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
```

When the game checks to see if a plant can grow in the checkCellGrowth function, it will use the plantDefintions DSL to get the plant's requirements. The UI is also updated to fit the icon field in the DSL field (concerning the player's current Seed Choice).

### Switch to Alternate Platform
For this project, our switch to an alternate platform involved retaining Phaser3 as our main platform but transitioning from the JavaScript language into the TypeScript one. This involved renaming our JavaScript files (.js) into TypeScript ones (.ts) and manually updating the code of each JavaScript file. In order to preserve what we had originally implemented, I created a new branch called TypeScriptConversion on our repository and implemented these changes there. With each JavaScript file, we then had to define our inputs and outputs for various function which involved the introduction of new and unique type variables, as well as updating the JavaScript syntax into TypeScript. A tsconfig.json file was also added to enable and configure TypeScript compilation.

### Reflection
With the addition of our External and Internal DSLs, the way in which we implemented certain aspects of our F0 requirements were changed, specifically in terms of how our water and sunlight variables are calculated and when certain events occur. This addition has also resulted in us adjusting the way in which we provide variables to our play scene as now all of these values can be defined in our defaultScenario.txt file instead of the play scene itself. The implementation of our internal DSL has also enabled us to properly inform our players what seed choice they current have selected, which includes displaying a simple emoji icon. Furthermore, the addition of the external DSL has allowed us to create events that occur at certain days of the game, allowing for a more unique experience throughout gameplay. That being said, now that our project has switched to using TypeScript instead of JavaScript, not much has changed aside from needing to define new type annotations, replacing file extensions, and updating the syntax. That being said, the way in which certain functions are written needed to be significantly adjusted to meet the TypeScript language's demands so that everything may run like it did before. Our roles have mostly stayed the same from the last devlog, though each of us did work together in order to determine how to convert our project into using TypeScript.

## Devlog Entry 3 - 12/6/2024

### How we satisfied the software requirements

### F0+F1+F2
No major changes were made in order to implement the aforementioned requirements.

### Internationalization
The internationalization is handled by a translation manager class, which can load different languages based on what the user selects when initally prompted. Then, whenever text is going to be displayed on screen, rather than hard coding it, it calls the texts key from the translation manager, which loads the correct language. The language stored in the translation manager also determines which language of scenario file is loaded, ensuring that that text is also translated. Thus, every piece of text on the screen is able to be translated, as long as that language has been implemented in the localization.

### Localization
Our game was localized to support English, Japanese, and Arabic. This was achieved by setting up three separate JSON files that contain dictionaries. Each key in the dictionary is identical, with their value being the translation in the files' respective language. The way the translations were made were via Brace. Brace was simply prompted to translate the English localization JSON. This approach was also implemented for our scenarios. The scenarios are stored in a separate text file from where the rest of the UI is stored (our Play scene file). Copies were made of the scenario file for each language that our localization supports. This ensured that every bit of text in our game was able to be translated into three different languages.

### Mobile Installation
In order to make our game installable on mobile devices we referred to Brace for instruction. From there, a manifest.json file containing all of the app data was developed including two new icon assets that would be used as the app's icon. After that, a service worker JavaScript file designed to cache all of the necessary files needed to run the game was made, which includes its own listener functions to add into the generated app. Since this service worker only works with JavaScript files, all of our TypeScript files first needed to be converted into JavaScript files. This process involved ensuring all TypeScript files had no compiling errors and then converting them into JavaScript files through `tsc npx`. This generated a `dist/` folder that contained all of these new JavaScript files. The tsconfig.json file was also updated to allow for this conversion. Afterwards, these aspects were added into our index.html file so that they may be included in the web link. This allowed our game to be downloadable and could run on other devices.

### Mobile Play (Offline)
To optimize our game for mobile devices, we designed and implemented touch-friendly buttons for key interactions. These include directional buttons (up, down, left, right) for player movement, seamlessly integrated with the MoveState class to handle velocity, direction, and animations.
In addition to movement, we added action-specific buttons:

Reap Button: Allows players to clear nearby cells with a simple tap, enhancing gameplay flow.

Sow Button: Plants the currently selected plant type in the nearest cell, making planting intuitive and efficient.

Advance Day Button: Progresses the game to the next day, fitting naturally into the gameplay loop.

We also created buttons for plant selection, enabling players to switch between grass, flowers, and shrubs. This allows players to quickly switch plant types with clear icon-based designs.
By implementing these touch-friendly controls, we’ve ensured that the game remains accessible, engaging, and easy to play on mobile devices, providing a seamless experience tailored to touchscreen users.

### Reflection
With this project now being adjusted to work on mobile, the largest aspect that we need to change was how players could provide inputs. Since mobile devices do not have keyboards, we had to add physical buttons that players can press in order to move around, add plants, and advance the day. Since we didn't want these buttons to feature text as it would require additional implementations due to the addition of localization to this project, we made sure that the icons for these buttons used symbols that would provide players an idea of what they did. The UI also updates accordingly for whenever they press on those buttons. As per usual, our roles have mostly remained the same with each of us assisting in another whenever we can. The transition to using TypeScript instead of JavaScript for this project had definitely left an impact on how we viewed both the engine and the language. Whilst TypeScript is more secure and has added features, it was ultimately less accepted by web browsers which required more effort to figure out. This has left a major impression on how we view both languages and how we can use them to produce games in the future.