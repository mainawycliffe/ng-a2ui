## ng-a2ui

A talk-demo prototype showing **agent-driven dynamic UI** in Angular 21: a Genkit + Gemini 3 Flash backend decides which Angular component to render, and the frontend materializes it via `ngComponentOutlet` from an allow-listed registry.

### What it shows

- A schema-driven contract between agent and UI (`RenderInstruction` discriminated union, validated with Zod).
- A bidirectional loop: components emit interactions through an `AgentBus` service; the host forwards them as the next user turn.
- 5 interactive cards walking the user through a flight booking: **FlightComparison → SeatMap → PassengerForm → Payment → Confirmation**.
- A live JSON drawer showing the raw agent payload that drove each render — the talk's "money shot."

### Setup

```bash
cp .env.example .env
# add your GEMINI_API_KEY (https://aistudio.google.com/apikey)

npm install
npm run dev   # starts Angular on :4200 and the Genkit agent on :3001
```

Then open `http://localhost:4200`. Try: *"Fly Nairobi to Mombasa Friday under 8,000 KES"*.

### Architecture

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

server/
  schema.ts   Zod schemas, source of truth for both ends
  index.ts    Express + Genkit defineFlow, gemini-3-flash-preview
```

### How a turn works

1. User types text **or** a card emits an `AgentBus` event.
2. `AiUiHost` appends it to `messages` and POSTs to `/agent`.
3. Genkit calls Gemini 3 Flash with the conversation + Zod `outputSchema`.
4. Response is either `{kind:"text"}` or `{kind:"component", instruction:{...}}`.
5. Host looks up the component class in the registry and renders it via `*ngComponentOutlet`.
6. Card listens to user input and emits to `AgentBus` — back to step 1.
