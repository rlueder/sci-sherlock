import { deflateRawSync } from "node:zlib";
import type { Pixels } from "./pixels.ts";

/** Minimal deterministic ZIP writer for the project's editable Pixelorama masters. */
function zip(files: [string, Uint8Array][]) {
  const local: Buffer[] = [], central: Buffer[] = [];
  let offset = 0;
  for (const [filename, bytes] of files) {
    const name = Buffer.from(filename), data = deflateRawSync(bytes);
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(8, 8);
    header.writeUInt16LE(33, 12); // 1980-01-01, invariant across builds
    header.writeUInt32LE(crc, 14); header.writeUInt32LE(data.length, 18); header.writeUInt32LE(bytes.length, 22);
    header.writeUInt16LE(name.length, 26);
    local.push(header, name, data);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(8, 10); entry.writeUInt16LE(33, 14);
    entry.writeUInt32LE(crc, 16); entry.writeUInt32LE(data.length, 20); entry.writeUInt32LE(bytes.length, 24);
    entry.writeUInt16LE(name.length, 28); entry.writeUInt32LE(offset, 42);
    central.push(entry, name);
    offset += header.length + name.length + data.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

/** Pixelorama 1.2.3's data.json + raw RGBA cel format; verified with its desktop exporter. */
export function pixeloramaProject(palette: string[], layers: string[], frames: Pixels[][], tags: { name: string; from: number; to: number }[] = [], options: {
  layers?: { locked?: boolean; visible?: boolean; linkAll?: boolean }[];
  currentLayer?: number;
  userData?: string;
} = {}) {
  const first = frames[0]![0]!;
  if (frames.some((f) => f.length !== layers.length || f.some((p) => p.width !== first.width || p.height !== first.height))) {
    throw new Error("Every Pixelorama frame must have a full-size cel for each layer");
  }
  options.layers?.forEach((layer, index) => {
    if (layer.linkAll && frames.some((frame) => frame[index]!.data.some((c, pixel) => c !== frames[0]![index]!.data[pixel]))) {
      throw new Error(`Linked layer ${index} must contain identical pixels in every frame`);
    }
  });
  const metadata = {
    pixelorama_version: "v1.2.3", pxo_version: 5, size_x: first.width, size_y: first.height, color_mode: 5,
    layers: layers.map((name, i) => ({ name, type: 0, visible: options.layers?.[i]?.visible ?? true, locked: options.layers?.[i]?.locked ?? false, opacity: 1, blend_mode: 0, parent: -1,
      new_cels_linked: options.layers?.[i]?.linkAll ?? false,
      ...(options.layers?.[i]?.linkAll ? { link_sets: [{ cels: frames.map((_, n) => n), hue: 0.5 }] } : {}),
    })),
    frames: frames.map((f) => ({ cels: f.map(() => ({ opacity: 1, z_index: 0 })), duration: 1 })),
    tags: tags.map((t) => ({ ...t, color: "d6a875" })), fps: 8,
    current_frame: 0, current_layer: options.currentLayer ?? 0, license: "MIT", author_display_name: "sci-ts contributors",
    user_data: options.userData ?? "The Stopped Clocks - original art proof. Export at 1x with the project palette.",
  };
  const files: [string, Uint8Array][] = [
    ["mimetype", Buffer.from("application/x-pixelorama")],
    ["data.json", Buffer.from(JSON.stringify(metadata))],
    ["preview.png", first.png(palette)],
  ];
  frames.forEach((frame, i) => frame.forEach((cel, j) => files.push([`image_data/frames/${i + 1}/layer_${j + 1}`, cel.rgba(palette).data])));
  return zip(files);
}
