import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { TxEdenService } from '../../services/txEden.service';

@Component({
  selector: 'app-txEden',
  templateUrl: './txEden.component.html',
  styleUrls: ['./txEden.component.scss']
})
export class TxEdenComponent implements OnInit {

  constructor(
    private wallet: WalletService,
    public txEden: TxEdenService,
  ) {
    this.txEden.getAll();
  }

  spacePer: number = 0;
  trafficPer: number = 0;
  spaceDetail: string = "";
  trafficDetail: string = "";
  dialogName: string = null;
  tableChangeIndex: number = 0;

  userSub: any;
  bucketSub: any;
  async ngOnInit() {
    await this.txEden.getAll();
    let user = this.txEden.currentUser;
    let buckets = this.txEden.bucketList;
    let allSpace = 0;
    let usedSpace = 0;
    buckets.forEach(bucket => {
      allSpace += bucket.limitStorage;
      usedSpace += (bucket.usedSpaceStorage || 0);
    });
    this.spacePer = usedSpace * 100 / allSpace;
    this.spaceDetail = `${(usedSpace || 0) / 1024 / 1024 / 1024}/${allSpace / 1024 / 1024 / 1024} GB`;
    this.trafficPer = user.usedDownloadBytes * 100 / (user.limitBytes) || 0;
    this.trafficDetail = `${(user.usedDownloadBytes || 0) / 1024 / 1024 / 1024
      }/${user.limitBytes / 1024 / 1024 / 1024} GB`;
    if (!allSpace) {
      this.spacePer = 0;
      this.spaceDetail = "0/0 GB"
    }
    if (!user.limitBytes) {
      this.trafficPer = 0;
      this.trafficDetail = "0/0 GB"
    }
  }

}
