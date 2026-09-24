# NodePuls Rewrite Plan

**Goal:** Rebuild NodePuls with the same features, same visual design, same behavior — but on a cleaner, more maintainable, smaller-footprint stack. No new features, no design changes. This is a like-for-like re-implementation.

**Decided stack:**

| Layer | Current | New |
|---|---|---|
| Frontend framework | React 19 + CRA (react-scripts) | Vue 3 + `<script setup>` |
| Build tool | CRA / webpack | Vite |
| Language | TypeScript (client only) | TypeScript (client **and** server) |
| Charts | Recharts | Recharts (stays as is) |
| Drag & drop | react-dnd + react-dnd-html5-backend | `vuedraggable` (SortableJS-based) |
| Icons | lucide-react | lucide-vue-next |
| Realtime | socket.io-client | socket.io-client (unchanged) |
| Backend framework | Express (JS) | Express (TS) |
| Realtime server | socket.io (JS) | socket.io (TS) |
| DB driver | sqlite3 | better-sqlite3 |
| System info | systeminformation | systeminformation (unchanged) |
| Scheduling | node-cron | node-cron (unchanged) |
| Types | duplicated implicitly between client/server | shared `packages/shared-types` |
| Package manager | npm (single package.json) | npm workspaces (monorepo) |

---

## 0. Ground rules for the whole rewrite

- **Feature parity is the acceptance test.** Every checkbox in the "Feature Parity Checklist" (Phase 6) must work identically before this is considered done.
- **No visual/design changes.** Colors, layout, dark theme, animations, card styles all get ported 1:1 — this is an engineering rewrite, not a redesign.
- **Rewrite in a new folder/branch, don't mutate the old one in place.** Keep the current `NodePuls` repo running untouched until the new one reaches parity, so you always have a working fallback.
- **Port backend and frontend in that order.** The backend's API/socket contract is the thing the new frontend depends on — nailing it down first (in TS) gives you a stable target to build the UI against, and lets you keep testing it with tools like `curl`/Postman/a Socket.IO test client before any UI exists.

---

## Phase 1 — Repo scaffolding & shared types

**Status: done.**

**Goal:** Set up the new project skeleton before porting any real logic.

1. Create a new repo (or a `v2/` branch) with a simple workspace layout:
   ```
   nodepuls/
     apps/
       server/     ← Express + TS backend
       client/     ← Vue 3 + Vite frontend (official create-vue/Vite
                      defaults: flat assets/, flat composables/, env.d.ts,
                      three-way tsconfig split — components/ is the one
                      deliberate departure, grouped one level deep by
                      domain: base/, layout/, system/, websites/)
     packages/
       shared-types/   ← types shared by both
   ```
   Use npm workspaces (a single root `package.json` with a `"workspaces"`
   field — no extra tooling to install, works out of the box with the npm
   that ships with Node 20+). This has already been scaffolded and verified
   end-to-end (install → typecheck → dev → build → production boot all pass)
   — see `nodepuls-v2-scaffold.zip` and its README for exactly what's real
   vs. still stubbed.
2. Set up root-level tooling: a single `tsconfig.base.json`, ESLint + Prettier config shared across `apps/*`, `.editorconfig`.
3. Create `packages/shared-types` and port over the shapes already implied by `client/src/types.ts` and the socket/API contract in `server/index.js`:
   - `SystemData`, `DiskInfo`, `NetworkInterface`, `ChartDataPoint`
   - `Website`, `HistoryEntry`
   - Socket event payload types: `ServerToClientEvents` (`systemUpdate`, `websites`, `error`) and `ClientToServerEvents` (`addWebsite`, `removeWebsite`, `updateWebsite`, `updateWebsiteOrder`, `clearWebsiteHistory`)
   - REST response types for `/api/config`, `/api/health`, `/api/system`, `/api/websites`
4. **Exit criteria:** empty server and client apps that both build, both import from `shared-types`, and CI (even just a GitHub Action running `tsc --noEmit` + lint) is green.

---

## Phase 2 — Backend rewrite (Express + TypeScript)

**Status: partially done.** Config, routes, and socket wiring are real and
verified working end-to-end. `systemMonitor.ts` is a genuine, tested
`systeminformation`-backed implementation (not a stub). `databaseService.ts`
has the real `better-sqlite3` schema set up but isn't wired to anything yet.
`uptimeMonitor.ts` is still in-memory only, with no real HTTP checks — this
is the main remaining work in this phase.

**Goal:** Reproduce `server/index.js`, `server/services/*`, `config.js`, and `env-loader.js` in TypeScript with identical external behavior (same routes, same socket events, same env vars, same `.env` semantics).

