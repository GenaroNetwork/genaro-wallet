import { Pipe, PipeTransform } from '@angular/core';
import * as humanSize from 'human-size';

@Pipe({
  name: 'formatSize'
})
export class FormatSizePipe implements PipeTransform {

  transform(value: any): any {
    if (value === null || value === void 0) return "--";
    return humanSize(value, 2);
  }
}
