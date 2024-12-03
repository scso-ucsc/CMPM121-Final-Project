class ScenarioParser {
    constructor(text) {
        this.text = text;
    }
    parse() {
        const lines = this.text.split("\n");
        const result = {};
        let currentSection = null;
        let currentEventDay = null;
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith("#")) {
                // Skip empty lines and comments
                continue;
            }
            //If line is a header
            if (line.startsWith("[") && line.endsWith("]")) {
                currentSection = line.slice(1, -1);
                result[currentSection] = {};
                currentEventDay = null;
                continue;
            }
            if (currentSection === "Events" && /^Day \d+:/.test(line)) {
                const [_, day] = line.split(" ");
                const sanitizedDay = day.replace(":", "").trim();
                result[currentSection][sanitizedDay] = {};
                currentEventDay = sanitizedDay;
                continue;
            }
            //Parsing key value pairs
            const [key, value] = line.split("=").map((v) => v === null || v === void 0 ? void 0 : v.trim());
            if (!key || !value) {
                console.warn("Invalid line", line);
                continue;
            }
            if (currentSection === "Events" && currentEventDay) {
                result[currentSection][currentEventDay][key] =
                    this.parseValue(value);
            }
            else if (currentSection) {
                result[currentSection][key] = this.parseValue(value);
            }
        }
        return result;
    }
    parseValue(value) {
        if (value.startsWith("[") && value.endsWith("]")) {
            return JSON.parse(value.replace(/'/g, '"')); //Parse arrays
        }
        return isNaN(Number(value)) ? value.replace(/"/g, "") : parseFloat(value);
    }
}
export default ScenarioParser;
//# sourceMappingURL=ScenarioParser.js.map