export type EventDay = Record<string, string | number | string[]>;

export type ParsedScenario = {
  [section: string]: Record<string, string | number | string[] | EventDay>;
};
