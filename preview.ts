import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EventType, ResourceManager, ResourceType, Vm, allKernels, graphics, input, stringHelpers, writeResourceArchive, type Frame, type Value } from "sci2-ts";
import { buildGame } from "sci2-ts/build";
import { framePng } from "sci2-ts/png";

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
    const who = ["mrsHudson", "toby", "door"].map((n) => { const o = obj(n); return o ? `${n} at ${prop(o, "x")},${prop(o, "y")} cel ${prop(o, "cel")}${prop(o, "mover") ? " moving" : ""}${prop(o, "cycler") ? " cycling" : ""}` : `${n} hidden`; }).join("; ");
    throw new Error(`scene did not return control to the player (room ${global("curRoomNum")}, effect ${prop(global("sfx"), "number")} ${prop(global("sfx"), "handle") ? "playing" : "stopped"}; ${who}; line ${JSON.stringify(line())})`);
  };
  const choose = (text: string) => {
    const item = menu().find((m) => m.text === text);
    assert(item, `"${text}" is not in the menu: ${menu().map((m) => m.text).join(" / ")}`);
    click(item.x + 4, item.y + 4);
    return finish();
  };
  const talkTo = (name: string) => { verb(2); click(prop(obj(name), "x"), prop(obj(name), "y") - 60); }; // the chest: people are hit only where drawn
  const enter = (room: number) => {
    for (let i = 0; i < 1200 && global("curRoomNum") !== room; i++) frames(1);
    assert.equal(global("curRoomNum"), room);
  };
  const shot = (name: string) => { [inp.x, inp.y] = [319, 199]; frames(1); capture?.(name, latest!); };

  // The title screen, then 221B: Watson by the fire, then Mrs Hudson shows Toby in.
  vm.start(vm.exportAddress(0, 0), "play"); frames(10);
  assert.equal(global("curRoomNum"), 104);
  shot("title");
  enter(100); frames(5);
  const arrival = finish();
  assert(arrival.some((s) => /Toby Vance, sir/.test(s)), arrival.join("\n"));
  assert(!obj("mrsHudson"), "Mrs Hudson has gone back down");
  shot("221b");
  // Escape: the casebook, painted, its first row lit under the pointer; Escape again carries on.
  inp.push({ type: EventType.KeyDown, message: 27, modifiers: 0 }); frames(2);
  assert.equal(prop(global("dialog"), "skin"), 269, "the game menu is the casebook");
  assert.deepEqual(menu().map((m) => m.text), ["Save the game", "Restore a game", "Start again", "Text speed: normal", "Speech: voice and text", "Carry on"]);
  [inp.x, inp.y] = [100, 51]; frames(2);
  capture?.("casebook", latest!);
  inp.push({ type: EventType.KeyDown, message: 27, modifiers: 0 }); frames(2);
  assert.equal(global("dialog"), 0);
  // The things r43 painted back in: the Persian slipper by the fire.
  verb(1); click(59, 93);
  const slipper = finish();
  assert(slipper.some((t) => /Persian slipper/.test(t)), slipper.join("\n"));
  verb(4); click(303, 80);
  assert.match(line(), /visitor/, "the door waits for the client"); finish();
  // Toby's story: four topics, then the one that takes the case.
  talkTo("toby");
  for (const topic of ["Your master?", "The door was locked?", "The clocks?", "The lantern?"]) choose(topic);
  shot("toby-menu");
  const going = choose("We shall go at once.");
  assert(going.some((s) => /go at once/.test(s)));
  choose("Goodbye.");
  verb(4); click(303, 80);
  assert.match(line(), /My lens/, "the lens first"); finish();
  click(49, 75);
  assert.match(line(), /Where I go/); finish();
  assert(!obj("mantelLens"));
  assert.equal(vm.getProp(global("inventory"), "size"), 1);
  verb(4); click(303, 80); finish();

  // Baker Street, and the cab.
  enter(101); finish();
  shot("baker-street");
  // The cab's lantern flickers, and now and then the driver nods and puffs at his pipe.
  const flames = new Set<number>(), nods = new Set<number>();
  for (let i = 0; i < 700; i++) { frames(1); flames.add(prop(obj("lamp"), "cel")); nods.add(prop(obj("driver"), "cel")); }
  assert.equal(flames.size, 16, "the cab's lantern flickers");
  assert.equal(nods.size, 64, "the driver's timeline plays through");
  verb(4); click(250, 160); finish();

  // The workshop.
  enter(102); frames(10);
  assert(latest!.pixels.some((p) => p !== 0), "scene is not black");
  assert(!obj("scratches"), "the scratch marks start hidden");
  assert.equal(prop(obj("filings"), "cel"), 0);
  shot("workshop");
  const lamps = new Set<number>();
  for (let i = 0; i < 125; i++) { frames(1); lamps.add(prop(obj("light"), "cel")); }
  assert.equal(lamps.size, 6, "the lamp's light flickers on the bench");
  const swings = new Set<number>();
  for (let i = 0; i < 125; i++) { frames(1); swings.add(prop(obj("pendulum"), "cel")); }
  assert(swings.size > 20, "the case clock's pendulum swings: the one clock still going");
  // Now and then the mouse runs under the bench (scripts/10.sc).
  let waited = 0;
  while (!obj("mouse") && waited < 900) (frames(1), waited++);
  assert(obj("mouse"), "the mouse comes out within a few seconds of entering");
  frames(90); // halfway across, between the bay's uprights
  shot("mouse");
  const mx = prop(obj("mouse"), "x");
  assert(mx > 110 && mx < 225, `the mouse is under the bench (x ${mx})`);
  assert(!obj("caseDoor"), "the opening case is hidden until the reveal");

  // Behind the desk in the foreground.
  verb(3); click(108, 192); frames(360);
  assert.equal(prop(global("ego"), "x"), 108);
  shot("foreground");
  click(168, 176); frames(360);
  verb(4); click(300, 60);
  assert.match(line(), /Before moving anything/);
  finish();
  assert(obj("clock"), "the clock is still shut");

  // The wall clocks: a close-up of a dial over the dimmed room, then what Holmes makes of it.
  verb(1); click(160, 30);
  assert.equal(vm.object(global("dialog")).name, "CloseUp");
  shot("dial");
  click(319, 100);
  frames(2);
  assert.match(line(), /seventeen minutes past three/);
  const clockLines = finish();
  assert(clockLines.some((s) => /stopped by hand/.test(s)));
  verb(4); click(300, 60);
  assert.match(line(), /Before moving anything/, "one clue must not unlock the reveal"); finish();
  // The filings: too fine to read by eye; Holmes takes out his lens (I, the inventory).
  verb(1); click(283, 172);
  assert.match(line(), /too fine/); finish();
  inp.push({ type: EventType.KeyDown, message: 105, modifiers: 0 }); frames(2);
  assert.equal(global("dialog"), global("inventory"));
  const [icon] = [...g.items].filter((it) => prop(it, "view") === 250);
  assert(icon, "the lens is in the inventory");
  shot("inventory");
  click(prop(icon, "x") + 8, prop(icon, "y") + 8);
  assert.equal(prop(global("user"), "verb"), 5);
  // Held over the filings, the lens shows them twice as large through its glass.
  [inp.x, inp.y] = [283, 174]; frames(2);
  assert(g.magnify, "the lens magnifies");
  capture?.("lens", latest!);
  click(283, 172);
  const filingLines = finish();
  assert(filingLines.some((s) => /Brass filings, in the sawdust/.test(s)), filingLines.join("\n"));
  assert.equal(prop(global("ego"), "view"), 200, "Holmes stands again after kneeling");
  assert(filingLines.some((s) => /trail from the bench/.test(s)));
  assert.equal(prop(obj("filings"), "cel"), 1);
  assert(obj("scratches"), "the lens shows the scratch marks");
  shot("trail");
  // Both clues, but the case stays shut until Holmes has reasoned it out with Watson.
  verb(4); click(300, 60);
  assert.match(line(), /put this in order/); finish();
  talkTo("watson");
  shot("deductions");
  const door = choose("The case clock is a door.");
  assert(door.some((s) => /walked through it/.test(s)), door.join("\n"));
  choose("Goodbye.");
  verb(4); click(300, 60);
  const revealLines = finish();
  assert(revealLines.some((s) => /left us a way in/.test(s)), revealLines.join("\n"));
  assert(!obj("clock"), "the swinging clock gives way to the opening one");
  assert(!obj("pendulum"), "the pendulum goes with the closed case");
  assert.equal(prop(obj("caseDoor"), "cel"), 7);
  assert.equal(prop(global("ego"), "view"), 200, "Holmes is himself again after the reach");
  assert.equal(prop(global("user"), "canInput"), 1);
  shot("reveal");

  // Through the clock, to the stair and the last line.
  verb(4); click(300, 60);
  enter(103); frames(30);
  shot("stair");
  const peeks = new Set<number>();
  for (let i = 0; i < 60; i++) { frames(1); peeks.add(prop(obj("peek"), "cel")); }
  assert(peeks.size > 8, "the pendulum swings behind the slot in the clock's back");
  const ending = finish();
  assert(ending.some((s) => /still keeping time/.test(s)), ending.join("\n"));
  enter(105); frames(5);
  shot("end");

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
