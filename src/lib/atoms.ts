import { atomWithStorage } from "jotai/utils";

export const apiKeyAtom = atomWithStorage<string | null>("api-key", null);
