/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SharerService } from './sharer.service';

describe('Service: Sharer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharerService]
    });
  });

  it('should ...', inject([SharerService], (service: SharerService) => {
    expect(service).toBeTruthy();
  }));
});
