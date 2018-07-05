import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'readable'
})
export class NumberPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    value = value.toString();
    value
  }

}
