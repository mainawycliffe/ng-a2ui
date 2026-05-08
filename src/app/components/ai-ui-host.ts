import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { AgentBus, AgentEvent } from '../agent/agent-bus';
import { AgentClient } from '../agent/agent-client';
import { COMPONENT_REGISTRY } from '../agent/component-registry';
import type { Message, RenderInstruction } from '@shared/schema';

type ChatItem =
  | { kind: 'user';    text: string }
  | { kind: 'event';   text: string }
  | { kind: 'agent';   text: string }
  | { kind: 'render';  componentName: string };

/**
 * AiUiHost is the primary orchestration layer for the "a2UI" (Agent-to-UI) experience.
 * 
 * WHY: It manages the dual-nature of the interface:
 * 1. The Chat Transcript: Maintains the conversation history for both the user and the LLM.
 * 2. The Dynamic Stage: Uses `NgComponentOutlet` to render the "latest" UI instruction 
 *    from the agent, providing a focused, interactive experience beyond just text.
 */
@Component({
  selector: 'app-ai-ui-host',
  imports: [NgComponentOutlet],
  template: `
    <div class="grid h-screen grid-rows-[1fr_auto] grid-cols-[minmax(360px,420px)_1fr] gap-4 p-4">
      <!-- Chat -->
      <section class="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header class="border-b border-slate-200 px-4 py-3">
          <h2 class="text-sm font-semibold">Chat</h2>
          <p class="text-xs text-slate-500">User ↔ agent transcript (text + UI events)</p>
        </header>
        <div class="flex-1 space-y-2 overflow-y-auto px-4 py-3">
          @for (item of chat(); track $index) {
            @switch (item.kind) {
              @case ('user') {
                <div class="ml-8 rounded-2xl rounded-tr-sm bg-indigo-600 px-3 py-2 text-sm text-white">{{ item.text }}</div>
              }
              @case ('agent') {
                @if (item.text.startsWith('⚠')) {
                  <div class="mr-8 flex flex-col gap-2 rounded-2xl rounded-tl-sm border border-red-100 bg-red-50 p-3 text-sm text-red-900 shadow-sm">
                    <div class="flex items-start gap-2">
                      <span class="text-base">⚠</span>
                      <div class="flex-1">{{ item.text.replace('⚠ ', '') }}</div>
                    </div>
                    <button
                      (click)="retryAgent()"
                      class="self-start rounded-lg bg-white px-3 py-1 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-50"
                    >
                      Try again
                    </button>
                  </div>
                } @else {
                  <div class="mr-8 rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm text-slate-800">{{ item.text }}</div>
                }
              }
              @case ('event') {
                <div class="text-center text-xs italic text-slate-400">↳ {{ item.text }}</div>
              }
              @case ('render') {
                <div class="text-center text-xs font-medium text-indigo-500">▸ rendered &lt;{{ item.componentName }}&gt;</div>
              }
            }
          }
          @if (loading()) {
            <div class="mr-8 inline-flex items-center gap-2 rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm text-slate-500">
              <span class="size-2 animate-pulse rounded-full bg-slate-400"></span>
              <span class="size-2 animate-pulse rounded-full bg-slate-400" style="animation-delay:120ms"></span>
              <span class="size-2 animate-pulse rounded-full bg-slate-400" style="animation-delay:240ms"></span>
            </div>
          }
        </div>
        <form (submit)="$event.preventDefault(); sendText()" class="border-t border-slate-200 p-3">
          <div class="flex gap-2">
            <input
              [value]="inputText()"
              (input)="inputText.set($any($event.target).value)"
              placeholder="e.g. Fly Nairobi to Mombasa Friday under 8000 KES"
              class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              [disabled]="loading() || !inputText().trim()"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300"
            >Send</button>
          </div>
        </form>
      </section>

      <!-- Dynamic component pane -->
      <section class="overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-6">
        @if (currentInstruction(); as inst) {
          <div class="mx-auto max-w-2xl">
            @if (inst.message) {
              <p class="mb-3 text-sm text-slate-600">{{ inst.message }}</p>
            }
            <ng-container
              *ngComponentOutlet="componentType(inst.component); inputs: inst.props"
            />
          </div>
        } @else {
          <div class="flex h-full items-center justify-center text-center text-sm text-slate-400">
            <div class="max-w-md">
              <p class="text-base font-medium text-slate-500">a2UI demo</p>
              <p class="mt-2">Ask the agent anything about flight booking.</p>
              <p class="mt-4 text-xs uppercase tracking-wider text-slate-400">Try one of these</p>
              <div class="mt-2 flex flex-wrap justify-center gap-2">
                @for (q of exampleQueries; track q) {
                  <button
                    type="button"
                    (click)="inputText.set(q)"
                    class="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
                  >{{ q }}</button>
                }
              </div>
            </div>
          </div>
        }
      </section>

      <!-- JSON drawer -->
      <footer class="col-span-2 rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 shadow-sm">
        <button
          (click)="drawerOpen.update(v => !v)"
          class="flex w-full items-center justify-between px-4 py-2 text-left"
        >
          <span class="text-xs font-medium uppercase tracking-wider text-slate-300">
            Agent payload {{ drawerOpen() ? '▾' : '▸' }}
          </span>
          <span class="text-xs text-slate-400">{{ lastPayloadComponent() ?? '—' }}</span>
        </button>
        @if (drawerOpen()) {
          <pre class="max-h-64 overflow-auto px-4 pb-4 text-xs leading-relaxed">{{ lastPayloadJson() }}</pre>
        }
      </footer>
    </div>
  `,
})
export class AiUiHost implements OnInit {
  private bus    = inject(AgentBus);
  private client = inject(AgentClient);

