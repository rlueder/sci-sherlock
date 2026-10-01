import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EventType, ResourceManager, ResourceType, Vm, allKernels, graphics, input, stringHelpers, writeResourceArchive, type Frame, type Value } from "sci-ts";
import { buildGame } from "sci-ts/build";
import { framePng } from "sci-ts/png";

/** A real input-driven playthrough of the workshop; optionally saves review frames. */
export async function playWorkshop(capture?: (name: string, frame: Frame) => void) {
  const game = await buildGame(fileURLToPath(new URL(".", import.meta.url)));
  assert(game.resources.some((r) => r.type === ResourceType.Pic && r.number === 102), "workshop picture must be in the game");
  const archive = writeResourceArchive(game.resources);
  const files: Record<string, Uint8Array> = { "RESOURCE.MAP": archive.map, "RESOURCE.000": archive.volume };
  const rm = await ResourceManager.open({ read: async (p) => files[p], readRange: async (p, o, n) => files[p]!.slice(o, o + n), list: async () => Object.keys(files) });
  await rm.preload();
  const vm = new Vm(rm); vm.registerKernels(allKernels);
  const g = graphics(vm), inp = input(vm);
  vm.clock = () => g.frames * 1000 / 60;
  let latest: Frame;
  g.onFrame = (f) => { latest = f; };
  const frames = (n: number) => {
    for (let i = 0; i < n; i++) { vm.run(); assert(vm.yieldRequested, vm.backtrace().join(" / ")); }
  };
  const global = (name: string): Value => vm.loadedScripts.find((s) => s.number === 0)!.locals[game.globals.indexOf(name)]!;
  const prop = (obj: Value, name: string) => g.prop(obj, name);
  const obj = (name: string) => [...g.items].find((item) => vm.object(item).name === name)!;
  const line = () => {
    const who = global("talking"), box = who ? vm.getProp(who, "box") ?? 0 : 0;
    return box ? stringHelpers.str(vm, vm.getProp(box, "text")!) : "";
  };
  const click = (x: number, y: number, right = false) => {
    [inp.x, inp.y] = [x, y];
    inp.push({ type: EventType.MouseDown, message: 0, modifiers: right ? 3 : 0 });
    inp.push({ type: EventType.MouseUp, message: 0 }); frames(5);
  };
  const verb = (n: number) => {
    for (let i = 0; i < 4 && prop(global("user"), "verb") !== n; i++) click(319, 0, true);
    assert.equal(prop(global("user"), "verb"), n);
  };
  const finish = () => {
    const said: string[] = [];
    for (let i = 0; i < 1200; i++) {
      if (line()) { said.push(line()); click(319, 0); }
      else frames(1);
      if (!line() && prop(global("user"), "canInput") && !prop(global("curRoom"), "script")) return said;
    }
    throw new Error("scene did not return control to the player");
  };
  const shot = (name: string) => { [inp.x, inp.y] = [319, 199]; frames(1); capture?.(name, latest!); };
  vm.start(vm.exportAddress(0, 0), "play"); frames(10);
  assert.equal(global("curRoomNum"), 102);
  assert(latest!.pixels.some((p) => p !== 0), "scene is not black");
  assert(!obj("dial"), "inspection overlay must start hidden");
  shot("workshop");
  const lamps = new Set<number>();
  for (let i = 0; i < 45; i++) { frames(1); lamps.add(prop(obj("lantern"), "cel")); }
  assert.equal(lamps.size, 4);
  assert.equal(prop(obj("clock"), "cel"), 0, "the clocks stay still");

  click(74, 175); frames(360);
  assert.equal(prop(global("ego"), "cel"), 0);
  assert.equal(prop(global("ego"), "x"), 74);
  shot("foreground");
  click(147, 171); frames(360);
  verb(4); click(270, 120);
  assert.match(line(), /Before moving anything/);
  finish();
  assert.equal(prop(obj("clock"), "cel"), 0);

  verb(1); click(219, 46);
  assert.match(line(), /seventeen minutes past three/);
  assert(obj("dial"));
  shot("dial");
  const clockLines = finish();
  assert(clockLines.some((s) => /stopped by hand/.test(s)));
  assert(!obj("dial"));
  verb(4); click(270, 120);
  assert.match(line(), /Before moving anything/, "one clue must not unlock the reveal"); finish();
  verb(1); click(225, 151);
  assert.match(line(), /raises his lens/); finish();
  verb(4); click(270, 120);
  const revealLines = finish();
  assert(revealLines.some((s) => /to be continued/.test(s)), revealLines.join("\n"));
  assert.equal(prop(obj("clock"), "cel"), 7);
  assert.equal(prop(global("user"), "canInput"), 1);
  shot("reveal");
  // Re-entering the room must retain the open case, without the inspection overlay.
  vm.invoke(global("game"), vm.selector("newRoom"), [102]); frames(10);
  assert.equal(prop(obj("clock"), "cel"), 7);
  assert(!obj("dial"));
  assert.equal(vm.missingKernels.size, 0);
  return { frames: g.frames, resources: game.resources.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = resolve("out/art/sherlock-preview"); mkdirSync(out, { recursive: true });
  const result = await playWorkshop((name, frame) => writeFileSync(`${out}/${name}.png`, framePng(frame, 3)));
  console.log(`Workshop playthrough passed: ${result.frames} frames, ${result.resources} resources. Screenshots: ${out}`);
}
