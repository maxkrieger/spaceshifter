import { Pairings } from "./types";

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
