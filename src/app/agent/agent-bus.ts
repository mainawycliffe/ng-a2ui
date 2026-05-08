import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type AgentEvent =
  | { type: 'FLIGHT_SELECTED'; flightId: string; airline: string; price: number }
  | { type: 'SEAT_SELECTED'; flightId: string; seatId: string }
  | { type: 'PASSENGER_SUBMITTED'; flightId: string; seatId: string; passenger: Record<string, string> }
  | { type: 'PAYMENT_CONFIRMED'; amount: number; currency: string };

@Injectable({ providedIn: 'root' })
export class AgentBus {
  readonly events = new Subject<AgentEvent>();
  emit(event: AgentEvent) { this.events.next(event); }
}
