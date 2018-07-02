import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {

  constructor() { }
  @Input("name") dialogName: string = null;
  @Output("nameChange") dialogNameChange: EventEmitter<string> = new EventEmitter;

}
