import { Component } from '@angular/core';
import { AiUiHost } from './components/ai-ui-host';

/**
 * Root component of the application.
 * Wraps the primary AI UI host experience.
 */
@Component({
  selector: 'app-root',
  imports: [AiUiHost],
  template: `<app-ai-ui-host />`,
})
export class App {}
