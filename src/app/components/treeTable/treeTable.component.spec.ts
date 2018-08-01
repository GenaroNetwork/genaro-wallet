/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TreeTableComponent } from './treeTable.component';

describe('TreeTableComponent', () => {
  let component: TreeTableComponent;
  let fixture: ComponentFixture<TreeTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
