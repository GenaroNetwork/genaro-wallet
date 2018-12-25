/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { NickNameService } from './nickName.service';

describe('Service: NickName', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NickNameService]
    });
  });

  it('should ...', inject([NickNameService], (service: NickNameService) => {
    expect(service).toBeTruthy();
  }));
});
