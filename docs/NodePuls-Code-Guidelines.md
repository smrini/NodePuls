# NodePuls v2 — Code Guidelines

> Vue 3 · Vite · TypeScript · Express · Socket.IO · better-sqlite3 Companion to
> `NodePuls-Rewrite-Plan.md` — applies to the v2 rewrite only.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Environment & Config Files](#2-environment--config-files)
3. [Naming Conventions](#3-naming-conventions)
4. [CSS File Treatment](#4-css-file-treatment)
5. [Component Structure](#5-component-structure)
6. [Component Documentation](#6-component-documentation)
7. [Props](#7-props)
8. [Emits](#8-emits)
9. [Reactive State](#9-reactive-state)
10. [Composables](#10-composables)
11. [Scoped Styles](#11-scoped-styles)
12. [UI Component Patterns](#12-ui-component-patterns)
13. [Server Routes & Socket Handlers](#13-server-routes--socket-handlers)
14. [Shared Types](#14-shared-types)
15. [vite.config.ts](#15-viteconfigts)
16. [Prettier](#16-prettier)
17. [ESLint](#17-eslint)
18. [Git & Commits](#18-git--commits)
19. [What to Avoid](#19-what-to-avoid)

---

## 1. Project Structure

```
nodepuls/
│
├── .env                              ← runtime config, never committed
├── .env.example                      ← committed, dummy values only
├── .prettierrc
├── eslint.config.ts
├── package.json                      ← workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── docker-compose.yml
├── Dockerfile
├── README.md
│
├── apps/
│   ├── client/                       ← Vue 3 + Vite SPA
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json             ← references only, matches official create-vue
│   │   ├── tsconfig.app.json         ← src/, DOM + vite/client types
│   │   ├── tsconfig.node.json        ← vite.config.ts, node types
│   │   ├── env.d.ts                  ← /// <reference types="vite/client" />
│   │   ├── public/
│   │   │   └── nodepuls.svg
│   │   └── src/
│   │       ├── main.ts
│   │       ├── App.vue
│   │       │
│   │       ├── assets/               ← flat, matches the official default
│   │       │   ├── base.css          ← design tokens (:root custom properties) + resets
│   │       │   └── main.css          ← imports base.css; global styles + @keyframes
│   │       │
│   │       ├── components/           ← one level of domain folders, never deeper
│   │       │   ├── base/                     ← generic, feature-agnostic primitives
│   │       │   │   ├── BaseBadge.vue
│   │       │   │   ├── BaseButton.vue
│   │       │   │   ├── BaseCard.vue
│   │       │   │   ├── BaseDropdown.vue
│   │       │   │   ├── BaseModal.vue
│   │       │   │   └── BaseStatusPill.vue
│   │       │   │
│   │       │   ├── layout/                   ← app shell chrome
│   │       │   │   ├── NodeLogo.vue
│   │       │   │   └── ConnectionStatus.vue
│   │       │   │
│   │       │   ├── system/                   ← System Overview / Resource Usage
│   │       │   │   ├── SystemStats.vue
│   │       │   │   ├── ResourceChart.vue     ← one chart, reused per metric
│   │       │   │   └── DeviceSelect.vue      ← disk/network dropdown
│   │       │   │
│   │       │   └── websites/                 ← Website Monitoring
│   │       │       ├── WebsiteMonitor.vue    ← orchestrates the section
│   │       │       ├── WebsiteCard.vue
│   │       │       ├── WebsiteList.vue       ← vuedraggable wrapper
│   │       │       ├── AddWebsiteModal.vue
│   │       │       └── ImportExportMenu.vue
│   │       │
│   │       ├── composables/          ← flat, matches the official default
│   │       │   ├── useSocket.ts
│   │       │   ├── useSystemStats.ts
│   │       │   ├── useWebsites.ts
│   │       │   └── useWebsiteImportExport.ts
│   │       │
│   │       └── utils/
│   │           └── formatters.ts         ← bytes, uptime, URL display formatting
│   │
│   └── server/                       ← Express + TS
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts              ← app + http server + socket.io bootstrap
│           ├── config.ts
│           ├── env-loader.ts
│           │
│           ├── routes/
│           │   ├── config.route.ts
│           │   ├── health.route.ts
│           │   ├── system.route.ts
│           │   └── websites.route.ts
│           │
│           ├── sockets/
│           │   └── registerWebsiteSocketHandlers.ts
│           │
│           ├── services/
│           │   ├── databaseService.ts
│           │   ├── systemMonitor.ts
│           │   └── uptimeMonitor.ts
│           │
│           └── data/
│               └── homelab.db            ← gitignored, mounted as a volume in Docker
│
├── packages/
│   └── shared-types/                 ← imported by both apps/client and apps/server
│       └── src/
│           ├── system.ts             ← SystemData, DiskInfo, NetworkInterface
│           ├── website.ts            ← Website, HistoryEntry
│           ├── chart.ts              ← ChartDataPoint
│           └── socket-events.ts      ← ServerToClientEvents, ClientToServerEvents
│
└── scripts/
    ├── copy-build.js                 ← copies apps/client/dist → apps/server/public
    └── clean.js
```

This matches the official `create-vue`/Vite defaults everywhere there's no
project-specific reason to deviate (`env.d.ts`, the three-way `tsconfig` split,
flat `assets/`/`composables/`/`utils/`). The one deliberate departure is
`components/`: a fully flat folder is right for a handful of components, but
NodePuls already has ~16 across clearly distinct domains and is expected to
grow, so one level of domain subfolders (never nested deeper) keeps a file
findable by what it's for. There is no `router/`, `stores/`, or `views/` —
NodePuls is a single dashboard screen, so `App.vue` is the only "view"; add
those folders (in that shape) if a second screen or real cross-component shared
state shows up later, not before.

---

## 2. Environment & Config Files

### .gitignore

```gitignore
# Build outputs
apps/client/dist
apps/server/dist
apps/server/public

# Node dependencies
node_modules

# Logs
logs
*.log

# Misc
.DS_Store
.idea
.vscode/*
!.vscode/extensions.json

# Local env files
.env
.env.*
!.env.example

# Database
apps/server/src/data/*.db
!apps/server/src/data/.gitkeep
```

### .env.example

```bash
# Copy this file to .env and fill in real values.
# Never commit .env — only .env.example is tracked.
# These variable names are load-bearing: they must stay identical to v1
# so existing docker-compose.yml / .env files keep working unmodified.

# Network
PORT=3020
NODE_ENV=development
CORS_ORIGIN=

# Database
DB_PATH=./apps/server/src/data/homelab.db

# Website Monitoring
WEBSITE_CHECK_TIMEOUT=10000
WEBSITE_CHECK_INTERVAL="*/1 * * * *"
MAX_WEBSITE_HISTORY=1440
WEBSITE_DOWN_THRESHOLD=3

# Health Scoring
HEALTH_SCORE_SUCCESS_BONUS=10
HEALTH_SCORE_FAILURE_PENALTY=15
HEALTH_SCORE_DOWN_THRESHOLD=30
MIN_CONSECUTIVE_FAILURES=2

# System Monitoring
MONITOR_INTERVAL=5000
CLEANUP_INTERVAL=24
DEFAULT_TIMEOUT=10000
MAX_HISTORY_ENTRIES=100

# Feature Toggles
ENABLE_CPU_TEMPERATURE=true
ENABLE_DISK_IO_MONITORING=false
ENABLE_PROCESS_MONITORING=false

# Security
ENABLE_HELMET=true
TRUST_PROXY=false

# Performance
COMPRESSION_LEVEL=6
REQUEST_TIMEOUT=10000
MAX_CONNECTIONS=100
```

### tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

`apps/server/tsconfig.json` extends this directly and adds `"types": ["node"]`.

`apps/client` follows the official `create-vue` split instead of one file, since
Vite needs app code (browser-context, DOM types) and `vite.config.ts`
(node-context) type-checked separately:

```jsonc
// apps/client/tsconfig.json — references only, nothing else
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
  ],
}
```

```jsonc
// apps/client/tsconfig.app.json — src/
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["vite/client"],
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
  },
  "include": ["src"],
}
```

```jsonc
// apps/client/tsconfig.node.json — vite.config.ts
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "types": ["node"] },
  "include": ["vite.config.ts"],
}
```

Neither app needs a manual `paths` alias for `@nodepuls/shared-types` — it's a
real workspace package with `main`/`types` pointing at its own built `dist/`, so
normal `node_modules` resolution (via the workspace symlink) just works, the
same way any npm dependency would.

---

## 3. Naming Conventions

| Item                     | Convention                            | Example                                    |
| ------------------------ | ------------------------------------- | ------------------------------------------ |
| `components/` subfolders | one level, lowercase, by domain       | `base/`, `layout/`, `system/`, `websites/` |
| Base/generic components  | PascalCase, `Base` prefix             | `BaseButton.vue`, `BaseStatusPill.vue`     |
| Feature component files  | PascalCase, no prefix                 | `WebsiteCard.vue`, `StatCard.vue`          |
| Composable files         | camelCase, `use` prefix               | `useWebsites.ts`                           |
| Global CSS files         | kebab-case                            | `base.css`, `main.css`                     |
| Shared type files        | kebab-case                            | `socket-events.ts`                         |
| CSS custom properties    | short kebab tokens                    | `--bg1`, `--ac`, `--r-2`                   |
| CSS classes              | component-prefixed kebab              | `.website-card-title`                      |
| Props                    | camelCase                             | `isLoading`, `chartData`                   |
| Emits                    | kebab-case strings                    | `'update:modelValue'`, `'website-added'`   |
| Template refs            | camelCase, `Ref` suffix               | `const listRef = useTemplateRef('list')`   |
| Server route files       | `<resource>.route.ts`                 | `websites.route.ts`, `system.route.ts`     |
| Service files            | camelCase, `Service`/`Monitor` suffix | `databaseService.ts`, `uptimeMonitor.ts`   |

`components/` is never more than one folder deep — if a domain grows enough to
want sub-grouping, that's a sign it should become an app-level `views/` route
instead, not a deeper nesting. There is no `router/`, `stores/`, or `views/` yet
(v1 has a single dashboard view, and v2 keeps that for now) — add them, in that
official shape, if a second screen or real shared state actually shows up; don't
introduce them speculatively.

---

## 4. CSS File Treatment

All token values are documented in `NodePuls-Design-Guidelines.html` — that file
is the source of truth for the actual color/spacing/radius values, this file
only says _where_ CSS lives.

| File             | Purpose                  | What belongs here                                                                                                                                 |
| ---------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base.css`       | Design system foundation | One `:root {}` block. All `--custom-properties`. Plus document-level resets (`*`, `html`, `body`, scrollbar-hiding). No component-specific rules. |
| `main.css`       | Global styles + motion   | `@import './base.css';` first, then base typography, and every `@keyframes` / reusable transition utility.                                        |
| `<style scoped>` | Component styles         | **Primary choice.** Every component owns its own `<style scoped>` block.                                                                          |

Two files, matching the official `create-vue` convention exactly — no
project-specific reason to split further. v1 had all colors, spacing, and radii
hardcoded directly in `Dashboard.css` with no token layer at all. The single
biggest structural CSS change in v2 is introducing `base.css`'s `:root` tokens
and replacing every hardcoded hex/px value with the matching one — same visual
output, but a value now has one place to change instead of N.

---

## 5. Component Structure

Every `.vue` file includes only the blocks it needs. Block order is always
script → template → style.

```vue
<!--
  ComponentName.vue
  One-line description of what this component does and where it is used.
-->

<script lang="ts" setup>
// 1. type imports
// 2. defineOptions
// 3. props
// 4. emits
// 5. reactive state (ref, computed)
// 6. composables
// 7. methods / handlers
// 8. lifecycle hooks
</script>

<template>
  <!-- single root element preferred -->
</template>

<style scoped>
/* component-specific styles only */
</style>
```

---

## 6. Component Documentation

Prop-level and emit-level docs use JSDoc directly inside `defineProps<{}>` /
`defineEmits<{}>` — this is what the editor shows on hover.

```ts
const props = withDefaults(
  defineProps<{
    /** Website record to render */
    website: Website
    /**
     * Whether the card shows the drag handle.
     * @default true
     */
    draggable?: boolean
  }>(),
  { draggable: true },
)

const emit = defineEmits<{
  /** Emitted when the user confirms removal, payload is the website id */
  remove: [id: string]
}>()
```

---

## 7. Props

```ts
<script lang="ts" setup>
import type { Website } from '@nodepuls/shared-types'

defineOptions({ name: 'WebsiteCard' })

const props = withDefaults(
  defineProps<{
    /** Website record to render */
    website: Website
    /** Whether reorder is currently allowed */
    draggable?: boolean
  }>(),
  { draggable: true },
)
</script>
```

**Rules:**

- Use `withDefaults` whenever any prop is optional
- Array/object defaults must use factory functions: `() => []`, `() => ({})`
- Guard optional props in the template with `v-if`, never `{{ optional ?? '' }}`
- Prefer `props.x` over destructuring in the template — keeps reactivity visible

---

## 8. Emits

```ts
<script lang="ts" setup>
defineOptions({ name: 'WebsiteCard' })

const emit = defineEmits<{
  /** Emitted when the user requests removal */
  remove: [id: string]
  /** Emitted when the user submits an edit */
  update: [id: string, name: string, url: string]
}>()
</script>
```

**Rules:**

- Always use the object syntax — never the array form (`defineEmits(['click'])`)
- `update:modelValue` enables `v-model` usage on the component
- Event names are kebab-case strings

---

## 9. Reactive State

```ts
<script lang="ts" setup>
// ref — primitives and single values
const isModalOpen = ref(false)
const filter = ref<'all' | 'up' | 'down'>('all')

// computed — derived state only, no side effects
const visibleWebsites = computed(() =>
  websites.value.filter((w) => filter.value === 'all' || w.status === filter.value),
)

// watch — side effects only, never for deriving state
watch(filter, (next) => {
  console.debug('filter changed', next)
})

// useTemplateRef — DOM refs
const listRef = useTemplateRef<HTMLDivElement>('list')
</script>

<template>
  <div ref="list" class="website-list">...</div>
</template>
```

**Rules:**

- Prefer `ref()` over `reactive()` for component-level state
- Type `ref<T>()` explicitly when the initial value could be misread
- Never use `watch` to set another ref — use `computed` instead
- Use `useTemplateRef()` instead of `ref(null)` for DOM elements
- Live data arriving over the socket (system stats, website list) lives in a
  composable (see below), not duplicated into local component `ref`s

---

## 10. Composables

All composables live in `src/composables/`. Named exports only, `use` prefix.

```ts
// src/composables/useSystemStats.ts
import type { SystemData } from '@nodepuls/shared-types'
import { useSocket } from './useSocket'

/**
 * Subscribes to the `systemUpdate` socket event and keeps a rolling
 * 50-point history for the resource charts.
 */
export function useSystemStats() {
  const { socket } = useSocket()
  const current = ref<SystemData | null>(null)
  const history = ref<SystemData[]>([])
  const MAX_HISTORY = 50

  socket.on('systemUpdate', (data: SystemData) => {
    current.value = data
    history.value.push(data)
    if (history.value.length > MAX_HISTORY) history.value.shift()
  })

  return { current, history }
}
```

**Rules:**

- Named exports only — never `export default`
- Always return a plain object — never a single ref
- All socket subscriptions live inside composables, never directly in a
  component's `<script setup>` — components call `useSystemStats()` /
  `useWebsites()`, they never touch `socket.on` themselves
- Define return type interfaces at the top of the file when the shape isn't
  already covered by `@nodepuls/shared-types`

---

## 11. Scoped Styles

```css
<style scoped>
/* root element — matches component name */
.website-card {
  background: var(--bg2);
  border: var(--border1);
  border-radius: var(--r-2);
  padding: var(--sp-4);
  transition: background 0.2s;
}

/* max two selector levels */
.website-card:hover {
  background: var(--bg3);
}
.website-card:hover .website-card-title {
  color: var(--ac);
}
</style>
```

**Rules:**

- Small, self-contained components (`BaseBadge.vue`, `BaseStatusPill.vue`,
  `WebsiteCard.vue`) always use `<style scoped>`
- If a scoped block would exceed roughly 80–100 lines, consider splitting the
  component into smaller sub-components rather than growing the block
- Class names are prefixed with the component root name: `.website-card-title`
  not `.title`
- Maximum two selector levels deep
- Never use `!important`
- Never hardcode colors, spacing, radii, or font stacks — tokens only

---

## 12. UI Component Patterns

Generic primitives live in `src/components/base/`, named with a `Base` prefix
per Vue's own style guide (components that carry app-specific styling
conventions but no feature knowledge). Fully reusable, no knowledge of any page
or feature, export their own types.

### BaseStatusPill.vue — reference implementation

```vue
<!--
  BaseStatusPill.vue
  Small colored pill showing a website/system status (up / down / checking).
  @example
  <BaseStatusPill status="up" />
-->
<script lang="ts" setup>
defineOptions({ name: 'BaseStatusPill' })

export type PillStatus = 'up' | 'down' | 'checking'

const props = defineProps<{
  /** Which status variant to render */
  status: PillStatus
}>()

const label = computed(
  () => ({ up: 'Up', down: 'Down', checking: 'Checking' })[props.status],
)
</script>

<template>
  <span class="status-pill" :class="`status-pill--${status}`">{{ label }}</span>
</template>

<style scoped>
.status-pill {
  display: inline-flex;
  align-items: center;
  font-family: var(--mono);
  font-size: var(--fs-xs);
  font-weight: 600;
  border-radius: var(--r-2);
  padding: var(--sp-0-5) var(--sp-1-5);
}
.status-pill--up {
  color: var(--ok);
  background: var(--ok-dim);
}
.status-pill--down {
  color: var(--danger);
  background: var(--danger-dim);
}
.status-pill--checking {
  color: var(--warn);
  background: var(--warn-dim);
}
</style>
```

**Rules for all base components:**

- `defineOptions({ name: 'Base...' })` on every primitive, matching the file
  name
- Export prop union types (`PillStatus`) — parents import and reuse them
- CSS modifier classes use BEM-style double dash: `status-pill--up`, never two
  separate classes
- Adding a new status/variant means one line in the type union + one CSS rule

---

## 13. Server Routes & Socket Handlers

### REST routes

One file per resource in `src/routes/`, plain Express routers, no framework
magic — this replaces the Nitro file-based routing v1's Express server never
had, formalizing the pattern the current `server/index.js` already follows.

```ts
// src/routes/websites.route.ts
import { Router } from 'express'
import type { Website } from '@nodepuls/shared-types'
import * as uptimeMonitor from '../services/uptimeMonitor'

export const websitesRouter = Router()

websitesRouter.get('/', async (_req, res) => {
  try {
    const websites = await uptimeMonitor.getWebsites()
    res.json(websites)
  } catch {
    res.status(500).json({ error: 'Failed to fetch websites' })
  }
})

websitesRouter.post('/', async (req, res) => {
  const { name, url } = req.body as Partial<Website>
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' })
  }
  try {
    const website = await uptimeMonitor.addWebsite(name, url)
    res.json(website)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})
```

**Rules:**

- Validate input before calling into a service — never let a service throw the
  first error a route sees
- Errors always return `{ error: string }` with an appropriate status code
- One router per resource, mounted in `index.ts`:
  `app.use('/api/websites', websitesRouter)`

### Socket handlers

Socket event wiring lives in `src/sockets/`, one registration function per
feature area, typed against the shared event contracts:

```ts
// src/sockets/registerWebsiteSocketHandlers.ts
import type { Server, Socket } from 'socket.io'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@nodepuls/shared-types'
import * as uptimeMonitor from '../services/uptimeMonitor'

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>

export function registerWebsiteSocketHandlers(
  io: TypedServer,
  socket: TypedSocket,
) {
  socket.on('addWebsite', async ({ name, url }) => {
    if (!name || !url)
      return socket.emit('error', { message: 'Name and URL are required' })
    try {
      await uptimeMonitor.addWebsite(name, url)
      io.emit('websites', await uptimeMonitor.getWebsites())
    } catch (error) {
      socket.emit('error', { message: (error as Error).message })
    }
  })
}
```

**Rules:**

- `index.ts` only calls `registerXSocketHandlers(io, socket)` inside
  `io.on('connection', ...)` — it never contains inline event logic itself
- Typing the server/socket generically against `ClientToServerEvents`/
  `ServerToClientEvents` is what turns a typo'd event name into a compile error
  instead of a silent no-op at runtime

---

## 14. Shared Types

Types in `packages/shared-types/src/` are imported by both the Vue client and
the Express server via the `@nodepuls/shared-types` path alias.

```ts
// packages/shared-types/src/website.ts

export interface HistoryEntry {
  timestamp: string
  status: string
  responseTime: number | null
}

export interface Website {
  id: string
  name: string
  url: string
  status: 'up' | 'down' | 'checking'
  responseTime?: number
  lastCheck: number
  upSince: number | null
  uptime: number
  history?: HistoryEntry[]
}
```

```ts
// packages/shared-types/src/socket-events.ts
import type { SystemData } from './system'
import type { Website } from './website'

export interface ServerToClientEvents {
  systemUpdate: (data: SystemData) => void
  websites: (websites: Website[]) => void
  error: (payload: { message: string }) => void
}

export interface ClientToServerEvents {
  addWebsite: (payload: { name: string; url: string }) => void
  removeWebsite: (id: string) => void
  updateWebsite: (payload: { id: string; name: string; url: string }) => void
  updateWebsiteOrder: (ids: string[]) => void
  clearWebsiteHistory: (payload: { id: string }) => void
}
```

---

## 15. vite.config.ts

```ts
// apps/client/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // No manual alias for @nodepuls/shared-types — it resolves through the
  // normal workspace node_modules symlink, same as any npm dependency.
  server: {
    proxy: {
      '/api': 'http://localhost:3020',
      '/socket.io': { target: 'http://localhost:3020', ws: true },
    },
  },
  build: {
    outDir: 'dist',
    // Keep the client bundle small and dependency-transparent — this
    // is the one build-tool knob that most directly protects the
    // "small footprint" goal, so don't remove it if new deps are added.
    reportCompressedSize: true,
  },
})
```

---

## 16. Prettier

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false,
  "singleAttributePerLine": false,
  "overrides": [
    { "files": ["*.css"], "options": { "singleQuote": false } },
    {
      "files": ["*.md"],
      "options": { "printWidth": 80, "proseWrap": "always" }
    }
  ]
}
```

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

---

## 17. ESLint

Flat config format (ESLint 9+). There's no Nuxt module to wrap the config here,
so `eslint-plugin-vue` and `typescript-eslint` are set up directly.

```ts
// eslint.config.ts
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tseslint.parser },
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
    rules: {
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/define-macros-order': [
        'error',
        {
          order: ['defineOptions', 'defineProps', 'defineEmits'],
          defineExposeLast: true,
        },
      ],
      'vue/no-unused-vars': 'error',
      'vue/require-default-prop': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug'] }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
)
```

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix"
```

---

## 18. Git & Commits

Format: `type(scope): message` — lowercase, present tense, no trailing period.
Scope is the feature area: `system`, `websites`, `charts`, `server`, `docker`,
`tokens`.

```
feat(websites):  add JSON import/export menu
feat(charts):    port adaptive per-metric scaling to Recharts config
fix(server):     handle missing DB_PATH gracefully on first boot
fix(websites):   debounce reorder socket event at 300ms
style(tokens):   add --danger-dim for down-status backgrounds
refactor(charts): split ResourceChart into a single reusable component
perf(server):    switch sqlite3 → better-sqlite3
docs:            add v2 code guidelines
chore:           set up pnpm workspaces
```

---

## 19. What to Avoid

| Avoid                                            | Use instead                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| `<style>` without `scoped`                       | `<style scoped>`                                                               |
| Hardcoded hex/px in component CSS                | CSS custom properties from `base.css`                                          |
| `ref(null)` for DOM elements                     | `useTemplateRef<T>('name')`                                                    |
| `reactive()` for component state                 | `ref()`                                                                        |
| `defineProps` array syntax                       | TypeScript generic syntax                                                      |
| Emitting/handling sockets inside a component     | A composable (`useSocket`, `useSystemStats`, etc.)                             |
| `defineEmits(['event'])` array form              | `defineEmits<{...}>()`                                                         |
| Rendering `{{ optional ?? '' }}` in templates    | `v-if="optional"`                                                              |
| Default export in composables                    | `export function useX()`                                                       |
| `throw new Error()` in route handlers            | `res.status(code).json({ error })`                                             |
| Untyped `io`/`socket` instances                  | `Server<ClientToServerEvents, ServerToClientEvents>`                           |
| A new state library (Pinia, etc.) "just in case" | Composables — introduce Pinia only if state sharing genuinely becomes unwieldy |
| Committing `.env` or `*.db`                      | `.env.example` / `.gitkeep` only                                               |
