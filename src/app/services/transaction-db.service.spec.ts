/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TransactionDbService } from './transaction-db.service';

describe('Service: TransactionDb', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransactionDbService]
    });
  });

  it('should ...', inject([TransactionDbService], (service: TransactionDbService) => {
    expect(service).toBeTruthy();
  }));
});
