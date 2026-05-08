import { z } from 'genkit';

const Flight = z
  .object({
    id: z.string().describe('Unique flight code such as "KQ-303" or "JM-902".'),
    airline: z
      .string()
      .describe('Operating airline. One of: Kenya Airways, Jambojet, Safarilink, Fly540.'),
    price: z
      .number()
      .describe('Ticket price in Kenyan Shillings (KES). Plain number, no currency symbol.'),
    departureTime: z
      .string()
      .describe('Departure time as a 12-hour clock string, e.g. "08:00 AM".'),
    arrivalTime: z.string().describe('Arrival time as a 12-hour clock string, e.g. "09:30 AM".'),
    durationMinutes: z.number().describe('Total flight duration in minutes.'),
    recommended: z
      .boolean()
      .optional()
      .describe(
        "True for the cheapest flight that matches the user's budget; otherwise false or omitted.",
      ),
  })
  .describe('A single flight option. All fields are required except "recommended".');

const FlightComparisonProps = z
  .object({
    origin: z.string().describe('Departure city, e.g. "Nairobi".'),
    destination: z.string().describe('Arrival city, e.g. "Mombasa".'),
    date: z.string().describe('Travel date in YYYY-MM-DD format.'),
    highlightUnder: z
      .number()
      .optional()
      .describe('Optional KES budget ceiling to visually emphasise on the card.'),
    flights: z
      .array(Flight)
      .min(2)
      .max(5)
      .describe(
        'Between 2 and 5 flight options. Must be an inline JSON array of Flight OBJECTS — never a string.',
      ),
  })
  .describe(
    'Props object for FlightComparisonCard. Must be an inline JSON object — never a string.',
  );

const SeatMapProps = z
  .object({
    flightId: z
      .string()
      .describe('Identifier of the flight the user selected in the previous step.'),
    rows: z.number().min(6).max(20).describe('Total seat rows on the aircraft. Typically 12.'),
    seatsPerRow: z.number().min(4).max(6).describe('Seats per row. Typically 6 (A–F).'),
    occupied: z
      .array(z.string())
      .describe('Already-taken seat labels like ["3A","5C","7F"]. 8–12 entries.'),
    premium: z
      .array(z.string())
      .optional()
      .describe(
        'Premium seat labels, typically the front row e.g. ["1A","1B","1C","1D","1E","1F"].',
      ),
  })
  .describe('Props object for SeatMapCard. Must be an inline JSON object — never a string.');

const PassengerFormProps = z
  .object({
    flightId: z.string().describe('Identifier of the previously selected flight.'),
    seatId: z.string().describe('Identifier of the previously selected seat, e.g. "12C".'),
    fields: z
      .array(z.enum(['firstName', 'lastName', 'email', 'phone', 'passport']))
      .describe('Form fields to render, in order.'),
  })
  .describe('Props object for PassengerFormCard. Must be an inline JSON object — never a string.');

const PaymentProps = z
  .object({
    amount: z.number().describe('Amount to charge, in the given currency.'),
    currency: z.string().describe('ISO 4217 currency code, e.g. "KES".'),
    summary: z.string().describe('Short user-facing description of what they are paying for.'),
  })
  .describe('Props object for PaymentCard. Must be an inline JSON object — never a string.');

const BookingConfirmationProps = z
  .object({
    bookingRef: z.string().describe('Generated booking reference like "KQ-7H3K9P".'),
    passenger: z.string().describe('Passenger full name.'),
    flight: z
      .string()
      .describe('Human-readable flight summary, e.g. "Kenya Airways KQ-303 NBO→MBA".'),
    seat: z.string().describe('Seat label, e.g. "12C".'),
    totalPaid: z.number().describe('Total amount paid.'),
    currency: z.string().describe('ISO 4217 currency code, e.g. "KES".'),
  })
  .describe(
    'Props object for BookingConfirmationCard. Must be an inline JSON object — never a string.',
  );

export const RenderInstruction = z
  .discriminatedUnion('component', [
    z
      .object({
        component: z
          .literal('FlightComparisonCard')
          .describe('Selects the FlightComparisonCard variant.'),
        message: z.string().describe('One short conversational sentence shown above the card.'),
        props: FlightComparisonProps,
      })
      .describe('Render a flight comparison card. Used on the first travel request.'),
    z
      .object({
        component: z.literal('SeatMapCard').describe('Selects the SeatMapCard variant.'),
        message: z.string().describe('One short conversational sentence shown above the card.'),
        props: SeatMapProps,
      })
      .describe('Render a seat map. Used after FLIGHT_SELECTED.'),
    z
      .object({
        component: z
          .literal('PassengerFormCard')
          .describe('Selects the PassengerFormCard variant.'),
        message: z.string().describe('One short conversational sentence shown above the card.'),
        props: PassengerFormProps,
      })
      .describe('Render a passenger details form. Used after SEAT_SELECTED.'),
    z
      .object({
        component: z.literal('PaymentCard').describe('Selects the PaymentCard variant.'),
        message: z.string().describe('One short conversational sentence shown above the card.'),
        props: PaymentProps,
      })
      .describe('Render a payment card. Used after PASSENGER_SUBMITTED.'),
    z
      .object({
        component: z
          .literal('BookingConfirmationCard')
          .describe('Selects the BookingConfirmationCard variant.'),
        message: z.string().describe('One short conversational sentence shown above the card.'),
        props: BookingConfirmationProps,
      })
      .describe('Render a booking confirmation. Used after PAYMENT_CONFIRMED.'),
  ])
  .describe(
    'A render instruction. MUST be an inline JSON object with keys component/message/props — never a string and never the literal text "FlightComparisonCard".',
  );

export const AgentResponse = z
  .discriminatedUnion('kind', [
    z
      .object({
        kind: z
          .literal('text')
          .describe(
            'Use "text" only when you cannot proceed (e.g. user asks an unrelated question).',
          ),
        text: z.string().describe('The plain-text reply to show in the chat.'),
      })
      .describe('Free-text reply. Use sparingly.'),
    z
      .object({
        kind: z
          .literal('component')
          .describe('Use "component" for almost every turn — it renders a UI card.'),
        instruction: RenderInstruction,
      })
      .describe(
        'Render-a-component reply. The instruction field is a NESTED JSON OBJECT, not a string.',
      ),
  ])
  .describe(
    'The agent response. Top-level keys are EXACTLY "kind" plus either "text" (when kind="text") or "instruction" (when kind="component"). Never use "renderInstruction". Never flatten props or instruction onto the top level. Never stringify nested objects.',
  );

export const Message = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const AgentRequest = z.object({
  messages: z.array(Message),
});

export type Message = z.infer<typeof Message>;
export type AgentRequest = z.infer<typeof AgentRequest>;
export type AgentResponse = z.infer<typeof AgentResponse>;
export type RenderInstruction = z.infer<typeof RenderInstruction>;
export type ComponentName = RenderInstruction['component'];
