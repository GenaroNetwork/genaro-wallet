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

  transform(value: any, type?: any): any {
    let json = JSON.parse(value);
    json = typeof json === 'string' ? JSON.parse(json) : json;
    let allGNX = 0;
    switch (type) {
      case 'BUY_BUCKET':
        json.buckets.forEach(bucket => {
          const time = (bucket.timeEnd - bucket.timeStart) / 3600 / 24;
          const space = bucket.size;
          allGNX += time * space * SPACE_UNIT_PRICE;
        });
        break;
      case 'BUY_TRAFFIC':
        allGNX = json.traffic;
        break;
      case 'STAKE_GNX':
        allGNX = json.stake;
        break;
    }
    return allGNX;
  }

}
