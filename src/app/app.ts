import { Component } from '@angular/core';
import { AiUiHost } from './components/ai-ui-host';

@Component({
  selector: 'app-root',
  imports: [AiUiHost],
  template: `<app-ai-ui-host />`,
})
export class App {}
