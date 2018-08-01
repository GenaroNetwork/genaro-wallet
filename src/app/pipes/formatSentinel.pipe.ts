import { Pipe, PipeTransform } from '@angular/core';
import * as numeral from 'numeral';

@Pipe({
  name: 'formatSentinel'
})
export class FormatSentinelPipe implements PipeTransform {

  transform(value: any): any {
    if (value === null || value === void 0) { return '--'; }
    return numeral(value).format('0,0');
  }

}
