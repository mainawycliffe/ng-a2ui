import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { RenderInstruction } from '@shared/schema';

type Props = Extract<RenderInstruction, { component: 'BookingConfirmationCard' }>['props'];

/**
 * Displays a success message and summary after a booking is finalized.
 */
@Component({
  selector: 'app-booking-confirmation-card',
  template: `
    <div class="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
      <div class="mb-4 flex items-center gap-3">
        <div class="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white">
          <svg viewBox="0 0 24 24" fill="none" class="size-6"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold">Booking confirmed</h3>
          <p class="text-sm text-slate-500">Reference {{ bookingRef() }}</p>
        </div>
      </div>

      <dl class="grid grid-cols-2 gap-3 rounded-xl bg-white p-4 text-sm">
        <div>
          <dt class="text-xs text-slate-500">Passenger</dt>
          <dd class="font-medium">{{ passenger() }}</dd>
        </div>
        <div>
          <dt class="text-xs text-slate-500">Flight</dt>
          <dd class="font-medium">{{ flight() }}</dd>
        </div>
        <div>
          <dt class="text-xs text-slate-500">Seat</dt>
          <dd class="font-medium">{{ seat() }}</dd>
        </div>
        <div>
          <dt class="text-xs text-slate-500">Total paid</dt>
          <dd class="font-medium">{{ totalPaid() | number }} {{ currency() }}</dd>
        </div>
      </dl>

      <p class="mt-4 text-xs text-slate-500">A confirmation has been sent to your email. Have a great flight ✈</p>
    </div>
  `,
  imports: [DecimalPipe],
})
export class BookingConfirmationCard {
  bookingRef = input.required<Props['bookingRef']>();
  passenger  = input.required<Props['passenger']>();
  flight     = input.required<Props['flight']>();
  seat       = input.required<Props['seat']>();
  totalPaid  = input.required<Props['totalPaid']>();
  currency   = input.required<Props['currency']>();
}
