import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type AgentEvent =
  | { type: 'FLIGHT_SELECTED'; flightId: string; airline: string; price: number }
  | { type: 'SEAT_SELECTED'; flightId: string; seatId: string }
  | { type: 'PASSENGER_SUBMITTED'; flightId: string; seatId: string; passenger: Record<string, string> }
  | { type: 'PAYMENT_CONFIRMED'; amount: number; currency: string };

/**
 * The AgentBus is a centralized event stream used to decouple dynamically rendered 
 * UI components (via NgComponentOutlet) from the main application host.
 * 
 * WHY: Since the components in the `components/` directory are instantiated 
 * dynamically based on AI instructions, they cannot use standard @Output 
 * bindings to communicate with the host. The AgentBus provides a type-safe 
 * way for these components to signal user actions back to the AI agent.
 */
@Injectable({ providedIn: 'root' })
export class AgentBus {
  readonly events = new Subject<AgentEvent>();
  emit(event: AgentEvent) { this.events.next(event); }
}
