import { gameGlobal, GLOBAL_NAMES_VOCAB, ResourceType, parseSelectorNames } from "sci2-ts";
import { GameSession } from "sci2-ts/viewer";

/**
 * The page around the game: buttons for the actions (for touch screens, and anyone who'd
 * rather not right-click), the inventory and the game menu, sound or just the music on or off, and a line
 * saying what a click will do.
 */
const canvas = document.querySelector<HTMLCanvasElement>("#screen")!;
const status = document.querySelector<HTMLElement>("#status")!;
const error = document.querySelector<HTMLElement>("#error")!;
const verbButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-verb]")];
const inventoryButton = document.querySelector<HTMLButtonElement>("#inventory")!;
const menuButton = document.querySelector<HTMLButtonElement>("#menu")!;
const soundButton = document.querySelector<HTMLButtonElement>("#sound")!;
const musicButton = document.querySelector<HTMLButtonElement>("#music")!;
const VERB_NAMES: Record<number, string> = { 1: "Look", 2: "Talk", 3: "Walk", 4: "Use", 5: "Use the item" };
const SOUND_KEY = "sherlock.sound";
const MUSIC_KEY = "sherlock.music";

try {
  const soundOn = (() => {
    try { return localStorage.getItem(SOUND_KEY) !== "off"; } catch { return true; }
  })();
  // Saves stay this page's own; audio starts with the first click or key, as browsers require.
  const musicOn = (() => {
    try { return localStorage.getItem(MUSIC_KEY) !== "off"; } catch { return true; }
  })();
  const session = await GameSession.create({ canvas, muted: !soundOn, musicMuted: !musicOn, saveNamespace: "sherlock-workshop" });
  const vm = session.vm;
  const globals = parseSelectorNames(session.rm.loadSync({ type: ResourceType.Vocab, number: GLOBAL_NAMES_VOCAB }).data);
  const global = (name: string) => gameGlobal(vm, globals.indexOf(name));
  /** The player can act: no cutscene, no line up, nothing open. */
  const ready = () => {
    const user = global("user");
    return !!user && !!vm.getProp(user, "canInput") && !global("talking") && !global("dialog");
  };
  const send = (name: string, selector: string, args: number[] = []) => {
    const obj = global(name);
    if (obj) vm.invoke(obj, vm.selector(selector), args);
    canvas.focus({ preventScroll: true });
  };
  const selectVerb = (verb: number) => ready() && send("user", "setVerb", [verb]);
  const openInventory = () => ready() && send("inventory", "showSelf");
  const openMenu = () => (global("user") && vm.getProp(global("user")!, "canInput") && !global("dialog")) && send("game", "showMenu");

  verbButtons.forEach((b) => b.addEventListener("click", () => selectVerb(Number(b.dataset.verb))));
  inventoryButton.addEventListener("click", openInventory);
  menuButton.addEventListener("click", openMenu);
  const showSound = () => {
    soundButton.setAttribute("aria-pressed", String(!session.muted));
    soundButton.querySelector("span")!.textContent = session.muted ? "Sound off" : "Sound on";
  };
  soundButton.addEventListener("click", () => {
    session.setMuted(!session.muted);
    try { localStorage.setItem(SOUND_KEY, session.muted ? "off" : "on"); } catch { /* private mode */ }
    showSound();
  });
  showSound();
  // Music alone: off leaves the voices and effects playing.
  const showMusic = () => {
    musicButton.setAttribute("aria-pressed", String(!session.musicMuted));
    musicButton.querySelector("span:last-child")!.textContent = session.musicMuted ? "Music off" : "Music on";
  };
  musicButton.addEventListener("click", () => {
    session.setMusicMuted(!session.musicMuted);
    try { localStorage.setItem(MUSIC_KEY, session.musicMuted ? "off" : "on"); } catch { /* private mode */ }
    showMusic();
  });
  showMusic();
  // Number keys pick actions (I and Escape are the game's own).
  addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    const verb = ({ "1": 3, "2": 1, "3": 2, "4": 4 } as Record<string, number>)[e.key];
    if (verb) (e.preventDefault(), selectVerb(verb));
  });

  session.onDraw.push(() => {
    const user = global("user");
    const verb = user ? vm.getProp(user, "verb") ?? 3 : 3;
    const canAct = ready();
    for (const b of verbButtons) {
      b.setAttribute("aria-pressed", String(Number(b.dataset.verb) === verb));
      b.disabled = !canAct;
    }
    inventoryButton.disabled = !canAct;
    menuButton.disabled = !user || !vm.getProp(user, "canInput") || !!global("dialog");
    status.textContent =
      global("talking") ? "Click or tap to go on."
      : global("dialog") ? "Choose one."
      : !canAct ? "…"
      : `${VERB_NAMES[verb] ?? "Walk"}: click or tap the scene.`;
    if (session.error) (error.hidden = false), (error.textContent = session.error.message);
  });
  session.start();
} catch (e) {
  status.textContent = "The game couldn't start.";
  error.hidden = false;
  error.textContent = String(e);
}
