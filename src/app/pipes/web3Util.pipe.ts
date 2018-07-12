import { Pipe, PipeTransform } from '@angular/core';
import { fromWei, toWei } from "web3-utils";

@Pipe({
  name: "gnxunit",
})
export class TranserUnitPipe implements PipeTransform {
  transform(value: any, unitFrom: any = "wei", unitTo: any = "ether") {
    value = value.toString();
    return fromWei(toWei(value, unitFrom), unitTo);
  }
}
@Pipe({
  name: "shortGNX",
})
export class ShortGNXPipe implements PipeTransform {
  transform(value: string | number, length: number = 4) {
    let number = Number(value);
    return number.toFixed(length);
  }
}