import { gameGlobal, GLOBAL_NAMES_VOCAB, ResourceType, parseSelectorNames } from "sci2-ts";
import { GameSession } from "sci2-ts/viewer";

const canvas = document.querySelector<HTMLCanvasElement>("#screen")!;
const status = document.querySelector<HTMLElement>("#status")!;
const error = document.querySelector<HTMLElement>("#error")!;
const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-verb]")];
document.querySelector("#restart")!.addEventListener("click", () => location.reload());
try {
  const session = await GameSession.create({ canvas, muted: true, saveNamespace: "sherlock-workshop" });
  const vm = session.vm;
  const globals = parseSelectorNames(session.rm.loadSync({ type: ResourceType.Vocab, number: GLOBAL_NAMES_VOCAB }).data);
  const global = (name: string) => gameGlobal(vm, globals.indexOf(name));
  const select = (verb: number) => {
    const user = global("user");
    if (!user || !vm.getProp(user, "canInput") || global("talking")) return;
    vm.invoke(user, vm.selector("setVerb"), [verb]);
    canvas.focus({ preventScroll: true });
  };
  buttons.forEach((button) => button.addEventListener("click", () => select(Number(button.dataset.verb))));
  addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    const verb = ({ "1": 3, "2": 1, "3": 4 } as Record<string, number>)[e.key];
    if (verb) { e.preventDefault(); select(verb); }
  });
  session.onDraw.push(() => {
    const user = global("user");
    const talking = !!global("talking");
    const active = user ? vm.getProp(user, "verb") : 3;
    const ready = !!user && !!vm.getProp(user, "canInput") && !talking;
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.verb) === active));
      button.disabled = !ready;
    }
    status.textContent = talking ? "Click the scene to continue." : !ready ? "Holmes is investigating…" : `${({ 1: "Look", 2: "Talk", 3: "Walk", 4: "Use" } as Record<number, string>)[active ?? 3]} — click the scene.`;
    if (session.error) { error.hidden = false; error.textContent = session.error.message; }
  });
  session.start();
} catch (e) {
  status.textContent = "The workshop could not start.";
  error.hidden = false; error.textContent = String(e);
}
