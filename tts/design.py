"""How the reference clips in tts/references were made: each character's voice designed with
Qwen3-TTS VoiceDesign from the description and seed in tts/cast.json, reading its sample text.
The committed clips are the voices; this only matters when recasting someone. Seeds aren't
guaranteed to give the same voice on every machine, so listen before replacing a clip.

    uv run --project tts python tts/design.py Toby          (writes tts/references/<file>.wav)
    uv run --project tts python tts/design.py Toby --seed 7 (another take)
"""

import argparse
import json
from pathlib import Path

import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

TTS = Path(__file__).resolve().parent
cast = json.loads((TTS / "cast.json").read_text())

parser = argparse.ArgumentParser()
parser.add_argument("speaker", choices=sorted(cast["voices"]))
parser.add_argument("--seed", type=int)
args = parser.parse_args()
voice = cast["voices"][args.speaker]

device = "mps" if torch.backends.mps.is_available() else "cuda:0" if torch.cuda.is_available() else "cpu"
model = Qwen3TTSModel.from_pretrained(cast["models"]["design"], device_map=device, dtype=torch.bfloat16 if device != "cpu" else torch.float32)
torch.manual_seed(args.seed if args.seed is not None else voice["seed"])
wavs, rate = model.generate_voice_design(text=voice["text"], language="English", instruct=voice["description"])
out = TTS / voice["reference"]
sf.write(out, wavs[0], rate)
print(f"{out.relative_to(TTS.parent)}: {args.speaker}, seed {args.seed if args.seed is not None else voice['seed']}")
