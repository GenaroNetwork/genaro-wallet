/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EdenFileShareComponent } from './edenFileShare.component';

describe('EdenFileShareComponent', () => {
  let component: EdenFileShareComponent;
  let fixture: ComponentFixture<EdenFileShareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdenFileShareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdenFileShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
