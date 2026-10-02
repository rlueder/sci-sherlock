/** Export the approved 12px bitmap family without changing its ink or metrics. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { decodePng } from 'sci2-ts/png';
import { Pixels } from '../../source/pixels.ts';

const root = 'art/studies/typography-r29/';
const palette: string[] = JSON.parse(readFileSync('art/palette.json', 'utf8'));
const styles = { regular: 'R', bold: 'B', italic: 'I', 'bold-italic': 'BI' } as const;
type Style = keyof typeof styles;
type Glyph = { code: number; rect: number[]; bearingX: number; top: number; advance: number; rows: string[] };
const faces = {} as Record<Style, { png: Pixels; glyphs: Glyph[] }>;
mkdirSync(root + 'export', { recursive: true });
let verified = 0;
for (const [style, suffix] of Object.entries(styles) as [Style, string][]) {
  const source = `source/upstream/ncen${suffix}12.bdf`;
  const text = readFileSync(root + source, 'utf8');
  const ascent = Number(text.match(/^FONT_ASCENT (\d+)/m)![1]);
  const descent = Number(text.match(/^FONT_DESCENT (\d+)/m)![1]);
  assert.equal(ascent, 11); assert.equal(descent, 3);
  // The atlas cell is storage only. Drawing uses the recorded BBX and DWIDTH.
  const cell = [16, 14], columns = 16;
  const png = new Pixels(columns * cell[0]!, 6 * cell[1]!);
  const glyphs: Glyph[] = [];
  for (const block of text.split('STARTCHAR ').slice(1)) {
    const code = Number(block.match(/^ENCODING (-?\d+)/m)![1]);
    if (code < 32 || code > 126) continue;
    const [w, h, x, y] = block.match(/^BBX (.+)/m)![1]!.split(/\s+/).map(Number) as [number, number, number, number];
    const advance = Number(block.match(/^DWIDTH (\d+)/m)![1]);
    const hex = block.split('BITMAP\n')[1]!.split('\nENDCHAR')[0]!.trim().split('\n');
    const rows = hex.slice(0, h).map(row => BigInt('0x' + row).toString(2).padStart(row.length * 4, '0').slice(0, w));
    const i = code - 32, sx = i % columns * 16, sy = Math.floor(i / columns) * 14;
    assert.ok(w <= 16 && h <= 14);
    assert.ok(ascent - y - h >= 0 && ascent - y <= 14);
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if (rows[yy]![xx] === '1') png.dot(sx + xx, sy + yy, 2);
    glyphs.push({ code, rect: [sx, sy, w, h], bearingX: x, top: ascent - y - h, advance, rows });
  }
  glyphs.sort((a, b) => a.code - b.code);
  assert.equal(glyphs.length, 95);
  writeFileSync(root + `export/${style}.png`, png.png(palette));
  const decoded = decodePng(readFileSync(root + `export/${style}.png`));
  for (const g of glyphs) {
    const [sx, sy, w, h] = g.rect as [number, number, number, number];
    for (let y = 0; y < 14; y++) for (let x = 0; x < 16; x++) {
      const expected = x < w && y < h && g.rows[y]![x] === '1';
      assert.equal(decoded.data[((sy + y) * decoded.width + sx + x) * 4 + 3], expected ? 255 : 0);
    }
    verified++;
  }
  writeFileSync(root + `export/${style}.json`, JSON.stringify({
    schema: 'sci-sherlock-bitmap-font-metrics-v1', family: 'New Century Schoolbook', style,
    pixelSize: 12, ascent, descent, lineHeight: 14, first: 32, last: 126,
    source: '../' + source, sourceSha256: createHash('sha256').update(text).digest('hex'),
    license: '../source/upstream/COPYING', atlas: `${style}.png`, cell, columns,
    glyphs: glyphs.map(({ rows, ...g }) => g),
  }, null, 2) + '\n');
  faces[style] = { png, glyphs };
}

function draw(p: Pixels, style: Style, text: string, x: number, top: number) {
  for (const ch of text) {
    const g = faces[style].glyphs[ch.charCodeAt(0) - 32];
    assert.ok(g, `unsupported character ${ch}`);
    const [sx, sy, w, h] = g.rect as [number, number, number, number];
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      const c = faces[style].png.data[(sy + yy) * faces[style].png.width + sx + xx]!;
      if (c >= 0) p.dot(x + g.bearingX + xx, top + g.top + yy, c);
    }
    x += g.advance;
  }
  return x;
}
function saveProof(name: string, p: Pixels) {
  writeFileSync(root + `review/${name}-native.png`, p.png(palette));
  const large = new Pixels(p.width * 3, p.height * 3);
  for (let y = 0; y < p.height; y++) for (let x = 0; x < p.width; x++) large.rect(x * 3, y * 3, 3, 3, p.data[y * p.width + x]!);
  writeFileSync(root + `review/${name}.png`, large.png(palette));
}
const proof = new Pixels(320,200,18);
proof.rect(8,8,304,184,29); proof.rect(10,10,300,180,62);
draw(proof,'bold','New Century Schoolbook / 12px',20,18);
draw(proof,'regular','I am in my armchair, with yesterday\'s',20,45);
let x = draw(proof,'italic','Standard',20,61);
draw(proof,'regular',', read twice over.',x,61);
x = draw(proof,'bold','Watson: ',20,90);
draw(proof,'regular','The boy is frightened half',x,90);
draw(proof,'regular','out of his wits. Hear him out, Holmes.',20,106);
draw(proof,'bold-italic','Hear him out, Holmes.',20,138);
draw(proof,'regular','Ag jpy 0123456789 !? (M W) "quotes"',20,164);
saveProof('selected-dialogue',proof);
const all = new Pixels(320,360,62);
let top = 8;
for (const style of Object.keys(styles) as Style[]) {
  draw(all,'bold',style,12,top); top += 17;
  for (let code = 32; code <= 126; code += 24) {
    draw(all,style,Array.from({length:Math.min(24,127-code)},(_,i)=>String.fromCharCode(code+i)).join(''),12,top);
    top += 14;
  }
  top += 12;
}
saveProof('selected-glyphs',all);
writeFileSync(root+'guides/selected-validation.json',JSON.stringify({faces:4,glyphs:verified,atlasPixelsMatchSource:true,pixelSize:12,ascent:11,descent:3,lineHeight:14,sourceMetricsPreserved:true,productionRegistered:false},null,2)+'\n');
console.log(`${verified} glyphs exported and decoded PNG pixels verified; all four original faces and metrics preserved.`);