  // Source of truth sent to the agent (full conversation)
  private messages = signal<Message[]>([]);

  // What the chat panel shows (a friendlier projection)
  chat = signal<ChatItem[]>([]);

  // Latest instruction → drives ngComponentOutlet
  currentInstruction = signal<RenderInstruction | null>(null);

  // Last raw response (text or instruction) for the JSON drawer
  private lastPayload = signal<unknown>(null);
  drawerOpen = signal(true);
  inputText  = signal('');
  loading    = signal(false);
  hasError   = signal(false);

  readonly exampleQueries = [
    'Fly Nairobi to Mombasa Friday under 8,000 KES',
    'Cheapest flight from Nairobi to Kisumu tomorrow',
    'Nairobi to Eldoret next Monday morning',
    'Find me a flight to Lamu under 12,000 KES',
  ];

  lastPayloadJson = computed(() =>
    this.lastPayload() ? JSON.stringify(this.lastPayload(), null, 2) : '// no payload yet',
  );
  lastPayloadComponent = computed(() => {
    const p = this.lastPayload() as RenderInstruction | { kind: string } | null;
    if (!p) return null;
    if ('component' in p) return p.component;
    return 'kind=text';
  });

  ngOnInit() {
    this.bus.events.subscribe((e) => this.sendEvent(e));
  }

  componentType(name: string) {
    return COMPONENT_REGISTRY[name as keyof typeof COMPONENT_REGISTRY];
  }

  async sendText() {
    const text = this.inputText().trim();
    if (!text || this.loading()) return;
    this.inputText.set('');
    this.hasError.set(false);
    this.chat.update((c) => [...c, { kind: 'user', text }]);
    this.messages.update((m) => [...m, { role: 'user', content: text }]);
    await this.callAgent();
  }

  /** Relays UI events (e.g. seat selected) back to the agent as specialized user messages. */
  private async sendEvent(event: AgentEvent) {
    const summary = `event: ${event.type} ${JSON.stringify(event)}`;
    this.hasError.set(false);
    this.chat.update((c) => [...c, { kind: 'event', text: event.type }]);
    this.messages.update((m) => [...m, { role: 'user', content: summary }]);
    await this.callAgent();
  }

  /** Retries the last failed agent request. */
  async retryAgent() {
    this.hasError.set(false);
    // Remove last error message from chat
    this.chat.update((c) => {
      const last = c[c.length - 1];
      if (last && last.kind === 'agent' && last.text.startsWith('⚠')) {
        return c.slice(0, -1);
      }
      return c;
    });
    await this.callAgent();
  }

  /** Orchestrates the API call to the agent and processes the response. */
  private async callAgent() {
    this.loading.set(true);
    try {
      const res = await this.client.send({ messages: this.messages() });
      this.lastPayload.set(res);
      if (res.kind === 'text') {
        this.chat.update((c) => [...c, { kind: 'agent', text: res.text }]);
        this.messages.update((m) => [...m, { role: 'assistant', content: res.text }]);
      } else if (res.kind === 'component' && res.instruction && typeof res.instruction === 'object') {
        const inst = res.instruction;
        this.currentInstruction.set(inst);
        if (inst.message) this.chat.update((c) => [...c, { kind: 'agent', text: inst.message }]);
        this.chat.update((c) => [...c, { kind: 'render', componentName: inst.component }]);
        this.messages.update((m) => [...m, { role: 'assistant', content: JSON.stringify(inst) }]);
      } else {
        throw new Error(`malformed agent response: ${JSON.stringify(res).slice(0, 200)}`);
      }
    } catch (err: any) {
      console.error('Call Agent failed:', err);
      this.hasError.set(true);
      let errorMsg = 'An unexpected error occurred.';

      if (err.status === 0) {
        errorMsg = 'Network error: Please check if the agent server is running.';
      } else if (err.error?.message) {
        errorMsg = `Agent error: ${err.error.message}`;
      } else if (err.message) {
        errorMsg = err.message;
      }

      this.chat.update((c) => [
        ...c,
        { kind: 'agent', text: `⚠ ${errorMsg}` }
      ]);
    } finally {
      this.loading.set(false);
    }
  }
}
