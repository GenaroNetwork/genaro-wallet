import { Component, OnInit, Input, OnDestroy, HostListener, ElementRef, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { SharerService } from '../../services/sharer.service';
import { TransactionDbService } from '../../services/transaction-db.service';
import { TransactionService } from '../../services/transaction.service';
import { BrotherhoodService } from '../../services/brotherhood.service';
import { WalletService } from '../../services/wallet.service';
import { TxEdenService } from '../../services/txEden.service';
import { EdenService } from '../../services/eden.service';
import { CommitteeService } from '../../services/committee.service';
import { TASK_STATE, TASK_TYPE, Role } from '../../libs/config';
import { shell } from "electron";


function add0x(addr: string) {
  if (addr && !addr.startsWith('0x')) return '0x' + addr;
  return addr;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy, OnChanges {

  @Input('name') name: string;
  @Input('opt') opt: any;
  @Input('change') change: number;
  @Output('action') action: EventEmitter<any> = new EventEmitter;

  ngOnChanges(changes: { [prop: string]: SimpleChange }) {
    let name;
    if (changes.name) name = changes.name.currentValue;
    else name = this.name;
    if (this[`${name}Change`]) { this[`${name}Change`](); }
  }

  constructor(
    public el: ElementRef,
    public sharer: SharerService,
    public txdb: TransactionDbService,
    public txService: TransactionService,
    public walletService: WalletService,
    public txEdenService: TxEdenService,
    public edenService: EdenService,
    public committeeService: CommitteeService,
    public brotherhoodService: BrotherhoodService
  ) { }

  isSpinning: boolean = false;

  txData: any[];
  txDisplayData: any[];
  txType = 'TYPE_ALL';
  transactionChange = this.txUpdateData;
  transactionWalletSub = this.txUpdateData;
  transactionBlockSub = this.txUpdateData;
  txDataCurrentPage = 1;
  txDataTotalPage = 0;
  TASK_STATE = TASK_STATE;
  TASK_TYPE = TASK_TYPE;
  shell = shell;
  async txUpdateData() {
    const address = this.walletService.wallets.current;
    // @ts-ignore
    this.txData = await this.txdb.getTransactions(null, null);
    let data = this.txData;
    data = data.filter(tx => tx.addrFrom === address || tx.addrTo === address);
    if (this.txType !== 'TYPE_ALL') {
      const types = {
        'TYPE_SEND': 'TRANSFER',
        'TYPE_BUY_SPACE': 'BUY_BUCKET',
        'TYPE_BUY_TRAFFIC': 'BUY_TRAFFIC',
        'TYPE_STAKE': 'STAKE_GNX',
        'TYPE_BIND_NODE': 'BIND_NODE',
      };
      data = data.filter(tx => tx.txType === types[this.txType]);
    }
    data = data.sort((a, b) => b.created - a.created);
    this.txDataTotalPage = data.length;
    data = data.slice((this.txDataCurrentPage - 1) * 10, this.txDataCurrentPage * 10);
    try {
      if (this.txDisplayData.length !== data.length) throw new Error;
      data.forEach(data => {
        let old = this.txDisplayData.find(dData => dData.transactionId === data.transactionId);
        if (!old) throw new Error;
        for (let key in data) {
          old[key] = data[key];
        }
      });
    } catch (e) {
      this.txDisplayData = data;
    }
  }
  txGetBlockNumber(receipt) {
    if (!receipt) { return '-'; }
    return JSON.parse(receipt).blockNumber;
  }
  txChangeType(type: string) {
    this.txType = type;
    this.txDataCurrentPage = 1;
    this.txUpdateData();
  }
  txChangePage(page: number) {
    this.txDataCurrentPage = page;
    this.txUpdateData();
  }

  // //txEden
  // txEdenData: any = [];
  // txEdenWalletSub = this.txEdenDataUpdate;
  // txEdenBlockSub = this.txEdenDataUpdate;
  // txEdenDataUpdate(){
  //   this.txEdenData = this.txEdenService.bucketList;
  // }


  // tx sharer
  txSharerData: any[] = [];
  // txSharerDataCurrentPage = 1;
  // txSharerDataTotalPage = 0;
  txSharerWalletSub = this.txSharerDataUpdate;
  txSharerBlockSub = this.txSharerDataUpdate;
  async txSharerDataUpdate() {
    const address = this.walletService.wallets.current;
    const nodes = await this.txService.getNodes(address);
    if (nodes)
      this.txSharerData = nodes;
    else
      this.txSharerData = [];
    // if (nodes) {
    //   this.txSharerDataTotalPage = nodes.length;
    //   this.txSharerData = nodes.slice((this.txSharerDataCurrentPage - 1) * 10, this.txSharerDataCurrentPage * 10);
    // }
  }
  // txSharerChangePage(page: number) {
  //   this.txSharerDataCurrentPage = page;
  //   this.txSharerDataUpdate();
  // }

  // rank
  rankAddress = '';
  showRankBack: boolean = false;
  rankInit() {
    this.rankDataUpdate();
  }
  async rankDataUpdate() {
  }
  async searchRankFarmer() {
    if (this.rankAddress) {
      this.showRankBack = true;
      await this.committeeService.getCurrentFarmer(this.rankAddress);
    }
    else {
      this.showRankBack = false;
      this.rankDataUpdate();
    }
  }
  resetSearchRankFarmer() {
    this.rankAddress = '';
    this.searchRankFarmer();
  }
  rankDestroy() { }

  // committee
  committeeData: any[] = [];
  canApplyJoin: boolean = true;
  committeeAddress: string = '';
  showBack: boolean = false;
  walletSub: any;
  activeBtnSub: any;
  committeeInit() {
    this.isSpinning = true;
    this.committeeAddress = '';
    this.committeeDataUpdate();
    this.walletSub = this.walletService.currentWallet.subscribe(async currentWallet => {
      this.canApplyJoin = false;
      let datas = this.committeeService.pendingSentinelRank || [];
      let data;
      let currentWalletAddr = add0x(currentWallet.address);
      for (let i = 0, length = datas.length; i < length; i++) {
        if (currentWalletAddr === datas[i].address) {
          data = datas[i];
          break;
        }
      }
      if (!data || !data.pendingSubFarmers || data.pendingSubFarmers.length === 0) {
        this.canApplyJoin = true;
      }
      let state = await this.brotherhoodService.fetchState2(currentWalletAddr);
      if (state && state.tempState && state.tempState.role === Role.Free) {
        this.committeeService.delete(currentWallet.address);
      }
      this.activateJoinButton();
    });
    this.activeBtnSub = this.committeeService.activeJoinBtn.subscribe((action) => {
      this.activateJoinButton();
    });
  }
  async committeeDataUpdate() {
    this.isSpinning = true;
    this.committeeData = this.committeeService.getPendingSentinelRankDatas();
    this.activateJoinButton.apply(self);
    this.isSpinning = false;
  }
  async searchFarmer() {
    if (this.committeeAddress) {
      this.showBack = true;
      await this.committeeService.getCurrentFarmer(this.committeeAddress);
      this.activateJoinButton();
    }
    else {
      this.showBack = false;
      this.committeeDataUpdate();
    }
  }
  async activateJoinButton() {
    if (this.committeeData) {
      let currentWalletAddr = this.walletService.wallets.current;
      let hasAppliedAccounts = await this.committeeService.get(currentWalletAddr) || [];
      let acs = hasAppliedAccounts.map(a => {
        return a.applyAddress;
      })
      this.committeeData.forEach(cd => {
        if (acs.indexOf(cd.address) > -1) {
          cd.canApplyJoin = false;
        }
        else {
          cd.canApplyJoin = true;
        }
      })
    }
  }
  resetSearchFarmer() {
    this.committeeAddress = '';
    this.searchFarmer();
  }
  committeeDestroy() {
    if (this.walletSub) {
      this.walletSub.unsubscribe();
    }
    if (this.activeBtnSub) {
      this.activeBtnSub.unsubscribe();
    }
  }


  // currentCommittee
  currentCommitteeData: any[] = [];
  async currentCommitteeInit() {
    this.isSpinning = true;
    this.walletService.currentWallet.subscribe(async wallet => {
      this.currentCommitteeData = await this.committeeService.getCurrentCommittee() || [];
      let currentWalletAddr = add0x(wallet.address);
      this.currentCommitteeData.forEach(d => {
        d.this = d.address === currentWalletAddr;
      });
      this.isSpinning = false;
    });
  }

  // sharer
  sharerInit() { }
  sharerDestroy() { }


  // eden file share 
  edenFileReceiveData: any[] = [];
  edenFileReceiveSubscribe: any;
  edenFileReceiveInit() {
    this.edenFileReceiveSubscribe = this.txEdenService.shareFiles.subscribe((data) => {
      this.edenFileReceiveData = ((data || {}).to || []).reverse();
    });
  }
  edenFileReceiveDestroy() {
    if (this.edenFileReceiveSubscribe) {
      this.edenFileReceiveSubscribe.unsubscribe();
    }
  }

  edenFileShareData: any[] = [];
  edenFileShareSubscribe: any;
  edenFileShareInit() {
    this.edenFileShareSubscribe = this.txEdenService.shareFiles.subscribe((data) => {
      this.edenFileShareData = ((data || {}).from || []).reverse();
    });
  }
  edenFileShareDestroy() {
    if (this.edenFileShareSubscribe) {
      this.edenFileShareSubscribe.unsubscribe();
    }
  }

  allWalletSub: any;
  allBlockSub: any;
  ngOnInit() {
    if (this[`${this.name}Init`]) { this[`${this.name}Init`](); }
    this.allWalletSub = this.walletService.currentWallet.subscribe(() => {
      if (this[`${this.name}WalletSub`]) { this[`${this.name}WalletSub`](); }
    });
    this.allBlockSub = this.txService.newBlockHeaders.subscribe(() => {
      if (this[`${this.name}BlockSub`]) { this[`${this.name}BlockSub`](); }
    });
  }

  ngOnDestroy() {
    if (this[`${this.name}Destroy`]) { this[`${this.name}Destroy`](); }
    this.allWalletSub.unsubscribe();
    this.allBlockSub.unsubscribe();
  }

}
