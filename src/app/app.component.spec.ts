import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TranslateModule } from '@ngx-translate/core';
import { ElectronService } from './providers/electron.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        ElectronService
      ],
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();
  }));
});

class TranslateServiceStub {
  setDefaultLang(lang: string): void {
  }
}
