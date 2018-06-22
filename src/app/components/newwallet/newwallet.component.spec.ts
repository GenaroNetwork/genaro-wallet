/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NewwalletComponent } from './newwallet.component';

describe('NewwalletComponent', () => {
  let component: NewwalletComponent;
  let fixture: ComponentFixture<NewwalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewwalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
