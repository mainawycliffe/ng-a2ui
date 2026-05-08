import type { Type } from '@angular/core';
import type { ComponentName } from '@shared/schema';
import { FlightComparisonCard } from '../components/flight-comparison-card';
import { SeatMapCard } from '../components/seat-map-card';
import { PassengerFormCard } from '../components/passenger-form-card';
import { PaymentCard } from '../components/payment-card';
import { BookingConfirmationCard } from '../components/booking-confirmation-card';

export const COMPONENT_REGISTRY: Record<ComponentName, Type<unknown>> = {
  FlightComparisonCard,
  SeatMapCard,
  PassengerFormCard,
  PaymentCard,
  BookingConfirmationCard,
};
