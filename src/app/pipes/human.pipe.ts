import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'humanSize'
})
export class HumanSizePipe implements PipeTransform {

  transform(value: any, length: number = 2): any {
    if (value < 1024) return value + " B";
    value /= 1024;
    if (value < 1024) return value.toFixed(length) + " KB";
    value /= 1024;
    if (value < 1024) return value.toFixed(length) + " MB";
    value /= 1024;
    if (value < 1024) return value.toFixed(length) + " GB";
    value /= 1024;
    if (value < 1024) return value.toFixed(length) + " TB";
  }

}
