import { Pairings } from "./types";
import Papa from "papaparse";
export function isValidJSON(json: object): json is Pairings {
  return (
    Array.isArray(json) &&
    json.every((pairing) => {
      return (
        "text_1" in pairing &&
        "text_2" in pairing &&
        "label" in pairing &&
        typeof pairing.text_1 === "string" &&
        typeof pairing.text_2 === "string" &&
        (pairing.label === -1 || pairing.label === 1)
      );
    })
  );
}

export function parseCSV(csvFile: File): Promise<Pairings | null> {
  return new Promise((resolve) => {
    Papa.parse(csvFile, {
      worker: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error(results.errors);
          resolve(null);
        } else {
          const data = results.data;
          if (isValidJSON(data)) {
            resolve(data);
          } else {
            resolve(null);
          }
        }
      },
    });
  });
}

export async function parseJSON(jsonFile: File): Promise<Pairings | null> {
  try {
    const parsed = await jsonFile.json();
    if (isValidJSON(parsed)) {
      return parsed;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function parseJSONL(jsonLFile: File): Promise<Pairings | null> {
  try {
    const text = await jsonLFile.text();
    console.log(text);
    const parsed = text
      // To prevent from parsing newlines in strings
      .replaceAll("\\n", "{{NEWLINE_REPLACEME}}")
      .split("\n")
      .filter((line) => line.length > 0)
      .map((line) =>
        JSON.parse(line.replaceAll("{{NEWLINE_REPLACEME}}", "\\n"))
      );
    if (isValidJSON(parsed)) {
      return parsed;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}
