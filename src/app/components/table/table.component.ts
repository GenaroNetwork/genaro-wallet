import { Component, OnInit, Input, OnDestroy, HostListener, ElementRef, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { SharerService } from '../../services/sharer.service';
import { TransactionDbService } from '../../services/transaction-db.service';
import { TransactionService } from '../../services/transaction.service';
import { BrotherhoodService } from '../../services/brotherhood.service';
import { WalletService } from '../../services/wallet.service';
import { TxEdenService } from '../../services/txEden.service';
import { EdenService } from '../../services/eden.service';
import { CommitteeService } from '../../services/committee.service';
import { TASK_STATE, TASK_TYPE } from '../../libs/config';


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

  @HostListener('window:resize', ['$event'])
  onResize(event) {

  }

  ngOnChanges(changes: { [prop: string]: SimpleChange }) {
    if (changes.change) {
      if (this[`${name}Change`]) { this[`${name}Change`](); }
    }
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
    this.txDisplayData = data;
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
  txSharerDataCurrentPage = 1;
  txSharerDataTotalPage = 0;
  txSharerWalletSub = this.txSharerDataUpdate;
  txSharerBlockSub = this.txSharerDataUpdate;
  async txSharerDataUpdate() {
    const address = this.walletService.wallets.current;
    const nodes = await this.txService.getNodes(address);
    if (nodes) {
      this.txSharerDataTotalPage = nodes.length;
      this.txSharerData = nodes.slice((this.txSharerDataCurrentPage - 1) * 10, this.txSharerDataCurrentPage * 10);
    }
  }
  txSharerChangePage(page: number) {
    this.txSharerDataCurrentPage = page;
    this.txSharerDataUpdate();
  }

  // rank
  rankData: any[] = [];
  rankAddress = '';
  rankState: any;
  rankInit() {
    this.rankDataUpdate('');
    const self = this;
    this.rankState = this.brotherhoodService.stateUpdate.subscribe(states => {
      if (states && self.rankData) {
        for (let i = 0, length = self.rankData.length; i < length; i++) {
          const rd = self.rankData[i];
          if (rd.address == states[0]) {
            rd.subAccounts = states[1].currentState.subAccounts;
            break;
          }
        }
      }
    });
  }
  async rankDataUpdate(addr) {
    if (addr) {
      this.brotherhoodService.addFetchingAddress(addr);
    }
    const datas = await this.committeeService.getSentinel(addr);
    if (datas) {
      datas.forEach(d => {
        this.brotherhoodService.addFetchingAddress(d.address);
      });
      this.rankData = datas;
    }
  }
  searchRankFarmer() {
    this.rankDataUpdate(this.rankAddress);
  }
  rankDestroy() {
    this.rankState.unsubscribe();
  }

  // committee
  committeeData: any[] = [];
  committeeAddress = '';
  committeeState: any;
  committeeInit() {
    this.committeeDataUpdate('');
    const self = this;
    this.committeeState = this.brotherhoodService.stateUpdate.subscribe(states => {
      if (states && self.committeeData) {
        for (let i = 0, length = self.committeeData.length; i < length; i++) {
          const rd = self.committeeData[i];
          if (rd.address == states[0]) {
            rd.subAccounts = states[1].currentState.subAccounts;
            break;
          }
        }
      }
    });
  }
  async committeeDataUpdate(addr) {
    if (addr) {
      this.brotherhoodService.addFetchingAddress(addr);
    }
    const datas = await this.committeeService.getSentinel(addr);
    if (datas) {
      datas.forEach(d => {
        this.brotherhoodService.addFetchingAddress(d.address);
      });
      this.committeeData = datas;
    }
  }
  searchFarmer() {
    this.committeeDataUpdate(this.committeeAddress);
  }
  committeeDestroy() {
    this.committeeState.unsubscribe();
  }

  // currentCommittee
  currentCommitteeData: any[] = [];
  currentCommitteeInit() {
    this.currentCommitteeDataUpdate();
  }
  async currentCommitteeDataUpdate() {
    const committees = await this.brotherhoodService.getCommitteeRank() || [];
    const arr = [];
    for (let i = 0, length = committees.length; i < length; i++) {
      const datas = await this.committeeService.getSentinel(committees[i]);
      const data = {
        order: i,
        address: committees[i],
        nickName: ''
      };
      if (datas.length > 0) {
        data.nickName = datas[0].nickName;
      }
      arr.push(data);
    }

    this.currentCommitteeData = arr;
  }

  // currentTeam
  currentTeamData: any[] = [];
  currentTeamInit() {

  }

  // paddingTeam
  paddingTeamData: any[] = [];
  paddingTeamInit() {

  }

  // paddingTeam
  applyTeamData: any[] = [];
  applyTeamInit() {

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
