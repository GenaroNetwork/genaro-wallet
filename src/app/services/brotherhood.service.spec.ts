/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BrotherhoodService } from './brotherhood.service';

describe('Service: Brotherhood', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrotherhoodService]
    });
  });

  it('should ...', inject([BrotherhoodService], (service: BrotherhoodService) => {
    expect(service).toBeTruthy();
  }));
});
