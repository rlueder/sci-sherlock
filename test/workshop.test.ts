import { expect, it } from "vitest";
import { playWorkshop } from "../preview.ts";

it("plays Sherlock's workshop: walk, inspect both clues, reveal, revisit", async () => {
  const result = await playWorkshop();
  expect(result.resources).toBeGreaterThan(20);
});
