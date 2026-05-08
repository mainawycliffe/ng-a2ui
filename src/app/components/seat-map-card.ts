import { Component, computed, inject, input, signal } from '@angular/core';
import { AgentBus } from '../agent/agent-bus';
import type { RenderInstruction } from '@shared/schema';

type Props = Extract<RenderInstruction, { component: 'SeatMapCard' }>['props'];

@Component({
  selector: 'app-seat-map-card',
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 class="mb-1 text-lg font-semibold">Choose your seat</h3>
      <p class="mb-4 text-sm text-slate-500">Tap an available seat. Premium seats are highlighted gold.</p>

      <div class="mx-auto max-w-md">
        @for (row of rowsArray(); track row) {
          <div class="mb-1 flex items-center justify-center gap-1">
            <span class="w-6 text-right text-xs text-slate-400">{{ row }}</span>
            @for (col of colsArray(); track col; let idx = $index) {
              @let id = row + col;
              <button
                (click)="pick(id)"
                [disabled]="isOccupied(id)"
                [class]="seatClass(id)"
              >{{ col }}</button>
              @if (idx === 2) { <span class="w-3"></span> }
            }
          </div>
        }
      </div>

      <div class="mt-4 flex items-center justify-between">
        <div class="flex gap-3 text-xs text-slate-500">
          <span class="flex items-center gap-1"><span class="size-3 rounded bg-slate-200"></span> available</span>
          <span class="flex items-center gap-1"><span class="size-3 rounded bg-amber-300"></span> premium</span>
          <span class="flex items-center gap-1"><span class="size-3 rounded bg-slate-400"></span> taken</span>
        </div>
        <button
          (click)="confirm()"
          [disabled]="!selected()"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300"
        >Confirm {{ selected() }}</button>
      </div>
    </div>
  `,
  imports: [],
})
export class SeatMapCard {
  flightId = input.required<Props['flightId']>();
  rows = input.required<Props['rows']>();
  seatsPerRow = input.required<Props['seatsPerRow']>();
  occupied = input.required<Props['occupied']>();
  premium = input<Props['premium']>([]);

  selected = signal<string | null>(null);
  private bus = inject(AgentBus);

  rowsArray = computed(() => Array.from({ length: this.rows() }, (_, i) => i + 1));
  colsArray = computed(() => ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, this.seatsPerRow()));

  isOccupied(id: string) { return this.occupied().includes(id); }
  isPremium(id: string)  { return (this.premium() ?? []).includes(id); }
  isSelected(id: string) { return this.selected() === id; }

  seatClass(id: string) {
    const base = 'size-8 rounded text-xs font-medium transition';
    if (this.isOccupied(id))  return `${base} bg-slate-400 text-white cursor-not-allowed`;
    if (this.isSelected(id))  return `${base} bg-indigo-600 text-white ring-2 ring-indigo-300`;
    if (this.isPremium(id))   return `${base} bg-amber-300 hover:bg-amber-400`;
    return `${base} bg-slate-200 hover:bg-slate-300`;
  }

  pick(id: string) { if (!this.isOccupied(id)) this.selected.set(id); }

  confirm() {
    const id = this.selected();
    if (!id) return;
    this.bus.emit({ type: 'SEAT_SELECTED', flightId: this.flightId(), seatId: id });
  }
}
