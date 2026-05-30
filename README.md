## ng-a2ui

A talk-demo prototype showing **agent-driven dynamic UI** in Angular: a Genkit + Gemini 3 Flash backend decides which Angular component to render, and the frontend materializes it via `ngComponentOutlet` from an allow-listed registry.

> Talk: **"More Than Meets the Eye: Building UIs that Transform"** — slides live in [`slides/`](slides/).

### What it shows

- A schema-driven contract between agent and UI (`RenderInstruction` discriminated union, validated with Zod).
- A bidirectional loop: components emit interactions through an `AgentBus` service; the host forwards them as the next user turn.
- 5 interactive cards walking the user through a flight booking: **FlightComparison → SeatMap → PassengerForm → Payment → Confirmation**.
- A 6th, on-demand `DataTableCard` — a generic **sortable + expandable** table whose sort/expand state is pure local signals (no agent round-trip).
- A live JSON drawer showing the raw agent payload that drove each render — the talk's "money shot."

## Running the demo

Requires Node 20+ and a free Gemini API key.

```bash
cp .env.example .env
# add your GEMINI_API_KEY (https://aistudio.google.com/apikey)

npm install
npm run dev   # starts Angular on :4200 and the Genkit agent on :3001
```

Then open `http://localhost:4200`. Try:

- *"Fly Nairobi to Mombasa Friday under 8,000 KES"* — walks the booking flow.
- *"Compare those flights in a table"* — renders the on-demand `DataTableCard`; click a header to sort, a row to expand.

### Useful scripts

| Script          | What it does                                          |
| --------------- | ----------------------------------------------------- |
| `npm run dev`   | Web (`:4200`) + agent (`:3001`) together, hot-reload  |
| `npm run web`   | Angular dev server only                               |
| `npm run agent` | Genkit/Express agent only                             |
| `npm run build` | Production build of the Angular app                   |

## Running the slides

The talk deck is a self-contained [Slidev](https://sli.dev) project — its dependencies are isolated from the Angular app.

```bash
cd slides
npm install
npm run dev      # serves the deck at http://localhost:3030
npm run export   # optional: export slides to PDF
```

Edit [`slides/slides.md`](slides/slides.md). The animated cover illustration is a Vue component at [`slides/components/A2uiHero.vue`](slides/components/A2uiHero.vue); Angular-branded styling lives in [`slides/style.css`](slides/style.css).

## Architecture

```
src/app/
  agent/
    agent-bus.ts          AgentBus — Subject-based event channel
    agent-client.ts       HTTP client → POST /agent
    component-registry.ts Allow-listed name → component class map
  components/
    ai-ui-host.ts         Chat + ngComponentOutlet pane + JSON drawer
    flight-comparison-card.ts
    seat-map-card.ts
    passenger-form-card.ts
    payment-card.ts
    booking-confirmation-card.ts
    data-table-card.ts    Generic sortable + expandable table (on-demand)

server/
  schema.ts   Zod schemas, source of truth for both ends
  index.ts    Express + Genkit defineFlow, gemini-3-flash-preview

slides/       Slidev talk deck (own package.json)
```

The Angular app imports the backend's Zod types directly via the `@shared/*` path alias (see `tsconfig.json`), so the contract can never drift between the two ends.

### How a turn works

1. User types text **or** a card emits an `AgentBus` event.
2. `AiUiHost` appends it to `messages` and POSTs to `/agent`.
3. Genkit calls Gemini 3 Flash with the conversation + Zod `outputSchema`.
4. Response is either `{kind:"text"}` or `{kind:"component", instruction:{...}}`.
5. Host looks up the component class in the registry and renders it via `*ngComponentOutlet`.
6. Card listens to user input and emits to `AgentBus` — back to step 1.

### Adding a new agent-renderable component

The whole extension path is three steps (this is how `DataTableCard` was added):

1. Add a props schema + a variant to the `RenderInstruction` union in `server/schema.ts`.
2. Add the component class to `COMPONENT_REGISTRY` in `component-registry.ts` (the typed map won't compile until you do).
3. Build the standalone component in `src/app/components/`, typing its inputs from the schema via `Extract<RenderInstruction, { component: '…' }>['props']`.

### Tech

Angular · Genkit 1.33 + `gemini-3-flash-preview` · Zod 4 · Tailwind 4 · Express 5.
