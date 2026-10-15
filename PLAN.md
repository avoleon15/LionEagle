# Lion Eagle (León Águila) — plan

Multiplayer trivia where the rarer your answer, the higher you climb. Inspired by Krillion, but with friend lobbies, in Spanish, and going **up** into the sky instead of down into the sea. The name is a translation of the owner's surnames (León Aguilar = lion + eagle).

## Decisions (owner, 2026-10-14)

| Topic | Decision |
|---|---|
| Rarity | **Curated answer lists.** Each question has a predefined set of valid answers, each with a tier. Researched by Claude from questions the owner provides. |
| Unlisted answers | **Not valid.** If it's not on the list it scores nothing (no AI judging, no "unlisted = top tier"). |
| Questions | Written/curated by the owner and the app. Players **cannot add questions**, but can **suggest** them; the owner reviews suggestions. |
| Sync | All players answer the same question at the same time, with a **server-owned timer**. |
| Same answer | Players who give the same answer get **the same points** (no penalty). |
| Language | Spanish only (for now). |
| Accounts | None. Nickname + character only. |
| Character | Among Us-style: one shared body, customised with colour, face, hair, hat and pants. |
| Categories | The **host picks** the categories before the game. |
| Modes | Lobby/party only. No daily solo mode for now. |
| Audience | Friends first, public later. |
| Theme | Intro screen full of lions and eagles. In game, a lion and an eagle stand on the ground; players **rise toward the sky** as they score and eventually disappear off the top. |

## Scoring

