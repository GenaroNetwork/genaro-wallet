/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SqliteService } from './sqlite.service';

describe('Service: Sqlite', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SqliteService]
    });
  });

  it('should ...', inject([SqliteService], (service: SqliteService) => {
    expect(service).toBeTruthy();
  }));
});
