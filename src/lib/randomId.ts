import { randomUUID } from "expo-crypto";

/** UUID v4 — works on Hermes/Android (no global `crypto`). */
export function randomId(): string {
  return randomUUID();
}
