import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'longAddr'
})
export class LongAddrPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (typeof value !== 'string') { return ''; }
    if (value.startsWith('0x')) { return value; }
    return `0x${value}`;
  }
}

@Pipe({
  name: 'shortAddr'
})
export class ShortAddrPipe implements PipeTransform {
  transform(value: any, starts: number = 8, ends: number = 8): any {
    if (typeof value !== 'string') { return ''; }
    return `${value.substr(0, starts)}...${value.substr(-ends)}`;

  }
}

@Pipe({
  name: 'getWallet'
})
export class GetWalletPipe implements PipeTransform {

  transform(wallets: any[] = null, address: string = null): any {
    if (!address || !wallets || wallets.length === 0) return {};
    let wallet = wallets.find(wallet => wallet.address === address);
    if (!wallet) wallet = {};
    return wallet;
  }

}
