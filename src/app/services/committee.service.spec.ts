/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CommitteeService } from './committee.service';

describe('Service: Committee', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommitteeService]
    });
  });

  it('should ...', inject([CommitteeService], (service: CommitteeService) => {
    expect(service).toBeTruthy();
  }));
});
