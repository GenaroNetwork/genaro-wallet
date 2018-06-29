import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addr'
})
export class AddrPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value.startsWith("0x")) return value;
    return `0x${value}`;
  }

}
