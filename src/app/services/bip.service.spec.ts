/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BipService } from './bip.service';

describe('Service: Bip', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BipService]
    });
  });

  it('should ...', inject([BipService], (service: BipService) => {
    expect(service).toBeTruthy();
  }));
});
