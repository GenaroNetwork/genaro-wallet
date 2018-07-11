import { Component, OnInit, OnDestroy } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { TxEdenService } from '../../services/txEden.service';

@Component({
  selector: 'app-txEden',
  templateUrl: './txEden.component.html',
  styleUrls: ['./txEden.component.scss']
})
export class TxEdenComponent implements OnInit, OnDestroy {

  constructor(
    private wallet: WalletService,
    public txEden: TxEdenService,
  ) {
  }

  spacePer: number = 0;
  trafficPer: number = 0;
  spaceDetail: string = "";
  trafficDetail: string = "";
  requestPasswordValue: string = "";
  dialogName: string = null;

  userSub: any;
  bucketSub: any;
  ngOnInit() {
    this.userSub = this.txEden.currentUser.subscribe(user => {
      if (!user) return;
      this.trafficPer = user.usedDownloadBytes * 100 / (user.limitBytes);
      this.trafficDetail = `${user.usedDownloadBytes / 1024 / 1024 / 1024}/${user.limitBytes / 1024 / 1024 / 1024}GB`;
    });
    this.bucketSub = this.txEden.bucketList.subscribe(buckets => {
      if (!buckets) return;
      let all = 0;
      let used = 0;
      buckets.forEach(bucket => {
        all += bucket.limitStorage;
        used += (bucket.usedStorage || 0);
      });
      this.spacePer = used * 100 / all;
      this.spaceDetail = `${used / 1024 / 1024 / 1024}/${all / 1024 / 1024 / 1024}GB`;

    });
  }

  async requestPasswordDone() {
    this.txEden.beforehandSign(this.requestPasswordValue);
    this.txEden.getBuckets();
    this.txEden.getUserInfo();
    this.txEden.requestPassword.next(false);
  }

  requestPasswordCancel() {
    this.txEden.requestPassword.next(false);
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.bucketSub.unsubscribe();
  }

}
