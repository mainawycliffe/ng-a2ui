import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AgentBus } from '../agent/agent-bus';
import type { RenderInstruction } from '@shared/schema';

type Props = Extract<RenderInstruction, { component: 'PaymentCard' }>['props'];

@Component({
  selector: 'app-payment-card',
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 class="mb-1 text-lg font-semibold">Payment</h3>
      <p class="mb-4 text-sm text-slate-500">{{ summary() }}</p>

      <div class="mb-4 rounded-xl bg-slate-900 p-5 text-white">
        <div class="mb-6 flex items-center justify-between">
          <span class="text-xs uppercase tracking-wider text-slate-300">Total</span>
          <span class="text-xs uppercase tracking-wider text-slate-300">{{ currency() }}</span>
        </div>
        <div class="mb-6 text-3xl font-bold tracking-wide">
          {{ amount() | number }} <span class="text-base font-normal text-slate-300">{{ currency() }}</span>
        </div>
        <div class="space-y-2">
          <input
            placeholder="Card number"
            maxlength="19"
            [value]="card()"
            (input)="onCard($any($event.target).value)"
            class="w-full rounded bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400 focus:bg-white/20"
          />
          <div class="flex gap-2">
            <input placeholder="MM/YY" maxlength="5" [value]="expiry()"
              (input)="expiry.set($any($event.target).value)"
              class="flex-1 rounded bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400 focus:bg-white/20"/>
            <input placeholder="CVC" maxlength="4" [value]="cvc()"
              (input)="cvc.set($any($event.target).value)"
              class="w-24 rounded bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400 focus:bg-white/20"/>
          </div>
        </div>
      </div>

      <button
        (click)="pay()"
        [disabled]="!isValid()"
        class="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white disabled:bg-slate-300"
      >{{ paying() ? 'Processing…' : 'Pay ' + (amount() | number) + ' ' + currency() }}</button>
    </div>
  `,
  imports: [DecimalPipe],
})
export class PaymentCard {
  amount   = input.required<Props['amount']>();
  currency = input.required<Props['currency']>();
  summary  = input.required<Props['summary']>();

  card   = signal('');
  expiry = signal('');
  cvc    = signal('');
  paying = signal(false);

  private bus = inject(AgentBus);

  isValid = computed(() =>
    this.card().replace(/\s/g, '').length >= 12 &&
    /\d{2}\/\d{2}/.test(this.expiry()) &&
    this.cvc().length >= 3 &&
    !this.paying(),
  );

  onCard(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    this.card.set(digits.replace(/(.{4})/g, '$1 ').trim());
  }

  async pay() {
    if (!this.isValid()) return;
    this.paying.set(true);
    await new Promise((r) => setTimeout(r, 800));
    this.bus.emit({ type: 'PAYMENT_CONFIRMED', amount: this.amount(), currency: this.currency() });
  }
}
