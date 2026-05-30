import { googleAI } from '@genkit-ai/google-genai';
import cors from 'cors';
import express from 'express';
import { genkit, GenkitError, Part } from 'genkit';
import { AgentRequest, AgentResponse } from './schema';

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-3-flash-preview'),
});

const SYSTEM = `You are a flight booking assistant for travel between Kenyan cities.
Your job is to drive a UI by deciding which component to render next.
You MUST output a valid JSON object matching the AgentResponse schema.

CRITICAL: ALL NESTED OBJECTS MUST BE PURE JSON.
- "instruction" MUST be a JSON OBJECT { ... }.
- "instruction.props" MUST be a JSON OBJECT { ... }.
- NEVER wrap a JSON object in quotes to make it a string.

NEVER DO THIS (WRONG):
{ "kind": "component", "instruction": "{ \\"component\\": ... }" }

ALWAYS DO THIS (RIGHT):
{ "kind": "component", "instruction": { "component": "FlightComparisonCard", "message": "...", "props": { ... } } }

Booking flow:


1. First user travel request -> component: "FlightComparisonCard".
   Generate 3 plausible flights (Kenya Airways, Jambojet, Safarilink, Fly540).
   Prices in KES. Mark the cheapest matching flight with recommended: true if a budget was mentioned.

2. After "event: FLIGHT_SELECTED" -> component: "SeatMapCard".
   rows: 12, seatsPerRow: 6, 8-12 occupied seats, premium: ["1A","1B","1C","1D","1E","1F"].

3. After "event: SEAT_SELECTED" -> component: "PassengerFormCard".
   fields: ["firstName","lastName","email","passport"].

4. After "event: PASSENGER_SUBMITTED" -> component: "PaymentCard".
   amount = chosen flight's price; currency = "KES".

5. After "event: PAYMENT_CONFIRMED" -> component: "BookingConfirmationCard".
   Generate a booking reference like "KQ-7H3K9P".

On-demand (NOT a numbered step):
- If the user asks to compare options in a table, see a side-by-side, or get a breakdown
  (e.g. "compare those flights in a table", "show the fare breakdown") -> component: "DataTableCard".
  Build "columns" (1-6) and "rows" (1-10) from the relevant context.
  Each row's "cells" array MUST be in the same order as "columns" and have the same length.
  Use "align": "right" for numeric/price columns. Put extra per-row info (baggage, fare rules,
  layovers) in the optional "detail" field so the user can expand the row.

Maintain context of the booking (flight, seat, details) throughout the conversation.`;

const agentFlow = ai.defineFlow(
  {
    name: 'agentFlow',
    inputSchema: AgentRequest,
    outputSchema: AgentResponse,
  },
  async ({ messages }) => {
    const formattedMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      content: [{ text: m.content } satisfies Part],
    }));

    try {
      const { output } = await ai.generate({
        system: SYSTEM,
        messages: formattedMessages,
        output: { schema: AgentResponse },
      });

      if (!output) {
        return {
          kind: 'text',
          text: "I'm sorry, I couldn't generate a proper response. Please try again or rephrase your request.",
        };
      }

      return output;
    } catch (err) {
      console.error('Agent generation error:', err);

      // Handle specific Genkit/AI errors if needed
      if (err instanceof GenkitError) {
        return {
          kind: 'text',
          text: `Technical issue (${err.status}): I'm having trouble connecting to my brain right now.`,
        };
      }

      return {
        kind: 'text',
        text: "I encountered an unexpected error while processing your request. Let's try again.",
      };
    }
  },
);

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/agent', async (req, res) => {
  try {
    const parsed = AgentRequest.parse(req.body);
    const result = await agentFlow(parsed);
    res.json(result);
  } catch (err) {
    console.error('Express route error:', err);

    if (err instanceof Error && err.name === 'ZodError') {
      res.status(400).json({
        error: 'Invalid request format',
        details: (err as any).errors,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`agent listening on http://localhost:${port}`));
