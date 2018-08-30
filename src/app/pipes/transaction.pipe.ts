import { Pipe, PipeTransform } from '@angular/core';
import { STAKE_PER_NODE, SPACE_UNIT_PRICE, TRAFFIC_UNIT_PRICE } from '../libs/config';

// 最大压注节点
@Pipe({
  name: 'maxNode'
})
export class maxNodePipe implements PipeTransform {
  transform(value: any) {
    return Math.floor(value / STAKE_PER_NODE);
  }
}


@Pipe({
  name: 'specialTx'
})
export class SpecialTxPipe implements PipeTransform {

  transform(data: any, type?: any): any {
    let allGNX;
    let json = JSON.parse(data.data);
    if (typeof json === "string") json = JSON.parse(json);
    switch (type) {
      case 'BUY_BUCKET':
        allGNX = 0;
        json.buckets.forEach(bucket => {
          const time = (bucket.timeEnd - bucket.timeStart) / 3600 / 24;
          const space = bucket.size;
          allGNX += time * space * SPACE_UNIT_PRICE;
        });
        break;
      case 'BUY_TRAFFIC':
        allGNX = json.traffic * TRAFFIC_UNIT_PRICE;
        break;
      case 'STAKE_GNX':
        allGNX = json.stake;
        break;
      default:
        allGNX = "-";
        break;
    }
    return allGNX;
  }
}
