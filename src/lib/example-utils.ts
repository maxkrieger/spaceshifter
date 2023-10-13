import { Pairings } from "./types";

export async function loadExampleDataset(route: string) {
  const response = await fetch(route);
  const json = await response.json();
  return json as Pairings;
}
