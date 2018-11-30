/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ObserverService } from './observer.service';

describe('Service: Observer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ObserverService]
    });
  });

  it('should ...', inject([ObserverService], (service: ObserverService) => {
    expect(service).toBeTruthy();
  }));
});
