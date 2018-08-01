import { Pipe, PipeTransform } from '@angular/core';
import { fromWei, toWei, toBN } from 'web3-utils';

@Pipe({
  name: 'gnxUnit',
})
export class TranserUnitPipe implements PipeTransform {
  transform(value: any, unitFrom: string = 'wei', unitTo: string = 'ether') {
    value = value.toString();
    return fromWei(toWei(toBN(value), unitFrom), unitTo);
  }
}

@Pipe({
  name: 'shortGNX',
})
export class ShortGNXPipe implements PipeTransform {
  transform(value: string | number, length: number = 4) {
    const number = Number(value);
    return number.toFixed(length);
  }
}
