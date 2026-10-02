# Working in this repository

Notes for anyone changing sci-sherlock, people and coding agents alike. The README says what
the game is; this says how work here is done.

## Two kinds of work

- **Art:** `art/studies/`, `art/reference/`, `art/source/`, `art/export/` and the art docs
  (`docs/art-*.md`, `docs/visual-spec.md`, `docs/animation-workflow.md`). Studies are
  reviewed before they go into the game.
- **The game:** the rooms (`rooms/*.room.yaml` and `.yarn`), scripts (`scripts/*.sc`),
  `items.yaml`, `flags.yaml`, the TypeScript at the root (`resources.ts`, `music.ts`,
  `placeholders.ts`, `preview.ts`), `sounds/`, `test/` and `.github/`.
- **`art/art.json`** is where the two meet: it registers the art the game uses. Change it in
  its own commit, and say in the pull request which study each resource comes from.

Several sessions often work here at once. Work in a git worktree, start branches from
`origin/main` (not a local `main` that may hold someone else's unpushed commits), and don't
touch files someone else has uncommitted changes in.

The engine (the interpreter, the class library, the room compiler, the tools) is
[sci-ts](https://github.com/rlueder/sci-ts), on npm as `sci2-ts`. Engine changes go there,
not here; this game imports it as `sci-ts/...`.

## Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
`type(scope): what changed`, in the present tense, with no full stop. A commit-msg
hook checks them (commitlint, installed by `pnpm install`), and so does CI on pull requests.

| type | for |
|---|---|
| `feat` | something new in the game: a room, a scene, art put into play |
| `fix` | something that was wrong |
| `docs` | documentation only |
| `refactor`, `perf`, `style`, `test` | as usual |
| `build`, `ci`, `chore` | dependencies, workflows, upkeep |

Scopes are optional: `game`, `rooms`, `art`, `music`, `docs`, `ci`, `deps`. Art studies are
commits too:

```
feat(art): Holmes investigation poses and the clock reveal (r11, r12)
fix(art): 3:17 hands on the wall clocks in the workshop base
docs(art): delivery status after the workshop handoff
feat(game): the workshop on its new art
```

Don't add co-author, "generated with" or similar attribution lines to commits or pull
requests.

## Pull requests

Branch, open a pull request, and squash-merge it once CI is green; the repository only
allows squash merges. The pull request's title becomes the commit on `main`, so it follows
the same convention. Pushes to `main` publish the game to GitHub Pages.

Before pushing:

```sh
pnpm check                # typecheck, the art check, the playthrough test
pnpm tsx preview.ts       # for gameplay changes: plays the whole teaser, saves review frames
```

## Never commit

- Anything from a Sierra game: resources, scripts, text, music or art.
- Anything from a later Sherlock Holmes adaptation (films, television, other games). Holmes,
  Watson, Mrs Hudson and 221B are Conan Doyle's and public domain; the story and everything
  else here is original.
- The SoundFont (`assets/soundfonts/`): it's fetched when the site is built.

## Writing

Docs, commit messages and in-game text are written plainly and specifically, in our own
words: say what something is and does, without filler.
