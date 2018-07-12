/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EdenComponent } from './eden.component';

describe('EdenComponent', () => {
  let component: EdenComponent;
  let fixture: ComponentFixture<EdenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
