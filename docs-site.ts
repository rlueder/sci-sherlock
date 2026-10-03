/**
 * The documentation site, in out/site/docs: every Markdown file about how the game is made
 * (the README, docs/, the art studies, references and production notes) as pages with a
 * sidebar and a search, the art studies as a timeline, and each study's review page with the
 * files it shows. Links between Markdown files become links between pages; links to files the
 * site doesn't carry (sources, Blender and Pixelorama projects, scripts) go to GitHub.
 *
 * The study GIFs are stored with a simple encoder and some are 15 MB. With ffmpeg on the path
 * they're re-encoded on the exact colours they use (checked to decode to the same frames, or
 * the original is kept); without it, GIFs over 3 MB are left out and linked on GitHub.
 * The Pages workflow installs ffmpeg.
 *
 *   pnpm docs            (also part of pnpm site)
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, posix, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Marked, type Tokens } from "marked";

const REPO = "https://github.com/rlueder/sci-sherlock";
const root = fileURLToPath(new URL(".", import.meta.url));

/** Files a review page or a page can show: copied to files/, at their path in the repository. */
const WEB = new Set([".png", ".gif", ".jpg", ".jpeg", ".webp", ".svg", ".json", ".html", ".css", ".txt"]);
/** Folders of an art study that are published whole: review pages build these paths in code. */
const SHOWN = new Set(["export", "review", "guides"]);
/** Where art lives: each folder under these is a study, reference or production pass. */
const ART = ["art/studies", "art/reference", "art/production", "art/approved"];
const BIG_GIF = 3_000_000;

// ---------------------------------------------------------------------------------------------
// What's there

interface Page {
  source: string;     // its Markdown, from the repository root
  slug: string;       // its file in docs/, without .html
  title: string;
  markdown: string;
}

const walk = (dir: string): string[] =>
  existsSync(join(root, dir))
    ? readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? (e.name === "node_modules" ? [] : walk(posix.join(dir, e.name))) : [posix.join(dir, e.name)])
    : [];

/** The page a Markdown file becomes. */
function slugFor(source: string): string {
  if (source === "README.md") return "overview";
  if (source === "art/README.md") return "art-sources";
  const m = /^art\/(studies|reference|production|approved)\/([^/]+)\/(.*)\.md$/.exec(source);
  if (m) {
    const [, kind, name, rest] = m;
    const prefix = kind === "studies" ? "study" : kind;
    return rest === "README" ? `${prefix}-${name}` : `${prefix}-${name}-${rest!.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  }
  if (source.startsWith("docs/")) return source.slice(5, -3).replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  return source.slice(0, -3).replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

const markdownFiles = [
  "README.md",
  ...walk("docs").filter((f) => f.endsWith(".md") && !f.startsWith("docs/images/")),
  "art/README.md",
  ...ART.flatMap(walk).filter((f) => f.endsWith(".md") && !/\/(source|generated)\//.test(f)),
].filter((f) => existsSync(join(root, f)));

const pages = new Map<string, Page>();
for (const source of markdownFiles) {
  const markdown = readFileSync(join(root, source), "utf8");
  const title = (/^#\s+(.+)$/m.exec(markdown)?.[1] ?? basename(dirname(source))).replace(/[*_`]/g, "").trim();
  pages.set(source, { source, slug: slugFor(source), title, markdown });
}

// ---------------------------------------------------------------------------------------------
// The art studies, in the order they were made

interface Study {
  name: string;
  page: Page;
  round: number;      // r-rounds after the early v-versions
  group: string;
  review: boolean;    // it has an interactive review page
  thumb?: string;     // an image from the repository root
  summary: string;
}

const GROUPS: [string, RegExp, string][] = [
  ["Holmes", /^(holmes|reach)/, "The character model, his poses, idles and walk."],
  ["Rooms", /^(workshop|clock|baker-street|221b|remaining)/, "The workshop, 221B, Baker Street and the cards."],
  ["Portraits", /^portraits/, "The speaking portraits and their frames."],
  ["Interface and type", /^(interface|typography)/, "Cursors, the toolbar, the case, the menu and the fonts."],
];

/** Plain text of Markdown, for summaries and the search. */
const plain = (md: string) =>
  md.replace(/```[\s\S]*?```/g, " ").replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ").replace(/^#+\s.*$/gm, " ").replace(/[*_`>|#]/g, " ").replace(/\s+/g, " ").trim();

