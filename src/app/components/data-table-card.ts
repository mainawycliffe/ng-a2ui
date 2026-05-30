import { Component, computed, input, signal } from '@angular/core';
import type { RenderInstruction } from '@shared/schema';

type Props = Extract<RenderInstruction, { component: 'DataTableCard' }>['props'];
type Row = Props['rows'][number];

/**
 * A generic, agent-rendered data table.
 *
 * Sorting and row expansion are entirely LOCAL UI state (signals) — there is no
 * AgentBus event and no round-trip to the agent. This makes it the cleanest
 * showcase of modern Angular reactivity: a `computed()` derives the sorted view,
 * and a `signal<Set<number>>` tracks which rows are expanded.
 */
@Component({
  selector: 'app-data-table-card',
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      @if (title()) {
        <h3 class="mb-4 text-lg font-semibold">{{ title() }}</h3>
      }
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500">
              <th class="w-8"></th>
              @for (col of columns(); track $index) {
                <th
                  class="px-3 py-2 font-medium"
                  [class.text-right]="col.align === 'right'"
                  [class.text-left]="col.align !== 'right'"
                >
                  @if (col.sortable !== false) {
                    <button
                      type="button"
                      (click)="sortBy($index)"
                      class="inline-flex items-center gap-1 hover:text-indigo-600"
                    >
                      <span>{{ col.label }}</span>
                      <span class="text-xs text-indigo-500">{{ sortCaret($index) }}</span>
                    </button>
                  } @else {
                    <span>{{ col.label }}</span>
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of sortedRows(); track $index) {
              <tr
                class="border-b border-slate-100 transition"
                [class.cursor-pointer]="!!row.detail"
                [class.hover:bg-slate-50]="!!row.detail"
                (click)="row.detail && toggle($index)"
              >
                <td class="px-2 py-2 text-center text-slate-400">
                  @if (row.detail) {
                    <span class="text-xs">{{ expanded().has($index) ? '▾' : '▸' }}</span>
                  }
                </td>
                @for (cell of row.cells; track i; let i = $index) {
                  <td
                    class="px-3 py-2"
                    [class.text-right]="columns()[i]?.align === 'right'"
                    [class.font-medium]="i === 0"
                  >
                    {{ cell }}
                  </td>
                }
              </tr>
              @if (row.detail && expanded().has($index)) {
                <tr class="border-b border-slate-100 bg-slate-50">
                  <td></td>
                  <td [attr.colspan]="columns().length" class="px-3 py-2 text-sm text-slate-600">
                    {{ row.detail }}
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DataTableCard {
  title = input<Props['title']>(undefined);
  columns = input.required<Props['columns']>();
  rows = input.required<Props['rows']>();

  /** Index of the column currently sorted by, or null for the agent's original order. */
  sortIndex = signal<number | null>(null);
  sortDir = signal<'asc' | 'desc'>('asc');

  /** Indices (into the original rows) of rows whose detail panel is open. */
  expanded = signal<Set<number>>(new Set());

  /** Derived view: the rows in the order dictated by the current sort state. */
  sortedRows = computed<Row[]>(() => {
    const rows = [...this.rows()];
    const idx = this.sortIndex();
    if (idx === null) return rows;
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
      const av = a.cells[idx];
      const bv = b.cells[idx];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  });

  sortBy(index: number) {
    if (this.columns()[index]?.sortable === false) return;
    if (this.sortIndex() === index) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortIndex.set(index);
      this.sortDir.set('asc');
    }
    // Sorting reorders rows, so expanded indices no longer line up — reset.
    this.expanded.set(new Set());
  }

  sortCaret(index: number) {
    if (this.sortIndex() !== index) return '⇅';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  toggle(index: number) {
    this.expanded.update((set) => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }
}
