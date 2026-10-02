import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EventType, ResourceManager, ResourceType, Vm, allKernels, graphics, input, stringHelpers, writeResourceArchive, type Frame, type Value } from "sci-ts";
import { buildGame } from "sci-ts/build";
import { framePng } from "sci-ts/png";

/**
 * A real input-driven playthrough of the whole teaser, 221B to the hidden stair; optionally
 * saves review frames (the workshop's among them).
 */
export async function playTeaser(capture?: (name: string, frame: Frame) => void) {
  const game = await buildGame(fileURLToPath(new URL(".", import.meta.url)));
  assert(game.resources.some((r) => r.type === ResourceType.Pic && r.number === 102), "workshop picture must be in the game");
  const archive = writeResourceArchive(game.resources);
  // Sound effects (sounds/*.wav) are in RESOURCE.SFX, among the build's other files.
  const files: Record<string, Uint8Array> = { "RESOURCE.MAP": archive.map, "RESOURCE.000": archive.volume, ...game.files };
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
  /** The open topic menu's choices. */
  const menu = () => {
    const d = global("dialog"), items = d ? vm.getProp(d, "items") ?? 0 : 0;
    const out: { text: string; x: number; y: number }[] = [];
    if (!items) return out;
    for (let n = vm.memory.list(vm.getProp(items, "elements")!)?.first; n; n = n.next) {
      out.push({ text: stringHelpers.str(vm, vm.getProp(n.value, "text")!), x: prop(n.value, "x"), y: prop(n.value, "y") });
    }
    return out;
  };
  // Clicks away from the top edge, where the icon bar would come down.
  const click = (x: number, y: number, right = false) => {
    [inp.x, inp.y] = [x, y];
    inp.push({ type: EventType.MouseDown, message: 0, modifiers: right ? 3 : 0 });
    inp.push({ type: EventType.MouseUp, message: 0 }); frames(5);
  };
  const verb = (n: number) => {
    for (let i = 0; i < 5 && prop(global("user"), "verb") !== n; i++) click(319, 100, true);
    assert.equal(prop(global("user"), "verb"), n);
  };
  /** Clicks through what's said until the player can act again (or a menu is up). */
  const finish = () => {
    const said: string[] = [];
    for (let i = 0; i < 2400; i++) {
      if (line()) { said.push(line()); click(319, 100); }
      else frames(1);
      if (!line() && prop(global("user"), "canInput") && !prop(global("curRoom"), "script")) return said;
    }
    throw new Error(`scene did not return control to the player (room ${global("curRoomNum")}, effect ${prop(global("sfx"), "number")} ${prop(global("sfx"), "handle") ? "playing" : "stopped"})`);
  };
  const choose = (text: string) => {
    const item = menu().find((m) => m.text === text);
    assert(item, `"${text}" is not in the menu: ${menu().map((m) => m.text).join(" / ")}`);
    click(item.x + 4, item.y + 4);
    return finish();
  };
  const talkTo = (name: string) => { verb(2); click(prop(obj(name), "x"), prop(obj(name), "y") - 20); };
  const enter = (room: number) => {
    for (let i = 0; i < 1200 && global("curRoomNum") !== room; i++) frames(1);
    assert.equal(global("curRoomNum"), room);
  };
  const shot = (name: string) => { [inp.x, inp.y] = [319, 199]; frames(1); capture?.(name, latest!); };

  // 221B: Watson by the fire, then Mrs Hudson shows Toby in.
  vm.start(vm.exportAddress(0, 0), "play"); frames(10);
  assert.equal(global("curRoomNum"), 100);
  const arrival = finish();
  assert(arrival.some((s) => /My name is Toby Vance/.test(s)), arrival.join("\n"));
  assert(!obj("mrsHudson"), "Mrs Hudson has gone back down");
  shot("221b");
  verb(4); click(298, 100);
  assert.match(line(), /visitor/, "the door waits for the client"); finish();
  // Toby's story: four topics, then the one that takes the case.
  talkTo("toby");
  for (const topic of ["Your master?", "The door was locked?", "The clocks?", "The lantern?"]) choose(topic);
  shot("toby-menu");
  const going = choose("We shall go at once.");
  assert(going.some((s) => /go at once/.test(s)));
  choose("Goodbye.");
  verb(4); click(298, 100);
  assert.match(line(), /My lens/, "the lens first"); finish();
  click(176, 74);
  assert.match(line(), /Where I go/); finish();
  assert(!obj("mantelLens"));
  assert.equal(vm.getProp(global("inventory"), "size"), 1);
  verb(4); click(298, 100); finish();

  // Baker Street, and the cab.
  enter(101); finish();
  shot("baker-street");
  verb(4); click(250, 115); finish();

  // The workshop.
  enter(102); frames(10);
  assert(latest!.pixels.some((p) => p !== 0), "scene is not black");
  assert(!obj("scratches"), "the scratch marks start hidden");
  assert.equal(prop(obj("filings"), "cel"), 0);
  shot("workshop");
  const lamps = new Set<number>();
  const swings = new Set<number>();
  for (let i = 0; i < 125; i++) { frames(1); lamps.add(prop(obj("lantern"), "cel")); swings.add(prop(obj("clock"), "cel")); }
  assert.equal(lamps.size, 8, "the lantern flickers");
  assert(swings.size > 12, "the case clock's pendulum swings: the one clock still going");
  assert(!obj("caseDoor"), "the opening case is hidden until the reveal");
  // Now and then a mouse runs between the furniture (scripts/10.sc).
  let waited = 0;
  while (!obj("mouse") && waited < 900) (frames(1), waited++);
  assert(obj("mouse"), "the mouse comes out within a few seconds of entering");
  frames(48); // out from under the clock, on the open floor
  shot("mouse");

  verb(3); click(74, 175); frames(360);
  assert.equal(prop(global("ego"), "cel"), 0);
  assert.equal(prop(global("ego"), "x"), 74);
  shot("foreground");
  click(147, 171); frames(360);
  verb(4); click(270, 120);
  assert.match(line(), /Before moving anything/);
  finish();
  assert(obj("clock"), "the clock is still shut");

  // The wall clocks: a close-up of a dial over the dimmed room, then what Holmes makes of it.
  verb(1); click(219, 46);
  assert.equal(vm.object(global("dialog")).name, "CloseUp");
  shot("dial");
  click(319, 100);
  frames(2);
  assert.match(line(), /seventeen minutes past three/);
  const clockLines = finish();
  assert(clockLines.some((s) => /stopped by hand/.test(s)));
  verb(4); click(270, 120);
  assert.match(line(), /Before moving anything/, "one clue must not unlock the reveal"); finish();
  // The filings: too fine to read by eye; Holmes takes out his lens (I, the inventory).
  verb(1); click(225, 150);
  assert.match(line(), /too fine/); finish();
  inp.push({ type: EventType.KeyDown, message: 105, modifiers: 0 }); frames(2);
  assert.equal(global("dialog"), global("inventory"));
  const [icon] = [...g.items].filter((it) => prop(it, "view") === 250);
  assert(icon, "the lens is in the inventory");
  shot("inventory");
  click(prop(icon, "x") + 8, prop(icon, "y") + 8);
  assert.equal(prop(global("user"), "verb"), 5);
  click(225, 150);
  const filingLines = finish();
  assert(filingLines.some((s) => /kneels with his lens/.test(s)), filingLines.join("\n"));
  assert.equal(prop(global("ego"), "view"), 200, "Holmes stands again after kneeling");
  assert(filingLines.some((s) => /trail from the bench/.test(s)));
  assert.equal(prop(obj("filings"), "cel"), 1);
  assert(obj("scratches"), "the lens shows the scratch marks");
  shot("trail");
  // Both clues, but the case stays shut until Holmes has reasoned it out with Watson.
  verb(4); click(270, 120);
  assert.match(line(), /put this in order/); finish();
  talkTo("watson");
  shot("deductions");
  const door = choose("The case clock is a door.");
  assert(door.some((s) => /walked through it/.test(s)), door.join("\n"));
  choose("Goodbye.");
  verb(4); click(270, 120);
  const revealLines = finish();
  assert(revealLines.some((s) => /left us a way in/.test(s)), revealLines.join("\n"));
  assert(!obj("clock"), "the swinging clock gives way to the opening one");
  assert.equal(prop(obj("caseDoor"), "cel"), 7);
  assert.equal(prop(global("ego"), "view"), 200, "Holmes is himself again after the reach");
  assert.equal(prop(global("user"), "canInput"), 1);
  shot("reveal");

  // Through the clock, to the stair and the last line.
  verb(4); click(270, 120);
  enter(103);
  const ending = finish();
  assert(ending.some((s) => /To be continued/.test(s)), ending.join("\n"));
  shot("stair");

  // Back in the workshop (as a saved game would be), it keeps the open case and the trail.
  vm.invoke(global("game"), vm.selector("newRoom"), [102]); frames(10);
  assert(!obj("clock"));
  assert.equal(prop(obj("caseDoor"), "cel"), 7);
  assert.equal(prop(obj("filings"), "cel"), 1);
  assert(obj("scratches"));
  assert.equal(vm.missingKernels.size, 0);
  return { frames: g.frames, resources: game.resources.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = resolve("out/art/sherlock-preview"); mkdirSync(out, { recursive: true });
  const result = await playTeaser((name, frame) => writeFileSync(`${out}/${name}.png`, framePng(frame, 3)));
  console.log(`Teaser playthrough passed: ${result.frames} frames, ${result.resources} resources. Screenshots: ${out}`);
}