function firstParagraph(md: string): string {
  for (const block of md.split(/\n\s*\n/)) {
    const b = block.trim();
    if (!b || /^(#|\||```|!\[|<|Open\b|\[Open)/.test(b)) continue;
    const text = plain(b);
    if (text.length < 40) continue;
    return text.length > 260 ? `${text.slice(0, 257).replace(/\s+\S*$/, "").replace(/[.,;:]+$/, "")}…` : text;
  }
  return "";
}

const images = (md: string, from: string) =>
  [...md.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g), ...md.matchAll(/<img[^>]+src="([^"]+)"/g)]
    .map((m) => posix.normalize(posix.join(posix.dirname(from), m[1]!.split("#")[0]!)))
    .filter((p) => /\.(png|gif|jpe?g|webp)$/i.test(p) && existsSync(join(root, p)));

const studies: Study[] = [];
for (const dir of readdirSync(join(root, "art/studies")).sort()) {
  const page = pages.get(`art/studies/${dir}/README.md`);
  if (!page) continue;
  const r = /-r(\d+)$/.exec(dir), v = /-v(\d+)$/.exec(dir);
  const reviewImages = walk(`art/studies/${dir}/review`).filter((f) => /\.png$/i.test(f)).sort();
  studies.push({
    name: dir,
    page,
    round: r ? Number(r[1]) : v ? Number(v[1]) / 10 : 999,
    group: GROUPS.find(([, re]) => re.test(dir))?.[0] ?? "Other",
    review: existsSync(join(root, `art/studies/${dir}/index.html`)),
    thumb: images(page.markdown, page.source)[0] ?? reviewImages[0] ?? walk(`art/studies/${dir}/export`).find((f) => f.endsWith(".png")),
    summary: firstParagraph(page.markdown),
  });
}
studies.sort((a, b) => a.round - b.round || a.name.localeCompare(b.name));
const roundName = (s: Study) => (/-([rv]\d+)$/.exec(s.name)?.[1] ?? "");

// ---------------------------------------------------------------------------------------------
// The sidebar

interface NavItem { label: string; href: string }
const page = (source: string, label?: string): NavItem | undefined => {
  const p = pages.get(source);
  return p && { label: label ?? p.title, href: `${p.slug}.html` };
};
const nav: [string, (NavItem | undefined)[]][] = [
  ["The game", [
    { label: "Start here", href: "index.html" },
    page("README.md", "How it's made"),
    page("docs/teaser.md", "The teaser: story and puzzles"),
    page("docs/visual-spec.md", "What the teaser needs"),
  ]],
  ["Making the art", [
    page("docs/art-workflow.md", "Graphics workflow"),
    page("docs/art-learning-guide.md", "Learning the art pipeline"),
    page("docs/animation-workflow.md", "Animation workflow"),
    page("docs/art-research.md", "References and tools"),
    page("art/README.md", "Art sources"),
    page("docs/holmes-costume.md", "Holmes: costume and pipe"),
  ]],
  ["Briefs and handoffs", [
    page("docs/room-camera-brief.md", "Room camera brief"),
    page("docs/room-planes-brief.md", "Room planes brief"),
    page("docs/room-followups-brief.md", "Room follow-ups brief"),
    page("docs/portrait-expressions-brief.md", "Portrait expressions brief"),
    page("docs/art-interface-implementation.md", "Interface handoff"),
    page("docs/art-delivery-status.md", "Art delivery status"),
    page("docs/templates/art-study.md", "Art study template"),
  ]],
  ["Art studies", [
    { label: "All studies, in order", href: "studies.html" },
    ...GROUPS.map(([g]) => ({ label: g, href: `studies.html#${anchor(g)}` })),
  ]],
  ["Masters and production", [
    ...[...pages.values()].filter((p) => /^art\/(reference|production|approved)\//.test(p.source) && p.source.endsWith("/README.md")).map((p) => ({ label: p.title, href: `${p.slug}.html` })),
  ]],
  ["Elsewhere", [
    { label: "Play the game", href: "../" },
    { label: "The engine: sci-ts", href: "https://github.com/rlueder/sci-ts" },
    { label: "Source on GitHub", href: REPO },
  ]],
];

function anchor(text: string, seen?: Map<string, number>): string {
  let id = text.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;|&#\d+;/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s/g, "-");
  if (seen) {
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n) id = `${id}-${n}`;
  }
  return id;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---------------------------------------------------------------------------------------------
// Links: pages for Markdown, files/ for what's published, GitHub for everything else

const published = new Set<string>();

function linkFor(target: string, from: string): string {
  if (/^([a-z]+:|#|\/\/)/i.test(target)) return target;
  const [path, hash] = target.split("#") as [string, string | undefined];
  const tail = hash ? `#${hash}` : "";
  if (!path) return tail;
  const repoPath = posix.normalize(posix.join(posix.dirname(from), decodeURI(path))).replace(/\/$/, "");
  if (repoPath.startsWith("..")) return target;
  const p = pages.get(repoPath) ?? pages.get(`${repoPath}/README.md`);
  if (p) return `${p.slug}.html${tail}`;
  if (published.has(repoPath)) return `files/${encodeURI(repoPath)}${tail}`;
  const full = join(root, repoPath);
  if (existsSync(full)) return `${REPO}/${statSync(full).isDirectory() ? "tree" : "blob"}/main/${encodeURI(repoPath)}${tail}`;
  return target;
}

/** Points a page's links and images where they are on the site. */
const relink = (html: string, from: string) =>
  html.replace(/(href|src)="([^"]+)"/g, (_, attr: string, url: string) => `${attr}="${esc(linkFor(url.replace(/&amp;/g, "&"), from))}"`);

// ---------------------------------------------------------------------------------------------
// Rendering

function render(p: Page): { html: string; headings: { depth: number; id: string; text: string }[] } {
  const seen = new Map<string, number>();
  const headings: { depth: number; id: string; text: string }[] = [];
  const md = new Marked({ gfm: true });
  md.use({
    renderer: {
      heading(this: { parser: { parseInline: (t: Tokens.Heading["tokens"]) => string } }, { tokens, depth }: Tokens.Heading) {
        const inner = this.parser.parseInline(tokens);
        const id = anchor(inner, seen);
        if (depth > 1 && depth < 4) headings.push({ depth, id, text: inner.replace(/<[^>]+>/g, "") }); // still escaped HTML
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${inner}</h${depth}>\n`;
      },
    },
  });
  // Wide tables scroll inside the page instead of widening it.
  const html = (md.parse(p.markdown) as string).replace(/<table>/g, '<div class="table"><table>').replace(/<\/table>/g, "</table></div>");
  return { html: relink(html, p.source), headings };
}

const CSS = `
:root{color-scheme:dark;--bg:#141820;--panel:#1b2029;--line:#34434e;--ink:#d7c8ad;--dim:#9baaa5;--link:#d6a875;--hi:#edd2a1;--code:#10141a}
*{box-sizing:border-box}
html{scroll-padding-top:16px}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 Georgia,serif}
a{color:var(--link)}a:hover{color:var(--hi)}
a:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid #fff0cc;outline-offset:2px}
.layout{display:grid;grid-template-columns:270px minmax(0,1fr);min-height:100vh}
.side{position:sticky;top:0;height:100vh;overflow:auto;padding:20px 18px 32px;border-right:1px solid var(--line);background:var(--panel);font:14px/1.5 system-ui,sans-serif}
.side .home{display:block;margin-bottom:14px;color:var(--hi);text-decoration:none;font:18px/1.3 Georgia,serif}
.side .home small{display:block;color:var(--dim);font:11px/1.6 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase}
.side h2{margin:18px 0 4px;color:var(--dim);font:600 11px/1.6 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}
.side ul{list-style:none;margin:0;padding:0}
.side li a{display:block;padding:3px 8px;margin:0 -8px;border-radius:4px;color:var(--ink);text-decoration:none}
.side li a:hover{background:#262d38}
.side li a[aria-current=page]{background:#2c3442;color:var(--hi)}
.search{position:relative}
.search input{width:100%;padding:7px 10px;border:1px solid var(--line);border-radius:5px;background:var(--bg);color:var(--ink);font:14px system-ui,sans-serif}
.results{list-style:none;margin:8px 0 0;padding:0}
.results li a{display:block;padding:6px 8px;margin:0 -8px;border-radius:4px;color:var(--ink);text-decoration:none}
.results li a:hover,.results li a:focus{background:#262d38}
.results small{display:block;color:var(--dim)}
.menu{display:none}
main{padding:28px clamp(16px,4vw,48px) 64px;max-width:960px;width:100%}
.crumbs{color:var(--dim);font:13px system-ui,sans-serif;margin-bottom:6px}
.crumbs a{color:var(--dim)}
h1,h2,h3,h4{font-weight:400;line-height:1.25;color:var(--hi);position:relative}
h1{font-size:clamp(28px,4vw,38px);margin:0 0 16px}
h2{font-size:26px;margin:40px 0 12px;padding-top:8px;border-top:1px solid var(--line)}
h3{font-size:21px;margin:28px 0 8px}
.anchor{position:absolute;left:-1em;width:1em;color:var(--line);text-decoration:none;opacity:0}
h1:hover .anchor,h2:hover .anchor,h3:hover .anchor,h4:hover .anchor{opacity:1}
img{max-width:100%;height:auto;image-rendering:pixelated;vertical-align:middle}
p img,li img{background:#0d1015}
code{font:13.5px ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--code);padding:1px 5px;border-radius:3px}
pre{background:var(--code);border:1px solid var(--line);border-radius:6px;padding:12px 14px;overflow:auto}
pre code{background:none;padding:0}
blockquote{margin:16px 0;padding:2px 16px;border-left:3px solid #64503a;color:#c6bca6}
.table{overflow-x:auto;margin:16px 0}
table{border-collapse:collapse;font:14px/1.5 system-ui,sans-serif}
th,td{border:1px solid var(--line);padding:6px 10px;text-align:left;vertical-align:top}
th{background:var(--panel);color:var(--hi)}
hr{border:0;border-top:1px solid var(--line);margin:32px 0}
.toc{float:right;width:240px;margin:0 0 16px 24px;padding:10px 14px;border:1px solid var(--line);border-radius:6px;background:var(--panel);font:13px/1.5 system-ui,sans-serif}
.toc strong{display:block;color:var(--dim);font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}
.toc ul{list-style:none;margin:0;padding:0}.toc li.d3{padding-left:12px}
.toc a{color:var(--ink);text-decoration:none}.toc a:hover{color:var(--hi)}
.callout{margin:0 0 24px;padding:12px 16px;border:1px solid #64503a;border-radius:6px;background:#1f1b18;font:14px/1.6 system-ui,sans-serif}
.callout a{font-weight:600}
.pager{display:flex;justify-content:space-between;gap:16px;margin-top:48px;padding-top:16px;border-top:1px solid var(--line);font:14px system-ui,sans-serif}
.pager a{text-decoration:none}.pager small{display:block;color:var(--dim)}
.pager .next{text-align:right;margin-left:auto}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin:16px 0 8px}
.card{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--panel);color:var(--ink);text-decoration:none}
.card:hover{border-color:#64503a;color:var(--ink)}
.card .thumb{aspect-ratio:16/10;background:#0d1015 center/contain no-repeat;image-rendering:pixelated;border-bottom:1px solid var(--line)}
.card .body{padding:10px 14px 14px}
.card .round{color:var(--dim);font:600 11px/1.6 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}
.card h3{margin:2px 0 6px;font-size:18px;border:0;padding:0}
.card p{margin:0;font:13px/1.5 system-ui,sans-serif;color:#c3bba8}
.guide{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin:12px 0}
.guide a{display:block;padding:14px 16px;border:1px solid var(--line);border-radius:8px;background:var(--panel);text-decoration:none;color:var(--ink)}
.guide a:hover{border-color:#64503a}
.guide strong{display:block;color:var(--hi);font-weight:400;font-size:18px}
.guide span{font:13px/1.5 system-ui,sans-serif;color:#c3bba8}
.order{font:14px/1.5 system-ui,sans-serif}
.order td:first-child{white-space:nowrap;color:var(--dim)}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.gallery figure{margin:0;border:1px solid var(--line);border-radius:6px;background:#0d1015;overflow:hidden}
.gallery img{display:block;width:100%;aspect-ratio:4/3;object-fit:contain}
.gallery figcaption{padding:6px 10px;font:12px system-ui,sans-serif;color:var(--dim);word-break:break-all}
@media (max-width:900px){
 .layout{display:block}
 .side{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}
 .side nav{display:none}.side.open nav{display:block}
 .menu{display:inline-block;margin-top:8px;padding:6px 12px;border:1px solid var(--line);border-radius:5px;background:var(--bg);color:var(--ink);font:14px system-ui,sans-serif}
 .toc{float:none;width:auto;margin:0 0 20px}
 .anchor{display:none}
}`;

const SCRIPT = `
const side=document.querySelector('.side'),menu=document.querySelector('.menu');
menu?.addEventListener('click',()=>{const open=side.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
const input=document.querySelector('.search input'),list=document.querySelector('.results');let index;
input?.addEventListener('input',async()=>{
  const q=input.value.trim().toLowerCase();list.replaceChildren();
  if(q.length<2){side.querySelector('nav').hidden=false;return;}
  side.querySelector('nav').hidden=true;
  index??=await fetch(input.dataset.index).then(r=>r.json());
  const words=q.split(/\\s+/),hits=index.filter(p=>words.every(w=>(p.title+' '+p.text).toLowerCase().includes(w)))
    .sort((a,b)=>Number(b.title.toLowerCase().includes(q))-Number(a.title.toLowerCase().includes(q))).slice(0,30);
  for(const p of hits){const at=p.text.toLowerCase().indexOf(words[0]),li=document.createElement('li'),a=document.createElement('a'),s=document.createElement('small');
    a.href=p.url;a.textContent=p.title;s.textContent=at<0?p.text.slice(0,90):'…'+p.text.slice(Math.max(0,at-40),at+70)+'…';a.append(s);li.append(a);list.append(li);}
  if(!hits.length){const li=document.createElement('li');li.textContent='Nothing found.';list.append(li);}
});`;

function shell(opts: { title: string; slug: string; body: string; crumbs?: string; description?: string }): string {
  const navHtml = nav.map(([heading, items]) => {
    const links = items.filter((i): i is NavItem => !!i)
      .map((i) => `<li><a href="${esc(i.href)}"${i.href === `${opts.slug}.html` ? ' aria-current="page"' : ""}>${esc(i.label)}</a></li>`).join("");
    return links ? `<h2>${esc(heading)}</h2><ul>${links}</ul>` : "";
  }).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${opts.slug === "index" ? "" : `${esc(opts.title)} · `}How it's made · The Case of the Clerkenwell Clocks</title>
${opts.description ? `<meta name="description" content="${esc(opts.description)}">` : ""}
<style>${CSS}</style>
</head>
<body>
<div class="layout">
<aside class="side">
<a class="home" href="index.html"><small>How it's made</small>The Case of the Clerkenwell Clocks</a>
<div class="search"><input type="search" placeholder="Search the notes" aria-label="Search the notes" data-index="search.json"><ul class="results" aria-live="polite"></ul></div>
<button class="menu" aria-expanded="false">Contents</button>
<nav aria-label="Contents">${navHtml}</nav>
</aside>
<main>
${opts.crumbs ? `<div class="crumbs">${opts.crumbs}</div>` : ""}
${opts.body}
</main>
</div>
<script>${SCRIPT}</script>
</body>
</html>
`;
}

const toc = (headings: { depth: number; id: string; text: string }[]) =>
  headings.length < 3 ? "" :
    `<nav class="toc" aria-label="On this page"><strong>On this page</strong><ul>${headings.map((h) => `<li class="d${h.depth}"><a href="#${h.id}">${h.text}</a></li>`).join("")}</ul></nav>`;

/** Splits off the page's own h1, so the table of contents can go beside the text under it. */
const splitTitle = (html: string) => {
  const m = /^\s*<h1[^>]*>[\s\S]*?<\/h1>\n?/.exec(html);
  return m ? [m[0], html.slice(m[0].length)] as const : ["", html] as const;
};

// ---------------------------------------------------------------------------------------------
// GIFs

function hasFfmpeg(): boolean {
  return spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
}

function ffmpeg(args: string[], input?: Buffer): Buffer | undefined {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", ...args], { input, maxBuffer: 1 << 30 });
  return r.status === 0 ? r.stdout : undefined;
}

const frames = (file: string) => ffmpeg(["-ignore_loop", "1", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgba", "-"]);
const timing = (file: string) =>
  spawnSync("ffprobe", ["-v", "error", "-show_entries", "packet=duration_time", "-of", "csv=p=0", file], { encoding: "utf8" }).stdout;

/** The GIF re-encoded on its own colours, if that decodes to the same frames and is smaller. */
function smallerGif(file: string, cacheDir: string): string | undefined {
  const data = readFileSync(file);
  const cached = join(cacheDir, `${createHash("sha1").update(data).digest("hex")}.gif`);
  if (existsSync(cached)) return statSync(cached).size < data.length ? cached : undefined;
  const raw = frames(file);
  if (!raw) return undefined;
  const colours = new Set<number>();
  for (let i = 0; i < raw.length && colours.size <= 256; i += 4) colours.add(raw.readUInt32BE(i));
  if (colours.size > 256) return undefined;
  const swatch = Buffer.alloc(256 * 4);
  const list = [...colours];
  for (let i = 0; i < 256; i++) swatch.writeUInt32BE(list[Math.min(i, list.length - 1)]!, i * 4);
  const swatchFile = `${cached}.palette.raw`;
  writeFileSync(swatchFile, swatch);
  const temp = `${cached}.tmp.gif`;
  ffmpeg(["-y", "-ignore_loop", "1", "-i", file, "-f", "rawvideo", "-pix_fmt", "rgba", "-s", "16x16", "-i", swatchFile,
    "-filter_complex", "[0:v][1:v]paletteuse=dither=none", "-loop", "0", temp]);
  rmSync(swatchFile, { force: true });
  const same = existsSync(temp) && frames(temp)?.equals(raw) && timing(temp) === timing(file);
  if (!same) {
    rmSync(temp, { force: true });
    copyFileSync(file, cached);     // remembered: keep the original
    return undefined;
  }
  writeFileSync(cached, readFileSync(temp));
  rmSync(temp, { force: true });
  return statSync(cached).size < data.length ? cached : undefined;
}

// ---------------------------------------------------------------------------------------------
// The build

export function buildDocs(out: string): { pages: number; files: number; bytes: number } {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const cacheDir = resolve(root, "out/docs-cache");
  mkdirSync(cacheDir, { recursive: true });
  const ff = hasFfmpeg();
  if (!ff) console.warn("docs: no ffmpeg, so GIFs over 3 MB are linked on GitHub instead of published");

  // What's published: images the Markdown shows; each art folder's review page and the files
  // it uses (its shown folders whole, and any other file its page or notes name).
  const wanted = new Set<string>();
  for (const p of pages.values()) for (const img of images(p.markdown, p.source)) wanted.add(img);
  for (const f of walk("docs/images")) if (WEB.has(extname(f))) wanted.add(f);
  for (const base of ART) {
    for (const dir of existsSync(join(root, base)) ? readdirSync(join(root, base)) : []) {
      const folder = `${base}/${dir}`;
      if (!statSync(join(root, folder)).isDirectory()) continue;
      for (const f of walk(folder)) {
        const rel = f.slice(folder.length + 1), top = rel.split("/")[0]!;
        if (!WEB.has(extname(f))) continue;
        if (!rel.includes("/") || SHOWN.has(top)) wanted.add(f);
      }
      // Files a review page names outside those folders (generated masters, say).
      for (const html of walk(folder).filter((f) => f.endsWith(".html"))) {
        const text = readFileSync(join(root, html), "utf8");
        for (const m of text.matchAll(/["'(]([\w./-]+\.(?:png|gif|jpe?g|webp|svg|json|txt))["')]/g)) {
          const p = posix.normalize(posix.join(posix.dirname(html), m[1]!));
          if (!p.startsWith("..") && existsSync(join(root, p))) wanted.add(p);
        }
      }
    }
  }
  wanted.add("art/titles/heading.png");

  let bytes = 0;
  const skipped: string[] = [];
  for (const f of [...wanted].sort()) {
    const src = join(root, f);
    if (!existsSync(src) || statSync(src).isDirectory()) continue;
    let from = src;
    if (f.endsWith(".gif")) {
      const small = ff ? smallerGif(src, cacheDir) : undefined;
      if (small) from = small;
      else if (!ff && statSync(src).size > BIG_GIF) { skipped.push(f); continue; }
    }
    published.add(f);
    const dest = join(out, "files", f);
    mkdirSync(dirname(dest), { recursive: true });
    if (f.endsWith(".html")) continue;      // written below, with its links pointed at the site
    copyFileSync(from, dest);
    bytes += statSync(dest).size;
  }

  // Review pages: links to notes become links to pages, links to unpublished files go to GitHub,
  // and a line at the top leads back to the notes.
  for (const f of published) {
    if (!f.endsWith(".html")) continue;
    const depth = f.split("/").length;
    const up = "../".repeat(depth);
    let html = readFileSync(join(root, f), "utf8").replace(/href="([^"]+)"/g, (whole, url: string) => {
      const to = linkFor(url, f);
      if (to === url || to.startsWith("files/")) return whole;
      return `href="${esc(/^https?:/.test(to) ? to : up + to)}"`;
    });
    const notes = pages.get(posix.join(posix.dirname(f), "README.md"));
    const back = `<p style="font:13px system-ui,sans-serif;margin:0 0 12px"><a href="${up}${notes ? `${notes.slug}.html` : "index.html"}" style="color:#d6a875">← ${notes ? esc(notes.title) : "How it's made"}</a></p>`;
    html = /<h1/.test(html) ? html.replace(/<h1/, `${back}<h1`) : html.replace(/<body[^>]*>/, (b) => b + back);
    const dest = join(out, "files", f);
    writeFileSync(dest, html);
    bytes += statSync(dest).size;
  }

  // The pages.
  const search: { title: string; url: string; text: string }[] = [];
  const studyBySource = new Map(studies.map((s) => [s.page.source, s]));
  for (const p of pages.values()) {
    const { html, headings } = render(p);
    const [h1, rest] = splitTitle(html);
    const study = studyBySource.get(p.source);
    let top = "", bottom = "", crumbs = "";
    if (study) {
      const i = studies.indexOf(study), prev = studies[i - 1], next = studies[i + 1];
      crumbs = `<a href="studies.html">Art studies</a> · <a href="studies.html#${anchor(study.group)}">${esc(study.group)}</a> · ${esc(roundName(study))}`;
      if (study.review) {
        top = `<div class="callout">This study has an interactive review page: <a href="files/art/studies/${study.name}/index.html">open the ${esc(roundName(study))} review</a>. It plays the animations and shows the guides and proofs at full size.</div>`;
      }
      const shown = new Set(images(p.markdown, p.source));
      const gallery = walk(`art/studies/${study.name}/review`)
        .filter((f) => /\.(png|gif)$/i.test(f) && published.has(f) && !shown.has(f)).sort();
      if (gallery.length) {
        bottom += `<h2 id="review-images"><a class="anchor" href="#review-images" aria-hidden="true">#</a>Review images</h2>
<div class="gallery">${gallery.map((f) => `<figure><a href="files/${encodeURI(f)}"><img loading="lazy" src="files/${encodeURI(f)}" alt=""></a><figcaption>${esc(basename(f))}</figcaption></figure>`).join("")}</div>`;
      }
      const missing = skipped.filter((f) => f.startsWith(`art/studies/${study.name}/`));
      if (missing.length) bottom += `<p>Too large to publish here, on GitHub: ${missing.map((f) => `<a href="${REPO}/blob/main/${encodeURI(f)}">${esc(basename(f))}</a>`).join(", ")}.</p>`;
      bottom += `<nav class="pager">${prev ? `<a class="prev" href="${prev.page.slug}.html"><small>← Earlier: ${esc(roundName(prev))}</small>${esc(prev.page.title)}</a>` : ""}${next ? `<a class="next" href="${next.page.slug}.html"><small>Later: ${esc(roundName(next))} →</small>${esc(next.page.title)}</a>` : ""}</nav>`;
    }
    bottom += `<p class="crumbs" style="margin-top:32px"><a href="${REPO}/blob/main/${encodeURI(p.source)}">${esc(p.source)} on GitHub</a></p>`;
    const body = `${h1}${top}${toc(headings)}${rest}${bottom}`;
    writeFileSync(join(out, `${p.slug}.html`), shell({ title: p.title, slug: p.slug, body, crumbs, description: firstParagraph(p.markdown) }));
    search.push({ title: p.title, url: `${p.slug}.html`, text: plain(p.markdown) });
  }

  // The studies, by subject and then all in order.
  const card = (s: Study) => `<a class="card" href="${s.page.slug}.html">
<div class="thumb"${s.thumb && published.has(s.thumb) ? ` style="background-image:url('files/${encodeURI(s.thumb)}')"` : ""}></div>
<div class="body"><span class="round">${esc(roundName(s))}${s.review ? " · review page" : ""}</span><h3>${esc(s.page.title.replace(/\s*[—-]\s*[rv]\d+$/, ""))}</h3><p>${esc(s.summary)}</p></div></a>`;
  const studiesBody = `<h1>Art studies</h1>
<p>Every piece of art in the game went through studies: rounds of drawing, review and correction, each kept with its notes, its guides and what was rejected. The round number (r5, r12, r30) is the order they were made in. Many rounds have a review page that plays the animation or shows the proofs at full size.</p>
${GROUPS.map(([g, , blurb]) => {
    const list = studies.filter((s) => s.group === g);
    return list.length ? `<h2 id="${anchor(g)}">${esc(g)}</h2><p>${esc(blurb)}</p><div class="cards">${list.map(card).join("")}</div>` : "";
  }).join("")}
<h2 id="in-order">All rounds, in order</h2>
<div class="table"><table class="order"><thead><tr><th>Round</th><th>Study</th><th>Subject</th></tr></thead><tbody>
${studies.map((s) => `<tr><td>${esc(roundName(s))}</td><td><a href="${s.page.slug}.html">${esc(s.page.title)}</a></td><td>${esc(s.group)}</td></tr>`).join("\n")}
</tbody></table></div>`;
  writeFileSync(join(out, "studies.html"), shell({ title: "Art studies", slug: "studies", body: studiesBody }));
  search.push({ title: "Art studies", url: "studies.html", text: studies.map((s) => `${s.page.title} ${s.summary}`).join(" ") });

  // The start page.
  const guide = (source: string, label: string, blurb: string) => {
    const p = pages.get(source);
    return p ? `<a href="${p.slug}.html"><strong>${esc(label)}</strong><span>${esc(blurb)}</span></a>` : "";
  };
  const latest = studies.slice(-6).reverse();
  const home = `<h1>How it's made</h1>
<p><a href="../"><img src="files/art/titles/heading.png" alt="The Case of the Clerkenwell Clocks" width="480" height="96"></a></p>
<p>The Case of the Clerkenwell Clocks is a short Sherlock Holmes adventure in the style of Sierra's early-1990s games: 320 × 200 pixel art, a point-and-click interface, and a talking cast. It runs in the browser on <a href="https://github.com/rlueder/sci-ts">sci-ts</a>, a reimplementation of Sierra's SCI engine in TypeScript.</p>
<p>These pages collect the notes written while making it: what the teaser needs, how the art is drawn and checked, the briefs sent to the artist, and every art study with what was kept and what was thrown away. <a href="../">Play the game</a> first if you haven't; it takes about fifteen minutes.</p>
<h2 id="start">Where to start</h2>
<div class="guide">
${guide("README.md", "How it's made", "The overview: the rooms, Holmes, the props, and how to build and check the game yourself.")}
${guide("docs/teaser.md", "The teaser", "The story, the rooms and the puzzles, and what the teaser is meant to show.")}
${guide("docs/art-workflow.md", "Graphics workflow", "How pixel art becomes SCI pictures and views: palettes, priorities, anchors and the art manifest.")}
${guide("docs/art-learning-guide.md", "Learning the art pipeline", "A guided path through the studies for anyone learning to draw for the game.")}
${guide("docs/animation-workflow.md", "Animation workflow", "How Holmes's gestures and walk are built: structure first, then whole figures, then timing.")}
<a href="studies.html"><strong>Art studies</strong><span>${studies.length} rounds of art, in order, from the first workshop to the latest rooms.</span></a>
</div>
<h2 id="latest">Latest studies</h2>
<div class="cards">${latest.map(card).join("")}</div>
<h2 id="briefs">Briefs and handoffs</h2>
<div class="guide">
${guide("docs/room-camera-brief.md", "Room camera brief", "Why 221B was repainted with a front-on camera, and the numbers the engine needs.")}
${guide("docs/room-planes-brief.md", "Room planes brief", "Rooms seen through rooms: three depth planes in one picture.")}
${guide("docs/art-interface-implementation.md", "Interface handoff", "The fonts, toolbar and case, and what the engine had to learn to show them.")}
${guide("docs/art-delivery-status.md", "Art delivery status", "What's delivered, what's in the game, and what's still to draw.")}
</div>`;
  writeFileSync(join(out, "index.html"), shell({ title: "How it's made", slug: "index", body: home, description: "Notes, briefs and art studies from making The Case of the Clerkenwell Clocks." }));
  writeFileSync(join(out, "search.json"), JSON.stringify(search));

  if (skipped.length) console.warn(`docs: ${skipped.length} large GIFs linked on GitHub instead`);
  return { pages: pages.size + 2, files: published.size, bytes };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = resolve(root, "out/site/docs");
  const r = buildDocs(out);
  console.log(`${relative(root, out)}: ${r.pages} pages, ${r.files} files, ${(r.bytes / 1e6).toFixed(1)} MB`);
}
