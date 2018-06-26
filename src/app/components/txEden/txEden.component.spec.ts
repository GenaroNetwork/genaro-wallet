/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TxEdenComponent } from './txEden.component';

describe('TxEdenComponent', () => {
  let component: TxEdenComponent;
  let fixture: ComponentFixture<TxEdenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TxEdenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TxEdenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