Five tiers, as described by the owner: 10, 30, 60, 80, 100. Seven questions per game, so the maximum is 700 points. Example, "Nombra un país de Norteamérica": Estados Unidos 10, México 30, a mid-rarity answer 60, Guatemala 80, a rare island nation 100. (Krillion itself has six tiers incl. 15 and 85; we use the owner's five.)

## Stack

- TypeScript everywhere; shared protocol types in `shared/`.
- Client: Vite + React. The pixel-art scene is plain Canvas 2D drawn at a tiny logical resolution and scaled up with nearest-neighbour filtering (no PixiJS needed).
- Server: Node + Socket.IO, authoritative (timer, scoring, answer checking). In-memory rooms at first.
- Questions: SQLite (Node's built-in `node:sqlite`, so Node 22.13+; file at `server/data/lion-eagle.db`, ignored by git) with an owner review page at `/admin`.
- Hosting later: Fly.io or Railway, one small instance.

## Phases

1. **Skeleton (done 2026-10-14):** create room, join by 4-letter code or link (`/ABCD`), player list, character picker (placeholder art), host starts the game, reconnect.
2. **Core round (done 2026-10-14):** 7 questions, server-owned timer, server-side answer matching (ignores accents, case, articles, simple plurals), scoring, reveal screen, final ranking, host returns everyone to the lobby.
   - Defaults chosen (change freely): 20 s per question, 7 s reveal. Override with `LE_ROUND_MS` / `LE_REVEAL_MS`.
   - The first valid answer locks in for the round. Invalid (unlisted) answers are free to retry. A round ends early once every connected player has answered.
   - Disconnected players keep their seat and score for 60 s; the round does not wait for them.
   - `server/src/questions.ts` holds 11 **sample** questions with placeholder tiers. They are for testing only; replace them with the owner's questions and researched answer lists.
   - Tests: `npm run test -w server` checks every question's answer list and the matching rules.
   - The climbing column in the game screen is a placeholder for phase 3.
3. **Ascent scene (done 2026-10-14):** pixel-art sky and ground (`client/src/Scene.tsx`, sprites in `client/src/pixel/`). A lion and an eagle stand on the ground; players rise in proportion to their points (700 = the top), with a hop, a "+points" popup, and sparkles for 60/80/100 answers. A green check shows who has answered. At the end every player launches off the top of the sky, lowest score first, winner last, and the ranking card shows the result. The sky fills the frame at any size (desktop: beside the question, phone: above it).
   - Characters are now pixel art everywhere (home preview, lobby, results). Dev-only gallery of every customiser option and the mascots: open `/sprites` while `npm run dev` runs.
   - The home screen is a grid of lions and eagles.
   - Placeholder choices to confirm: the "disappear" rule (everyone launches at the end), no sound yet, the character hair/hat art is first pass.
4. **Content (infrastructure done 2026-10-14; waiting for the owner's questions):**
   - Questions and answer lists live in SQLite. Statuses: draft, published, archived. Only complete questions can be published (at least 6 answers, one of 10 and one of 100, no duplicates); incomplete ones are saved as drafts automatically.
   - The 11 sample questions are seeded on first run (marked "Muestra") so the game is playable; the admin has a button to archive them all once real content exists.
   - Host picks categories in the lobby (everyone sees the selection). A game needs at least 7 published questions in the chosen categories. A room does not see the same question twice until it has seen them all; categories are mixed round-robin.
   - Owner review page: `/admin` (token printed in the server terminal and kept in `server/data/admin-token.txt`; set `ADMIN_TOKEN` in production). Edit questions with one textarea per tier (`Respuesta | alias | alias`, one per line), a "probar una respuesta" box that checks an answer exactly as the game would, suggestions inbox (create a draft or discard), JSON import/export.
   - Suggestion box: any player can suggest a question from the home screen or the lobby (max 5 per hour per address). Suggestions never go live by themselves.
   - Bulk content: put JSON files in `content/` and run `npm run import -w server -- ../content/file.json` (format in `content/README.md`).
   - Tests: `npm test` from the project root runs both suites: `server/src/selftest.ts` (323 checks: database, selection, matching, clock, join payloads and every file in `content/`) and `server/src/e2e.ts` (starts a real server and attacks it with missing callbacks and malformed payloads, then plays a round).
   - **First content batch (2026-10-14):** 69 questions in `content/*.ts` (Minecraft 4, Pokémon 5, Videojuegos 7, Cine y series 8, Fútbol 5, Deportes 3, Geografía 11, Historia 3, Comida y bebida 6, Ciencia 3, Cultura general 6, Música 1, Guatemala 7) plus 9 older samples. Imported as drafts; the admin button "Publicar todos los borradores que estén listos" publishes the ones that pass the checks. Every list has a note with its doubts. Time-sensitive facts were verified online on 2026-10-14 (Premier League 2026-27, Europa League and Champions League winners, World Cup 2026 = Spain, MCU films). Lists that need refreshing each season: Premier League, Europa/Champions League, Mundial, Balón de Oro (2026 winner announced 2026-10-26), Marvel (Avengers: Doomsday, Dec 2026).
   - **Answer logging (built 2026-10-14):** every answer players type is logged per question, without any player information (`answer_log` and `question_stats` tables, `server/src/stats.ts`). Admin tab "Respuestas de jugadores": per question, the answers that were tried and are not in the list (with how many times), buttons to add one as a new answer at a chosen tier, add it as an alias of an existing answer, or ignore it; plus each listed answer's share of valid answers, with a suggested tier once there are 100+ valid answers (8%+ = 10, 3% = 30, 1% = 60, 0.3% = 80, less = 100). Validity is recomputed on read, so editing a list updates the history. Resetting data per question or globally is in the same tab.
   - **Second content batch (2026-10-14, 45 more questions):** Minecraft biomes and potions, natural satellites, F1 drivers, tennis players, winter sports, dog breeds, dinosaurs, SpongeBob/Toy Story/Adventure Time/Gumball/Friends/Breaking Bad/Stranger Things characters, Disney princesses, Clash Royale (all cards, by rarity, champions, spells, buildings), UFC (heavyweight/light heavyweight/lightweight/welterweight/middleweight champions, women's champions, any champion, weight classes), mountains, languages, organs, cell parts, energy types, cheeses, fruits, airlines, computer brands, Apple apps, Greek/Roman/Norse gods. All imported as drafts (114 drafts in total). Import with `--only-new` never overwrites questions edited in the admin.
5. **Polish:** sound, final podium, mobile layout, full character customiser art, deployment.

## Open questions

- Is the "disappear into the sky" rule right? Currently everyone launches off the top at the end of the game. The alternative is leaving as soon as you pass a certain height.
- Should answer matching also forgive small typos? Currently it does not: accents, case, articles and simple plurals only.
- Palette/logo for the lion + eagle.

## Code review fixes (2026-10-15)
Fixed after a full code review: (1) the server crashed when a client emitted without a callback or with a malformed payload (`replier`/`sanitizeJoin` in `server/src/index.ts` and `rooms.ts`); (2) the on-screen countdown froze between server updates (`shared/clock.ts`); (3) the client stayed stuck on a dead game screen after a server restart or an expired seat (`client/src/App.tsx`), and the game screen now has a "Salir de la sala" button.
Medium findings 4-8 fixed the same day:
- **Attempts:** each player gets `MAX_ATTEMPTS` (6, in `shared/protocol.ts`) wrong guesses per question; a correct answer after that is refused. Everybody sees who is out of tries (`GameView.exhausted`) and the round ends early when all players have answered or run out. The answer log remembers at most 400 distinct typed answers per question (`MAX_LOG_ROWS`).
- **Data integrity:** question ids have one canonical form (`canonicalId`), imports are one transaction and report items that are not objects instead of aborting, deleting a question also deletes its play data, a suggestion can be accepted or rejected only once, status/source are validated.
- **Security:** the admin checks the token before reading the body, locks an address out for 15 minutes after 10 failed attempts, and the token is only printed to a terminal (never to hosting logs). `X-Forwarded-For` is ignored unless `TRUST_PROXY` is set (set `TRUST_PROXY=1` behind a proxy). `/api/*` misses answer JSON 404. Rate limits live in `server/src/ratelimit.ts` and sweep expired entries.
- **Ready to publish:** `tsx` is a real dependency and `engines.node` is `>=22.13` (SQLite is built in); SQLite runs in WAL mode with a busy timeout so `npm run import` can run while the server is up; the project is under git. To run it: `npm ci --omit=dev && npm run build && ADMIN_TOKEN=... TRUST_PROXY=1 PORT=... npm start` (use HTTPS in front of it, because the admin token travels in a header).
- **Admin list:** it carries summaries (24 KB for 123 questions instead of 430 KB), quality checks are cached per question, categories have their own endpoint and typing in the search box waits 300 ms.
Low findings fixed afterwards (2026-10-15):
- **Timers:** `Game` wraps every timer callback and every "state changed" notification in try/catch, so a failing socket or a bug in one round cannot become an uncaught exception that kills every room.
- **Host:** a host who stays disconnected for `HOST_HANDOVER_MS` (10 s, env `LE_HOST_HANDOVER_MS`) hands the room to a connected player; a host who comes back in time keeps it. A player who returns after losing the host is a normal player.
- **Nicknames:** a rejoin keeps the current nickname if somebody else has taken the saved one.
- **Categories:** categories the host picked that no longer have published questions are dropped; if none are left the selection falls back to all of them (the start check uses the same rule).
- **Answer log:** adding an alias or answer from the log to a *published* question is refused with the reason when it would make the question invalid, instead of silently turning it into a draft.
- **Stats:** `recordRound` only counts as "asked" the players who were connected at the end of the round or had answered.
- **Regexes:** the accent-stripping ranges use `\u0300-\u036f` escapes instead of invisible literal characters.
- **Dependencies:** vite 5 -> 7 (client); `npm audit` reports 0 vulnerabilities.
Nothing known is left open from the review.
