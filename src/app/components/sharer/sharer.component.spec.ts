/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SharerComponent } from './sharer.component';

describe('SharerComponent', () => {
  let component: SharerComponent;
  let fixture: ComponentFixture<SharerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
