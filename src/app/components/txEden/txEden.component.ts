import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { TxEdenService } from '../../services/txEden.service';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';
import { EdenService } from '../../services/eden.service';

@Component({
  selector: 'app-txEden',
  templateUrl: './txEden.component.html',
  styleUrls: ['./txEden.component.scss']
})
export class TxEdenComponent implements OnInit, OnDestroy {

  constructor(
    private walletService: WalletService,
    private txService: TransactionService,
    public txEden: TxEdenService,
    public edenService: EdenService,
  ) {
    this.txEden.getAll();
  }

  spacePer = 0;
  trafficPer = 0;
  spaceUsed = 0;
  spaceAll = 0;
  trafficUsed = 0;
  trafficAll = 0;
  dialogName: string = null;
  tableChangeIndex = 0;
  dialogOpt: any = null;

  walletSub: any;
  blockSub: any;
  ngOnInit() {
    this.txEdenUpdate();
    this.blockSub = this.walletService.currentWallet.subscribe(() => {
      this.txEden.clearAllSig();
      this.txEdenUpdate();
    });
    this.walletSub = this.txService.newBlockHeaders.subscribe(() => {
      this.txEdenUpdate(false);
    });
  }

  async txEdenUpdate(force: boolean = true) {
    await this.txEden.getAll(force);
    await this.edenService.updateAll([]);
    const user = this.txEden.currentUser;
    const buckets = this.edenService.currentBuckets;
    let allSpace = 0;
    let usedSpace = 0;
    buckets.forEach(bucket => {
      allSpace += bucket.limitStorage;
      usedSpace += (bucket.usedStorage || 0);
    });
    this.spaceUsed = usedSpace;
    this.spaceAll = allSpace;
    if (this.spaceUsed > this.spaceAll) this.spaceUsed = this.spaceAll;
    this.trafficUsed = user.usedDownloadBytes || 0;
    this.trafficAll = user.limitBytes || 0;
    if (this.trafficUsed > this.trafficAll) this.trafficUsed = this.trafficAll;
    if (!allSpace) { this.spacePer = 0; } else { this.spacePer = usedSpace * 100 / allSpace; }
    if (!user.limitBytes) { this.trafficPer = 0; } else { this.trafficPer = user.usedDownloadBytes * 100 / (user.limitBytes) || 0; }
  }

  renewBucket(bucket) {
    this.dialogOpt = bucket;
    this.dialogName = 'spaceExpansion';
  }

  ngOnDestroy() {
    this.walletSub.unsubscribe();
    this.blockSub.unsubscribe();
  }



}
