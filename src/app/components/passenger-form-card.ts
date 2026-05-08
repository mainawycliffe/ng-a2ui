import { Component, computed, inject, input, signal } from '@angular/core';
import { AgentBus } from '../agent/agent-bus';
import type { RenderInstruction } from '@shared/schema';

type Props = Extract<RenderInstruction, { component: 'PassengerFormCard' }>['props'];

const LABELS: Record<string, { label: string; type: string; placeholder: string }> = {
  firstName: { label: 'First name', type: 'text',  placeholder: 'Wycliffe' },
  lastName:  { label: 'Last name',  type: 'text',  placeholder: 'Maina' },
  email:     { label: 'Email',      type: 'email', placeholder: 'you@example.com' },
  phone:     { label: 'Phone',      type: 'tel',   placeholder: '+254 7XX XXX XXX' },
  passport:  { label: 'Passport #', type: 'text',  placeholder: 'A12345678' },
};

/**
 * Renders a dynamic form for capturing passenger details.
 * The fields are driven by the AI agent's requirements.
 */
@Component({
  selector: 'app-passenger-form-card',
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 class="mb-1 text-lg font-semibold">Passenger details</h3>
      <p class="mb-4 text-sm text-slate-500">Seat {{ seatId() }} · flight {{ flightId() }}</p>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        @for (field of fields(); track field) {
          <label class="block">
            <span class="mb-1 block text-xs font-medium text-slate-600">{{ labelFor(field) }}</span>
            <input
              [type]="typeFor(field)"
              [placeholder]="placeholderFor(field)"
              [value]="values()[field] || ''"
              (input)="set(field, $any($event.target).value)"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        }
      </div>

      <button
        (click)="submit()"
        [disabled]="!isValid()"
        class="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white disabled:bg-slate-300"
      >Continue to payment</button>
    </div>
  `,
  imports: [],
})
export class PassengerFormCard {
  flightId = input.required<Props['flightId']>();
  seatId   = input.required<Props['seatId']>();
  fields   = input.required<Props['fields']>();

  values = signal<Record<string, string>>({});
  private bus = inject(AgentBus);

  isValid = computed(() => this.fields().every((f) => (this.values()[f] ?? '').trim().length > 1));

  labelFor(f: string)       { return LABELS[f]?.label ?? f; }
  typeFor(f: string)        { return LABELS[f]?.type ?? 'text'; }
  placeholderFor(f: string) { return LABELS[f]?.placeholder ?? ''; }

  set(field: string, value: string) {
    this.values.update((v) => ({ ...v, [field]: value }));
  }

  /** Emits the passenger data to the AgentBus for the next step. */
  submit() {
    if (!this.isValid()) return;
    this.bus.emit({
      type: 'PASSENGER_SUBMITTED',
      flightId: this.flightId(),
      seatId: this.seatId(),
      passenger: this.values(),
    });
  }
}
