# NodePuls v2

A full rewrite of [NodePuls](https://github.com/smrini/NodePuls) - Diffrent
technologies, and diffrent code...

See `NodePuls-Rewrite-Plan.md`, `NodePuls-Code-Guidelines.md`, and
`NodePuls-Design-Guidelines.html` for the full plan/conventions/visual spec this
scaffold follows.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

This starts two watchers together: `server` (tsx watch on port 3020) and
`client` (Vite dev server, default port 5173, proxying `/api` and
`/socket.io` to the server). Open the Vite URL it prints.

## Scripts

| Command                                   | Does                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `npm run dev`                             | Runs shared-types/server/client together, watching                                              |
| `npm run build`                           | Builds shared-types, client, and server, then copies the client build into `apps/server/public` |
| `npm start`                               | Runs the built server (serves the built client too)                                             |
| `npm run typecheck`                       | Type-checks all three packages                                                                  |
| `npm run lint` / `npm run lint:fix`       | ESLint across the repo                                                                          |
| `npm run format` / `npm run format:check` | Prettier across the repo                                                                        |
| `npm run clean`                           | Removes all build outputs                                                                       |

Each package can also be run individually with npm's `--workspace` flag, e.g.
`npm run dev --workspace=@nodepuls/server`.