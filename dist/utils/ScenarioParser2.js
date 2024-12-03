// //DSL Parser for the scenario file
// interface scenarioObject {
//   StartingConditons: conditionsObject,
//   VictoryConditions: victoryObject,
//   WeatherPolicy: weatherPolicyObject,
// }
class ScenarioParser {
    constructor(text) {
        this.text = text;
    }
    parse() {
        const lines = this.text.split('\n');
        const result = {}; // Result is now explicitly typed
        let currentSection = null;
        let currentEventDay = null;
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith("#")) {
                // Skip empty lines and comments
                continue;
            }
            // If line is a header
            if (line.startsWith("[") && line.endsWith("]")) {
                currentSection = line.slice(1, -1);
                result[currentSection] = {}; // Initialize new section
                currentEventDay = null;
                continue;
            }
            // If it's an event day header like `Day X:`
            if (currentSection === "Events" && line.match(/^Day \d+:/)) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [_, day] = line.split(" ");
                const sanitizedDay = day.replace(":", "").trim();
                result[currentSection][sanitizedDay] = {}; // Type-safe cast for 'Events'
                currentEventDay = sanitizedDay;
                continue;
            }
            // Parsing key-value pairs
            const [key, value] = line.split("=").map((v) => v === null || v === void 0 ? void 0 : v.trim());
            if (!key || !value) {
                console.warn("Invalid line", line);
                continue;
            }
            if (currentSection === "Events" && currentEventDay) {
                result[currentSection][currentEventDay][key] = this.parseValue(value);
            }
            else {
                result[currentSection][key] = this.parseValue(value);
            }
        }
        return result;
    }
    /**
     * Determines the type of value and parses it accordingly
     */
    parseValue(value) {
        // Handle arrays (e.g., "[1, 2, 3]" or "['a', 'b']")
        if (value.startsWith("[") && value.endsWith("]")) {
            return JSON.parse(value.replace(/'/g, '"')); // Replace single quotes with double for JSON parsing
        }
        // Check if value can be parsed as a number
        return isNaN(Number(value)) ? value.replace(/"/g, "") : parseFloat(value);
    }
}
export default ScenarioParser;
//# sourceMappingURL=ScenarioParser2.js.map