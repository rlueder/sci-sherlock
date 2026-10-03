"""Stand-in voices: every line in voices/lines.json without a real recording gets one made with
Qwen3-TTS, in its speaker's voice. Each voice is cloned from a reference clip in
tts/references (tts/cast.json says whose, and how the clip was designed), so a character
sounds the same from line to line. voices/stand-ins.json lists the WAVs made here and what
each was made from; a line whose text or voice changes gets a new one, and a WAV not on the
list (a real recording) is never touched.

    pnpm voices        (uv installs Qwen3-TTS on the first run, and it fetches its model, 4.5 GB)

Runs on an Apple GPU or an NVIDIA one if there is one, otherwise on the CPU (slowly).
"""

import hashlib
import json
import subprocess
import sys
from math import gcd
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parent.parent
VOICES = ROOT / "voices"
TTS = ROOT / "tts"
RATE = 11025  # the game's voice resources
BATCH = 6

cast = json.loads((TTS / "cast.json").read_text())


def refresh_script() -> None:
    subprocess.run(["pnpm", "exec", "sci-ts", "lines", "script"], cwd=ROOT, check=True)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()[:12]


def voice_of(speaker: str) -> dict:
    name = cast["same"].get(speaker, speaker)
    if name not in cast["voices"]:
        sys.exit(f"no voice for {speaker} in tts/cast.json")
    return cast["voices"][name]


def spoken(text: str) -> str:
    for before, after in cast["say"].items():
        text = text.replace(before, after)
    return text


def fingerprint(line: dict) -> str:
    """What a stand-in was made from: its text and its voice's reference clip."""
    voice = voice_of(line["speaker"])
    clip = (TTS / voice["reference"]).read_bytes()
    return digest(line["text"].encode() + b"\0" + clip)


def finish(audio: np.ndarray, rate: int) -> np.ndarray:
    """Trimmed of silence at either end, levelled, and at the game's rate."""
    loud = np.flatnonzero(np.abs(audio) > 0.01)
    if loud.size:
        start = max(0, loud[0] - int(0.02 * rate))
        end = min(audio.size, loud[-1] + int(0.08 * rate))
        audio = audio[start:end]
    peak = np.abs(audio).max()
    if peak > 0:
        audio = audio * (0.89 / peak)
    g = gcd(RATE, rate)
    return resample_poly(audio, RATE // g, rate // g).astype(np.float32)


refresh_script()
lines = json.loads((VOICES / "lines.json").read_text())["lines"]
made_file = VOICES / "stand-ins.json"
made: dict[str, str] = json.loads(made_file.read_text()) if made_file.exists() else {}

todo = []
for line in lines:
    wav = VOICES / f"{line['id']}.wav"
    if wav.exists() and line["id"] not in made:
        continue  # a real recording
    if not wav.exists() or made[line["id"]] != fingerprint(line):
        todo.append(line)

if todo:
    from qwen_tts import Qwen3TTSModel

    device = "mps" if torch.backends.mps.is_available() else "cuda:0" if torch.cuda.is_available() else "cpu"
    model = Qwen3TTSModel.from_pretrained(cast["models"]["clone"], device_map=device, dtype=torch.bfloat16 if device != "cpu" else torch.float32)
    by_voice: dict[str, list[dict]] = {}
    for line in todo:
        by_voice.setdefault(cast["same"].get(line["speaker"], line["speaker"]), []).append(line)
    for name, group in by_voice.items():
        voice = cast["voices"][name]
        reference, rate = sf.read(TTS / voice["reference"], dtype="float32")
        prompt = model.create_voice_clone_prompt(ref_audio=(reference, rate), ref_text=voice["text"])
        for i in range(0, len(group), BATCH):
            batch = group[i : i + BATCH]
            wavs, out_rate = model.generate_voice_clone(
                text=[spoken(l["text"]) for l in batch], language=["English"] * len(batch), voice_clone_prompt=prompt
            )
            for line, audio in zip(batch, wavs):
                sf.write(VOICES / f"{line['id']}.wav", finish(np.asarray(audio, dtype=np.float32), out_rate), RATE, subtype="PCM_16")
                made[line["id"]] = fingerprint(line)
                print(f"{line['id']} {line['speaker']}: {line['text']}", flush=True)

# Stand-ins for lines that are gone.
ids = {line["id"] for line in lines}
for gone in [i for i in made if i not in ids]:
    (VOICES / f"{gone}.wav").unlink(missing_ok=True)
    del made[gone]
made_file.write_text(json.dumps(dict(sorted(made.items())), indent=2) + "\n")
refresh_script()
print(f"{len(todo)} stand-ins made; {len(made)} lines have one")
