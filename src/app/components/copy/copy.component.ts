import { Component, Input, OnDestroy } from '@angular/core';
import { clipboard } from 'electron';

@Component({
  selector: 'app-copy',
  templateUrl: './copy.component.html',
  styleUrls: ['./copy.component.scss']
})
export class CopyComponent implements OnDestroy {
  @Input("data") data: any = null;

  copied: boolean = false;
  timer: any;
  copy() {
    if (this.copied) return;
    this.copied = true;
    clipboard.writeText(this.data);
    this.timer = setTimeout(() => {
      this.copied = false;
    }, 1000);
  }
  constructor() { }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }

}
