/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GethService } from './geth.service';

describe('Service: Geth', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GethService]
    });
  });

  it('should ...', inject([GethService], (service: GethService) => {
    expect(service).toBeTruthy();
  }));
});
