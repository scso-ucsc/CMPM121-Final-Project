# Devlog Entry Intro - 11/14/2024

## Introducing the Team

Tools Lead: Alexander Halim

Engine Lead: Liam Murray

Tools and Engine Assistant: Sean Eric So

Gameplay Design Lead: Carter Gruebel

Aesthetic Design Lead: Jason Torres

## Tools and Materials

We have chosen to use Phaser3 as our main framework. This is because we all have experience with making games in Phaser3 from our time at CMPM120 - Game Development Experience. While for some of us it has been a while since we've last used Phaser3, having prior experience with this framework will allow us to tackle this project much more effectively compared to one that some of us have never used before. Furthermore, as this framework specializes in video games designed for the web, using it will help to further expand our knowledge on those types of games.

As a result of us using Phaser3 as our framework, the programming language and data language will be JavaScript and JSON expectedly. This is also because we all have some experience with coding in these languages before, making us more equipped to make a game using them.

For the other tools that we plan on utilizing for this project, we will be using Visual Studio Code as our IDE, and Photoshop, Paint.net, or Gimp for the process of creating visual assets. These are all tools that we currently use for our other game design projects and so we are comfortable and confident in our ability to work on them. In the case for the visual design tools, as some of us have never used these before, this project will also be a great source of exposure and experience with these tools.

Lastly, for our alternate platform choice, we plan on changing our primary language to TypeScript. This is because whilst TypeScript is similar to JavaScript, it does come with some unique features that we've recently been introduced to during our time in this course. Thus, by switching to this language, we will be given more experience with this new language as well as develop a better understanding of how it compares to the likes of JavaScript.

## Outlook

By developing this project, we are looking to be able to expand our knowledge of the TypeScript language and learn more about how it compares with JavaScript. We are also aiming to focus on the portability of both the JavaScript and TypeScript languages, and potentially create a game that is accessible on all web platforms without requiring our players to download it first. As a result of this, the most difficult part about this project would be the transition from JavaScript to TypeScript, as the two language's difference in abilities can result in some problems occuring down the line. Therefore, we will be sure to research how we can effectively make the switch between languages before implementing it so that we are better prepared for this challenge.

# Devlog Entry 0 - 11/22/2024

## How we satisfied the software requirements

F0.a: For the player movement, a Finite State Machine (FSM) was implemented onto the player prefab. This FSM features a Move state that is accessed whenever an arrow key is pressed, setting the player object's velocity in the desired direction. When moving either horizontally or vertically, the opposite's velocity will be set to 0, preventing the ability to walk diagonally. Originally, the movement function was handled in the PlayScene but Sean opted to handle it into a Player prefab instead for better maintenance/organization. The grid is initialized by setting up a 2D array and then looping over each row and then each column of the grid. Each cell is positioned based on its column & row index and "cellSize / 2" is used to center the cell within its grid space. The newly created cells are then stored in the 2D array.

F0.b: The manual activation for advancing the time revolved around the day variable and the advanceDay() function. We established days as our time value and a text object was created to display it on the top of the screen. The manual activation is keybinded to the spacebar which increments the day by 1 everytime it is pressed.

F0.c: In order to implement this requirement, we implemented two states in the Player FSM: Sow and Reap. The Sow state and Reap state are entered upon pressing the C and X keys, respectively. Upon doing so, the textureless sprites playerSowTargetBox and playerReapTargetBox will be moved onto the player's exact location, depending on which respective state was accessed. Our play scene will constantly check to see if any of these target boxes overlap with a cell on the grid, and upon doing so will trigger a function within the overlapped cell's prefab that will either sow a new plant into that cell or reap the current one. These functions will check to see if there are currently any plants in that cell to perform the required action. Furthermore, the target boxes are very small, making it difficult for an event in which multiple cells are interacted with can occur. This will enable the player to interact with the exact cell they are standing on.

F0.d: Whenever the advanceDay() function is pressed, a new water and sun level will be generated and assigned to the waterLevel and sunLevel variables, respectively. These values are generated using the Math.random() function combined with the Math.floor() function to ensure that the generated value is an integer. They have also been set to have a max value with a minimum value of 0. Each cell on the grid will then have the newly generated waterLevel added to their respective waterLevel values, whereas the sunLevel value is left alone is only accessed by the cell at the beginning of each day.

F0.e: Each cell prefab on the grid, contains its own plant type and growth level value. These individual values are updated by interacting with the rest of the scene, with the plant type being determined by what seed the player sowed into it and the growth level being determined by the conditions of the grid. Players can select what type of plant they would like to currently sow, and can select from either grass, a flower, or a shrub by using the Q, W, and E keys respectively. This type is stored in a variables called playerSeedChoice from the play scene, and is passed as an argument whenever the player sows into a cell.

F0.f:

F0.g:

## Reflection
