//DSL Parser for the scenario file
import { EventDay, ParsedScenario } from "./types";

class ScenarioParser {
  private text: string;

  constructor(text: string) {
    this.text = text;
  }

  parse(): ParsedScenario {
    const lines: string[] = this.text.split("\n");
    const result: ParsedScenario = {};
    let currentSection: string | null = null;
    let currentEventDay: string | null = null;

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
      const [key, value] = line.split("=").map((v) => v?.trim());
      if (!key || !value) {
        console.warn("Invalid line", line);
        continue;
      }

      if (currentSection === "Events" && currentEventDay) {
        (result[currentSection][currentEventDay] as EventDay)[key] =
          this.parseValue(value);
      } else if (currentSection) {
        result[currentSection][key] = this.parseValue(value);
      }
    }

    return result;
  }

  parseValue(value: string): string | number | string[] {
    if (value.startsWith("[") && value.endsWith("]")) {
      return JSON.parse(value.replace(/'/g, '"')); //Parse arrays
    }

    return isNaN(Number(value)) ? value.replace(/"/g, "") : parseFloat(value);
  }
}

export default ScenarioParser;
