/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Web3Service } from './web3.service';

describe('Service: Web3', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Web3Service]
    });
  });

  it('should ...', inject([Web3Service], (service: Web3Service) => {
    expect(service).toBeTruthy();
  }));
});
