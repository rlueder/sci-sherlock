import { expect, it } from "vitest";
import { playTeaser } from "../preview.ts";

it("plays the teaser: 221B and Toby's story, Baker Street, the workshop's clues and deductions, the stair", async () => {
  const result = await playTeaser();
  expect(result.resources).toBeGreaterThan(20);
}, 60_000); // the whole teaser, headless: a few seconds here, longer on CI
