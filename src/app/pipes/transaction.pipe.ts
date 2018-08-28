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
    let allGNX = "-";
    let json
    switch (type) {
      case 'BUY_BUCKET':
        json = JSON.parse(data.data);
        json = typeof json === 'string' ? JSON.parse(json) : json;
        json.buckets.forEach(bucket => {
          const time = (bucket.timeEnd - bucket.timeStart) / 3600 / 24;
          const space = bucket.size;
          allGNX += time * space * SPACE_UNIT_PRICE;
        });
        break;
      case 'BUY_TRAFFIC':
        json = JSON.parse(data.data);
        allGNX = json.traffic;
        break;
      case 'STAKE_GNX':
        json = JSON.parse(data.data);
        allGNX = json.stake;
        break;
      default:
        break;
    }
    return allGNX;
  }
}
