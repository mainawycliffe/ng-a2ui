import type { Type } from '@angular/core';
import type { ComponentName } from '@shared/schema';
import { BookingConfirmationCard } from '../components/booking-confirmation-card';
import { DataTableCard } from '../components/data-table-card';
import { FlightComparisonCard } from '../components/flight-comparison-card';
import { PassengerFormCard } from '../components/passenger-form-card';
import { PaymentCard } from '../components/payment-card';
import { SeatMapCard } from '../components/seat-map-card';

/**
 * The COMPONENT_REGISTRY maps string identifiers received from the AI agent
 * to actual Angular component classes.
 *
 * WHY: Angular's `NgComponentOutlet` requires a component Type to render.
 * Since the AI agent only knows about component names (strings) as defined
 * in the shared schema, this registry acts as the essential bridge for
 * Server-Driven UI (SDUI).
 */
export const COMPONENT_REGISTRY: Record<
  ComponentName,
  Type<
    | FlightComparisonCard
    | SeatMapCard
    | PassengerFormCard
    | PaymentCard
    | BookingConfirmationCard
    | DataTableCard
  >
> = {
  FlightComparisonCard,
  SeatMapCard,
  PassengerFormCard,
  PaymentCard,
  BookingConfirmationCard,
  DataTableCard,
};
