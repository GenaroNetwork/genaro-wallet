/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TxEdenService } from './txEden.service';

describe('Service: Eden', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TxEdenService]
    });
  });

  it('should ...', inject([TxEdenService], (service: TxEdenService) => {
    expect(service).toBeTruthy();
  }));
});