1. **Config module** (`config.ts`): port `config.js` as-is, typed. Keep every existing env var name (`PORT`, `DB_PATH`, `CORS_ORIGIN`, `MONITOR_INTERVAL`, `WEBSITE_DOWN_THRESHOLD`, `ENABLE_CPU_TEMPERATURE`, etc.) — this is what makes existing `docker-compose.yml` / `.env` files drop in unchanged.
2. **Database layer**: port `databaseService.js` → `databaseService.ts`, swapping `sqlite3` for `better-sqlite3`.
   - `better-sqlite3` is synchronous, so this is the one place logic actually changes shape (no more callbacks/promises-wrapping-callbacks for DB calls — plain synchronous calls, which is simpler code, not just a different import).
   - Keep the exact same schema/tables/columns so the existing `homelab.db` file (and anyone's existing data volume) still opens correctly. Write a short migration check: **if a `.db` file created by the old `sqlite3` version needs any table/pragma difference, document it explicitly** — otherwise assume drop-in compatibility, since `better-sqlite3` reads standard SQLite files.
3. **System monitor** (`systemMonitor.js` → `.ts`): port CPU/memory/disk/network/temperature collection logic, typed against `SystemData` from shared-types. Behavior unchanged (same 5s default interval, same feature toggles for temperature/disk-IO/process monitoring).
4. **Uptime monitor** (`uptimeMonitor.js` → `.ts`): port the 3-tier check (HEAD → GET → Retry), health-scoring system, consecutive-failure logic, and history retention — typed against `Website`/`HistoryEntry`.
5. **Server entrypoint** (`server/index.ts`): port Express app setup 1:1:
   - Same middleware stack: `helmet`, `compression`, `cors`, `express.json()`, static file serving.
   - Same REST routes: `GET /api/config`, `GET /api/health`, `GET /api/system`, `GET/POST /api/websites`, `DELETE /api/websites/:id`.
   - Same Socket.IO events: `addWebsite`, `removeWebsite`, `updateWebsite`, `updateWebsiteOrder` (with the 300ms debounce), `clearWebsiteHistory`, and the connected-clients-gated system-monitoring start/stop logic.
   - Type the Socket.IO server generically with the shared `ServerToClientEvents`/`ClientToServerEvents` — this is where shared-types actually pays off (typos in event names become compile errors instead of silent runtime no-ops).
6. **Exit criteria:** the new backend serves the *old* built React client (point it at the existing `client/build` output temporarily) and behaves identically — same API responses, same socket events, same env var behavior. This proves the backend port is correct in isolation, before the frontend even changes.

---

## Phase 3 — Frontend rewrite (Vue 3 + Vite + TS)

**Status: shell done, components not started.** `App.vue`, the socket
composables (`useSocket`, `useSystemStats`, `useWebsites`), `NodeLogo.vue`,
and `ConnectionStatus.vue` are real and confirmed receiving live data.
Everything else below (`StatCard`, `WebsiteCard`, `ResourceChart`, etc.) is
still a plain placeholder in `App.vue` — this phase's actual component work
hasn't started yet. `NodePuls-Design-Guidelines.html` has the full spec for
each one, and `NodePuls-Code-Guidelines.md` §1 has the exact file paths
(`components/base/`, `components/system/`, `components/websites/`) to build
them into.

**Goal:** Reproduce `Dashboard.tsx`, `SystemStats.tsx`, `WebsiteMonitor.tsx`, `ResourceCharts.tsx`, `ConnectionStatus.tsx`, and all of `Dashboard.css` with identical UI/UX.

1. **Scaffold**: `npm create vite@latest client -- --template vue-ts`, wire up the same dark theme via global CSS (port `App.css`/`index.css`/`Dashboard.css` largely unchanged — CSS doesn't care which framework renders it).
2. **Socket connection composable** (`useSocket.ts`): a composable wrapping `socket.io-client`, replacing whatever hook/context currently manages the connection in `App.tsx`. Exposes reactive `connected` state consumed by `ConnectionStatus`.
3. **Component-by-component port:**

   | Old component | New component | Notes |
   |---|---|---|
   | `App.tsx` | `App.vue` | Root layout, socket connection lifecycle |
   | `ConnectionStatus.tsx` | `ConnectionStatus.vue` | Simple, low-risk — port first as a warm-up |
   | `SystemStats.tsx` | `SystemStats.vue` | CPU/RAM/disk/network cards, device-selection dropdowns |
   | `ResourceCharts.tsx` | `ResourceCharts.vue` | **Recharts stays.** Chart config (colors, animation, adaptive scaling, 50-point history window) ports over largely unchanged. |
   | `WebsiteMonitor.tsx` | `WebsiteMonitor.vue` | Largest file (32K) — likely worth splitting into sub-components: `WebsiteCard.vue`, `AddWebsiteModal.vue`, `ImportExportMenu.vue`, `WebsiteList.vue` (using `vuedraggable` for reordering, replacing react-dnd) |
4. **State management**: for a dashboard this size, plain composables (`ref`/`reactive` + provide/inject if needed) are enough — **don't introduce Pinia** unless state sharing actually gets unwieldy during the port. Adding a state library here would work against the footprint goal for no real benefit at this scale.
5. **Import/export & drag-and-drop**: port the JSON import/export logic (validation, unique-ID generation on import, bulk limits) as plain TS functions/composables — this logic is framework-agnostic and should port almost unchanged.
6. **Exit criteria:** new Vue client, served by the new TS backend, is visually and functionally indistinguishable from the current app side-by-side.

---

## Phase 4 — Build & tooling parity

**Status: done, verified as part of the scaffold.**

1. Replace the root `package.json` scripts (`dev`, `dev:watch`, `build`, `start`, `install:all`) with npm-workspace equivalents (`npm run <script> --workspace=X`) that do the same jobs:
   - `dev`: builds `shared-types` once, then runs it in watch mode alongside the server (`tsx watch`) and client (Vite dev server) together via `concurrently`
   - `build`: builds `shared-types`, `vite build`s the client, `tsc` builds the server, then copies the client `dist/` into `apps/server/public` via `scripts/copy-build.js` (ported from v1 almost unchanged — just points at Vite's `dist` instead of CRA's `build`)
   - `start`: runs the compiled server in production mode
2. Ported `scripts/clean.js` unchanged.
3. Went with `tsx watch` for the dev loop — lower-friction than `ts-node`, no separate pre-compile step.
4. Two real bugs caught by actually running the built output (not just writing it): Node ESM needs explicit `.js` extensions on relative imports that `tsc` doesn't add automatically (broke prod boot, not dev, since `tsx` masks it); and the default `DB_PATH` was resolved against `process.cwd()` instead of the module's own location, so it silently wrote to the wrong folder depending on which script started the server. Both fixed.

---

## Phase 5 — Docker & deployment

1. Update `Dockerfile`: multi-stage build stays the same shape (build client → build server → copy into a slim runtime image), just update paths (`client/build` → `apps/client/dist`) and add a TS compile stage for the server.
2. Verify `better-sqlite3`'s native bindings build cleanly in the Alpine multi-arch build — this was flagged as a known pain point for `sqlite3`; confirm the new driver actually improves this before treating it as solved. Test an `arm64` build explicitly if the homelab target includes ARM boards.
3. `docker-compose.yml` env vars stay unchanged (that's the whole point of keeping the same config var names in Phase 2) — the same compose file should work against the new image with zero edits.
4. Smoke-test the container with the **existing** `homelab-data` volume (an old `homelab.db`) to confirm `better-sqlite3` opens the legacy database file without migration.

---

## Phase 6 — Feature parity checklist

Go through this list against the running old app vs. the running new app before calling the rewrite done:

**System monitoring**
- [ ] CPU usage, load average, core count, temperature
- [ ] Memory usage (used/free/percentage)
- [ ] Disk usage per mounted drive, with device-selection dropdown
- [ ] Network up/down speed, with interface-selection dropdown
- [ ] System uptime display (days/hours/minutes)
- [ ] Monitoring only runs while ≥1 client is connected (start/stop on connect/disconnect)
- [ ] Resource charts: 50-point history, adaptive/per-metric scaling, hover tooltips, animations

**Website monitoring**
- [ ] Add website (name + URL, with the auto-`http://` / IP:port normalization)
- [ ] Remove website
- [ ] Edit website (name/URL)
- [ ] 3-tier check strategy (HEAD → GET → Retry), 10s timeout
- [ ] Health-scoring system (gradual degradation, not single-failure false-down)
- [ ] Uptime percentage + response-time history per site
- [ ] Drag-and-drop reordering, order persists across reloads/restarts
- [ ] JSON import (bulk, with validation + collision-resistant ID generation)
- [ ] JSON export
- [ ] Clear website history action

**Infra / cross-cutting**
- [ ] Single-port serving (API + WebSocket + static assets all on `PORT`)
- [ ] All existing env vars behave identically
- [ ] CORS behavior identical in dev vs. Docker
- [ ] Existing `.env` files and `docker-compose.yml` work with zero edits
- [ ] Existing `homelab.db` opens correctly under `better-sqlite3`
- [ ] Dark theme, hidden scrollbars, responsive layout, all pixel-equivalent to current app

---

## Phase 7 — Cutover

1. Run old and new side by side (different ports) pointed at a **copy** of the production `homelab.db` for a few days of real usage.
2. Once the parity checklist is fully green and you're confident, swap the Docker image tag in your homelab deployment, keep the old image available to roll back to.
3. Archive the old React codebase (tag it, e.g. `v1-react-final`) rather than deleting it, in case you need to reference old logic later.
4. Update the README/CHANGELOG to reflect the new stack (bump major version, e.g. `2.0.0`, since this is a full rewrite even though behavior is unchanged).

---

## Effort/risk notes

- **Highest-risk file:** `WebsiteMonitor.tsx` (largest file, 32K) — likely worth splitting into sub-components (`WebsiteCard.vue`, `AddWebsiteModal.vue`, `ImportExportMenu.vue`, `WebsiteList.vue`) and swapping react-dnd for `vuedraggable`.
- **Lowest-risk files:** `ConnectionStatus`, config, the REST routes, and `ResourceCharts.tsx` — Recharts stays as-is, so this is close to a 1:1 translation, same as the others — good places to start to build momentum.
- **Real logic change, not just syntax:** the `sqlite3` → `better-sqlite3` switch (async/callback → sync) touches every call site in `databaseService.js`. Do this file early and test it in isolation (a small script that exercises every DB method) before wiring it into the rest of the server.
