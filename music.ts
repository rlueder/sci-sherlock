import { ResourceType, SoundDevice, writeSound, type MidiEvent, type ResourceData, type SoundSpec } from "sci-ts/kit";

/**
 * The teaser's music, composed here as notes (General MIDI, played through the player's
 * SoundFont). Rooms loop it with `music:` in their YAML.
 *
 *   120  Baker Street: a slow waltz in D minor, a violin over strings (221B, the street)
 *   121  The workshop: clocks ticking on a wood block, a low cello, a chime now and then
 *
 * Lengths are in eighth notes; a tick is 1/60 s.
 */

type Note = [note: number, eighths: number];

/** Notes one after another on a channel, each held a little short of its length. */
function line(channel: number, notes: Note[], eighth: number, velocity: number, from = 0): MidiEvent[] {
  const out: MidiEvent[] = [];
  let t = from;
  for (const [note, eighths] of notes) {
    if (note > 0) out.push({ tick: t, bytes: [0x90 | channel, note, velocity] }, { tick: t + eighths * eighth - 2, bytes: [0x80 | channel, note, 0] });
    t += eighths * eighth;
  }
  return out;
}

/** A chord held for a bar of `eighths`, one per bar. */
function chords(channel: number, bars: number[][], eighths: number, eighth: number, velocity: number): MidiEvent[] {
  return bars.flatMap((chord, bar) => chord.flatMap((n) => [
    { tick: bar * eighths * eighth, bytes: [0x90 | channel, n, velocity] },
    { tick: (bar + 1) * eighths * eighth - 1, bytes: [0x80 | channel, n, 0] },
  ]));
}

const program = (channel: number, instrument: number): MidiEvent => ({ tick: 0, bytes: [0xc0 | channel, instrument] });

/** Every part of a tune is as long as the others, or the loop comes round out of step. */
function sameLength(tune: string, eighths: number, ...parts: Note[][]) {
  for (const part of parts) {
    const length = part.reduce((sum, [, e]) => sum + e, 0);
    if (length !== eighths) throw new Error(`${tune}: a part is ${length} eighths long, not ${eighths}`);
  }
}
const sorted = (events: MidiEvent[]) => events.sort((a, b) => a.tick - b.tick);

function bakerStreet(): SoundSpec {
  const EIGHTH = 24;
  // Eight bars of 3/4 (six eighths each), the second half answering the first.
  const melody: Note[] = [
    [69, 2], [74, 2], [77, 2],
    [76, 4], [74, 2],
    [72, 2], [74, 2], [76, 2],
    [69, 6],
    [70, 2], [74, 2], [79, 2],
    [77, 4], [76, 2],
    [74, 2], [73, 2], [76, 2],
    [74, 6],
  ];
  // Dm, Dm, C, A; Gm, Dm, A7, Dm.
  const harmony = [[50, 57, 62], [50, 57, 62], [48, 55, 64], [45, 52, 61], [43, 50, 58], [50, 57, 62], [45, 55, 61], [50, 57, 62]];
  const bass: Note[] = [[38, 6], [36, 6], [36, 6], [33, 6], [31, 6], [38, 6], [33, 6], [38, 6]];
  sameLength("Baker Street", harmony.length * 6, melody, bass);
  return {
    tracks: [{
      device: SoundDevice.GeneralMidi,
      channels: [
        { midiChannel: 0, voices: 1, events: sorted([program(0, 40), ...line(0, melody, EIGHTH, 80)]) }, // violin
        { midiChannel: 1, voices: 3, events: sorted([program(1, 49), ...chords(1, harmony, 6, EIGHTH, 38)]) }, // slow strings
        { midiChannel: 2, voices: 1, events: sorted([program(2, 43), ...line(2, bass, EIGHTH, 50)]) }, // contrabass
      ],
    }],
  };
}

function workshop(): SoundSpec {
  const EIGHTH = 20;
  const BARS = 8; // of 4/4
  // The clocks: a tick and a tock every quarter, on the drums' high and low wood blocks.
  const ticks: Note[] = Array.from({ length: BARS * 4 }, (_, i) => [i % 2 ? 77 : 76, 2]);
  // A cello holding D, then C, under it.
  const cello: Note[] = [[38, 16], [36, 16], [38, 16], [41, 8], [40, 8]];
  // A chime: three notes, a rest, then one more. Three, and seventeen past.
  const chime: Note[] = [[0, 24], [81, 1], [77, 1], [74, 2], [0, 4], [69, 4], [0, 28]];
  sameLength("the workshop", BARS * 8, ticks, cello, chime);
  return {
    tracks: [{
      device: SoundDevice.GeneralMidi,
      channels: [
        { midiChannel: 9, voices: 1, events: sorted(line(9, ticks, EIGHTH, 52)) },
        { midiChannel: 0, voices: 1, events: sorted([program(0, 42), ...line(0, cello, EIGHTH, 46)]) }, // cello
        { midiChannel: 1, voices: 1, events: sorted([program(1, 14), ...line(1, chime, EIGHTH, 60)]) }, // tubular bells
      ],
    }],
  };
}

export function music(): ResourceData[] {
  return [
    { type: ResourceType.Sound, number: 120, data: writeSound(bakerStreet()) },
    { type: ResourceType.Sound, number: 121, data: writeSound(workshop()) },
  ];
}
