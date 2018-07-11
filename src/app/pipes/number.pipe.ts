import { Pipe, PipeTransform } from '@angular/core';
import { STAKE_PER_NODE } from "../libs/config";
import { fromWei } from "web3-utils";

@Pipe({
  name: 'readable'
})
export class NumberPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    value = value.toString();
    value
  }
}


@Pipe({
  name: "maxNode"
})
export class maxNode implements PipeTransform {
  transform(value: any) {
    return Math.floor(value / STAKE_PER_NODE);
  }
}


@Pipe({
  name: "e2t"
})
export class E2t implements PipeTransform {
  transform(value: any) {
    return fromWei(value, "ether");
  }
}