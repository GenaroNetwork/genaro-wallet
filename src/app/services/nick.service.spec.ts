/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { NickService } from './nick.service';

describe('Service: Nick', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NickService]
    });
  });

  it('should ...', inject([NickService], (service: NickService) => {
    expect(service).toBeTruthy();
  }));
});
