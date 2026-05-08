import { Component, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AgentBus } from '../agent/agent-bus';
import type { RenderInstruction } from '@shared/schema';

type Props = Extract<RenderInstruction, { component: 'FlightComparisonCard' }>['props'];

/**
 * Lists available flights for comparison.
 * Supports highlighting flights under a specific budget as requested by the agent.
 */
@Component({
  selector: 'app-flight-comparison-card',
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-baseline justify-between">
        <h3 class="text-lg font-semibold">{{ origin() }} → {{ destination() }}</h3>
        <span class="text-sm text-slate-500">{{ date() }}</span>
      </div>
      @if (highlightUnder()) {
        <div class="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Highlighting fares under {{ highlightUnder() | number }} KES
        </div>
      }
      <ul class="space-y-2">
        @for (f of flights(); track f.id) {
          <li>
            <button
              (click)="select(f)"
              class="flex w-full items-center justify-between rounded-xl border p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-50"
              [class.border-emerald-400]="isUnder(f.price)"
              [class.bg-emerald-50]="isUnder(f.price)"
              [class.border-slate-200]="!isUnder(f.price)"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ f.airline }}</span>
                  @if (f.recommended) {
                    <span class="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">recommended</span>
                  }
                </div>
                <div class="mt-1 text-sm text-slate-500">
                  {{ f.departureTime }} – {{ f.arrivalTime }} · {{ f.durationMinutes }} min
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-semibold">{{ f.price | number }} KES</div>
                <div class="text-xs text-indigo-600">Select →</div>
              </div>
            </button>
          </li>
        }
      </ul>
    </div>
  `,
  imports: [DecimalPipe],
})
export class FlightComparisonCard {
  origin = input.required<Props['origin']>();
  destination = input.required<Props['destination']>();
  date = input.required<Props['date']>();
  flights = input.required<Props['flights']>();
  highlightUnder = input<Props['highlightUnder']>(undefined);

  private bus = inject(AgentBus);

  isUnder(price: number) {
    const t = this.highlightUnder();
    return t !== undefined && price < t;
  }

  select(f: Props['flights'][number]) {
    this.bus.emit({ type: 'FLIGHT_SELECTED', flightId: f.id, airline: f.airline, price: f.price });
  }
}
