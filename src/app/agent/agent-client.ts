import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { AgentRequest, AgentResponse } from '@shared/schema';

@Injectable({ providedIn: 'root' })
export class AgentClient {
  private http = inject(HttpClient);
  private url = 'http://localhost:3001/agent';

  send(req: AgentRequest): Promise<AgentResponse> {
    return firstValueFrom(this.http.post<AgentResponse>(this.url, req));
  }
}
