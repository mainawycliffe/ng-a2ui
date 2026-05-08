import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { AgentRequest, AgentResponse } from '@shared/schema';

/**
 * The AgentClient handles all communication with the backend AI agent.
 * 
 * WHY: It encapsulates the HTTP logic for sending conversation history 
 * to the agent and receiving structured UI instructions or text responses.
 * Centralizing this logic makes it easier to handle errors and manage 
 * the agent's endpoint configuration.
 */
@Injectable({ providedIn: 'root' })
export class AgentClient {
  private http = inject(HttpClient);
  private url = 'http://localhost:3001/agent';

  send(req: AgentRequest): Promise<AgentResponse> {
    return firstValueFrom(this.http.post<AgentResponse>(this.url, req));
  }
}
