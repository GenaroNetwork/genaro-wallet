/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EdenService } from './eden.service';

describe('Service: Eden', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EdenService]
    });
  });

  it('should ...', inject([EdenService], (service: EdenService) => {
    expect(service).toBeTruthy();
  }));
});
