// src/lib/toolSets.ts
import {
  weatherTool,
  calculatorTool,
  searchDocs,
  searchWeb,
  readWebPage,
  notepad,
  readNotes,
} from "./tools";

export const chatTools = {
  getWeather: weatherTool,
  calculate: calculatorTool,
  searchDocs,
};

export const researchTools = {
  searchWeb,
  readWebPage,
  notepad,
  readNotes,
};

// All tools combined — for a "power mode"
export const allTools = {
  ...chatTools,
  ...researchTools,
};
