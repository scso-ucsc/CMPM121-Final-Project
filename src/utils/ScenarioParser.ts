
export interface EventDay {
  [key: string]: string | number | number[]; // Event data allows string, number, or arrays
}

export interface NonEventSection {
  [key: string]: string | number | number[]; // Non-event sections allow string, number, or arrays
}

interface EventsSection {
  [day: string]: EventDay; // Each day contains EventDay key-value pairs
}

export interface Result {
  [sectionName: string]: NonEventSection | EventsSection; // Top-level sections
}

class ScenarioParser {
  text: string;

  constructor(text: string) {
    this.text = text;
  }

  parse(): Result {
    const lines = this.text.split("\n");
    const result: Result = {}; // Result is now explicitly typed

    let currentSection: string | null = null;
    let currentEventDay: string | null = null;

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
        (result[currentSection] as EventsSection)[sanitizedDay] = {}; // Type-safe cast for 'Events'
        currentEventDay = sanitizedDay;
        continue;
      }

      // Parsing key-value pairs
      const [key, value] = line.split("=").map((v) => v?.trim());
      if (!key || !value) {
        console.warn("Invalid line", line);
        continue;
      }

      if (currentSection === "Events" && currentEventDay) {
        (result[currentSection] as EventsSection)[currentEventDay][key] =
          this.parseValue(value);
      } else {
        (result[currentSection as string] as NonEventSection)[key] =
          this.parseValue(value);
      }
    }

    return result;
  }

  /**
   * Determines the type of value and parses it accordingly
   */
  parseValue(value: string): string | number | number[] {
    // Handle arrays (e.g., "[1, 2, 3]" or "['a', 'b']")
    if (value.startsWith("[") && value.endsWith("]")) {
      return JSON.parse(value.replace(/'/g, '"')); // Replace single quotes with double for JSON parsing
    }

    // Check if value can be parsed as a number
    return isNaN(Number(value)) ? value.replace(/"/g, "") : parseFloat(value);
  }
}

export default ScenarioParser;
