Object.defineProperty(global, '_bitcore', {
  get() {
    return void 0;
  },
  set() { },
});

require('electron').webFrame.setLayoutZoomLevelLimits(1, 1);
require('electron').webFrame.setVisualZoomLevelLimits(1, 1);

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { AppConfig } from './environments/environment';

if (AppConfig.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: false,
    // ngZone: 'noop',
  })
  .catch(err => { });
