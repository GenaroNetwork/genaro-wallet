/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TxSharerComponent } from './txSharer.component';

describe('TxSharerComponent', () => {
  let component: TxSharerComponent;
  let fixture: ComponentFixture<TxSharerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TxSharerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TxSharerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
