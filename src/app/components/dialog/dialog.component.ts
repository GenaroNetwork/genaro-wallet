import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { CommitteeService } from '../../services/committee.service';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { nextTick } from 'q';
import { SPACE_UNIT_PRICE, TRAFFIC_UNIT_PRICE } from '../../libs/config';
import { TransactionService } from '../../services/transaction.service';
import { EdenService } from '../../services/eden.service';
import { TxEdenService } from '../../services/txEden.service';
import { SettingService } from '../../services/setting.service';
import { BrotherhoodService } from '../../services/brotherhood.service';
import { shell } from 'electron';
import { GET_AGREEMENT, GET_TUTORIAL, INSTRUCTIONS_URL, DOWNLOAD_EDEN_URL, DOWNLOAD_SHARER_URL } from '../../libs/config';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnChanges {
  version = this.settingService.appVersion;
  constructor(
    private walletService: WalletService,
    private alert: NzMessageService,
    private txService: TransactionService,
    private i18n: TranslateService,
    private edenService: EdenService,
    private txEdenService: TxEdenService,
    public settingService: SettingService,
    private brotherhoodService: BrotherhoodService,
    private committeeService: CommitteeService,
  ) { }
  @Input('name') dialogName: string = null;
  @Output('nameChange') dialogNameChange: EventEmitter<string> = new EventEmitter;
  @Input('opt') options: any = null;
  @Input('address') address: string = null;

  //  Wallet change name
  walletChangeName = '';
  walletChangeNameInit() {
    const address = this.walletService.wallets.current;
    let wallet = this.walletService.wallets.all.find(wallet => wallet.address === address);
    this.walletChangeName = wallet.name;
  }
  walletChangeNameDone() {
    const address = this.walletService.wallets.current;
    this.walletService.changeName(address, this.walletChangeName);
  }

  // wallet change password
  walletChangePassword: any = {
    old: '',
    new: '',
    repeat: '',
  };
  changePasswordStep = 0;
  walletChangePasswordInit() {
    this.changePasswordStep = 0;
    this.walletChangePassword = {
      old: '',
      new: '',
      repeat: '',
      mnemonic: ''
    };
  }
  walletChangePasswordDone() {
    return new Promise((res, rej) => {
      if (this.walletChangePassword.new.length < 6) {
        rej(this.i18n.instant('WALLETNEW.PASSWORD_NOT_SAFE_LENGTH'));
        return;
      }
      if (this.walletChangePassword.new !== this.walletChangePassword.repeat) {
        rej(this.i18n.instant('WALLETNEW.REPEAT_PASSWORD_ERROR'));
        return;
      }
      const address = this.walletService.wallets.current;
      if (this.changePasswordStep === 0) {
        try {
          this.walletService.changePassword(address, this.walletChangePassword.old, this.walletChangePassword.new);
        } catch (e) {
          rej(this.i18n.instant('WALLETNEW.OLD_PASSWORD_ERROR'));
          return;
        }
      } else {
        try {
          this.walletService.changePasswordByMnemonic(address, this.walletChangePassword.mnemonic, this.walletChangePassword.new);
        } catch (e) {
          rej(e.message);
          return;
        }
      }
      res();
    });
  }
  forgetPassword() {
    this.changePasswordStep = 1;
  }
  backToPassword() {
    this.changePasswordStep = 0;
  }

  // wallet export json
  walletExportJson = '';
  walletExportJsonInit() {
    this.walletExportJson = '';
  }
  walletExportJsonDone() {
    return new Promise((res, rej) => {
      const address = this.walletService.wallets.current;
      if (!this.walletService.validatePassword(address, this.walletExportJson)) {
        rej(this.i18n.instant('WALLETNEW.OLD_PASSWORD_ERROR'));
        return;
      }
      this.walletService.exportJson(address);
      this.alert.success(this.i18n.instant("MODEL.WALLET_EXPORT_JSON_SUCCESS"));
      res();
    });
  }

  // walelt delete
  walletDelete = '';
  walletDeleteInit() {
    this.walletDelete = '';
  }
  walletDeleteDone() {
    return new Promise((res, rej) => {
      const address = this.walletService.wallets.current;
      if (!this.walletService.validatePassword(address, this.walletDelete)) {
        rej(this.i18n.instant('WALLETNEW.OLD_PASSWORD_ERROR'));
        return;
      }
      nextTick(() => {
        this.walletService.deleteWallet(address);
      });
      res();
    });
  }

  // 购买空间
  buySpaceStep = 0;
  buySpaceLimit = 0;
  buySpaceLimitParams: number[] = [0, 30];
  buySpaceRange = 0;
  buySpaceRangeParams: number[] = [0, 1];
  buySpacePassword = '';
  buySpaceGas: number[] = [null, 2100000];
  buySpaceDisabled = false;
  SPACE_UNIT_PRICE = SPACE_UNIT_PRICE;
  buySpaceInit() {
    this.buySpaceStep = 0;
    this.buySpaceLimit = 0;
    this.buySpaceRange = 0;
    this.buySpacePassword = '';
    this.buySpaceRangeParams = [0, 1];
    this.buySpaceLimitParams = [0, 30];
  }
  async buySpaceSubmit() {
    this.buySpaceDisabled = true;
    const address = this.walletService.wallets.current;
    try {
      await this.txService.buyBucket(address, this.buySpacePassword, this.buySpaceRange, this.buySpaceLimit, this.buySpaceGas[1], this.buySpaceGas[0]);
      this.buySpaceStep++;
    } catch (e) { } finally {
      this.buySpaceDisabled = false;
    }
  }

  // 购买流量
  buyTrafficPassword = '';
  buyTrafficStep = 0;
  buyTraffic = 0;
  buyTrafficParams: number[] = [0, 1];
  buyTrafficGas: number[] = [null, 2100000];
  buyTrafficDisabled = false;
  TRAFFIC_UNIT_PRICE = TRAFFIC_UNIT_PRICE;
  buyTrafficInit() {
    this.buyTrafficPassword = '';
    this.buyTrafficStep = 0;
    this.buyTraffic = 0;
    this.buyTrafficParams = [0, 1];
  }
  async buyTrafficSubmit() {
    this.buyTrafficDisabled = true;
    const address = this.walletService.wallets.current;
    try {
      await this.txService.buyTraffic(address, this.buyTrafficPassword, this.buyTraffic, this.buyTrafficGas[1], this.buyTrafficGas[0]);
      this.buyTrafficStep++;
    } catch (e) { } finally {
      this.buyTrafficDisabled = false;
    }
  }


  // eden 需要密码
  edenNeedPass = '';
  edenNeedPassInit() {
    this.edenNeedPass = '';
  }
  edenNeedPassDone() {
    return new Promise((res, rej) => {
      if (this.edenService.generateEnv(this.edenNeedPass)) { res(); } else { (rej()); }
    });
  }
  edenNeedPassDestroy() {
    this.edenService.requestEnv = false;
  }

  // eeden 容器改名
  edenRenameBucket = '';
  edenRenameBucketId = '';
  edenRenameBucketInit() {
    this.options.forEach(value => {
      this.edenRenameBucket = this.edenService.currentView[value].name;
      this.edenRenameBucketId = this.edenService.currentView[value].id;
    });
  }
  edenRenameBucketDone() {
    return this.edenService.bucketRename(this.edenRenameBucketId, this.edenRenameBucket);
  }


  // eden 删除容器
  edenDeleteBucket: string = "";
  edenDeleteBucketInit() {
    this.edenDeleteBucket = "";
  };
  edenDeleteBucketDone() {
    return new Promise((res, rej) => {
      let address = this.walletService.wallets.current;
      if (this.walletService.validatePassword(address, this.edenDeleteBucket)) {
        this.edenService.bucketDeleteTask(this.options);
        res();
      } else {
        rej(this.i18n.instant("ERROR.PASSWORD"));
      }
    });
  }


  // txeden 需要密码
  txEdenNeedPass = '';
  async txEdenNeedPassDone() {
    await this.txEdenService.beforehandSign(this.txEdenNeedPass);
  }

  // common
  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    if (changes.dialogName) {
      if (this[`${changes.dialogName.previousValue}Destroy`]) {
        this[`${changes.dialogName.previousValue}Destroy`]();
      }
      if (this[`${changes.dialogName.currentValue}Init`]) {
        this[`${changes.dialogName.currentValue}Init`]();
      }
    }
  }
  dialogDone() {
    if (this[`${this.dialogName}Done`]) {
      const result = this[`${this.dialogName}Done`]();
      if (result instanceof Promise) {
        result.then(msg => {
          if (msg) this.alert.success(msg);
          this.dialogNameChange.emit(null);
        }).catch(msg => {
          if (msg) this.alert.error(msg);
        });
      } else {
        this.dialogNameChange.emit(null);
      }
    }
  }

  // about
  isLastestVersion = true;
  updateUrl = '';
  async checkUpdate() {
    this.isLastestVersion = true;
    const latestVersion = await this.settingService.getUpdateVersion();
    if (!latestVersion && latestVersion.version && latestVersion.url) {
      const lv = latestVersion.split('.');
      const cv = this.version.split('.');
      for (let index = 0, length = lv.length; index < length; index++) {
        const lvn = parseInt(lv[index]);
        const cvn = parseInt(cv[index]);
        if (lvn > cvn) {
          this.isLastestVersion = false;
          this.updateUrl = latestVersion.url;
          break;
        }
      }
    }
  }
  openUpdateVersion() {
    shell.openExternal(GET_TUTORIAL(this.updateUrl));
  }

  // joinCommittee
  joinCommitteeGas: number[] = [18, 2100000];
  joinCommitteeStep: number = 0;
  joinCommitteePassword: string = '';
  joinCommitteeMainAddress: string = '';
  joinCommitteeInit() {
    this.joinCommitteeStep = 0;
    this.joinCommitteePassword = '';
    this.joinCommitteeMainAddress = this.address;
  }
  async joinCommitteeSubmit() {
    const address = this.walletService.wallets.current;
    await this.brotherhoodService.applyBrotherhood(this.joinCommitteeMainAddress, address, this.joinCommitteePassword, this.joinCommitteeGas[1], this.joinCommitteeGas[0]);
    this.joinCommitteeStep++;
    this.committeeService.update(address, this.joinCommitteeMainAddress);
  }

  // approveJoin
  approveJoinGas: number[] = [18, 2100000];
  approveJoinStep: number = 0;
  approveJoinPassword: string = '';
  approveJoinMainAddress: string = '';
  approveJoinInit() {
    this.approveJoinStep = 0;
    this.approveJoinMainAddress = this.address;
  }
  async approveJoinSubmit() {
    const address = this.walletService.wallets.current;
    await this.brotherhoodService.approveBrotherhood(this.approveJoinMainAddress, address, this.approveJoinPassword, this.approveJoinGas[1], this.approveJoinGas[0]);
    this.approveJoinStep++;
    setTimeout(this.committeeService.refreshSentinelRank.bind(this.committeeService), 5000);
  }

  // relieve
  relieveGas: number[] = [18, 2100000];
  relieveStep: number = 0;
  relievePassword: string = '';
  relieveMainAddress: string = '';
  relieveInit() {
    this.relieveStep = 0;
    this.relieveMainAddress = this.address;
  }
  async relieveSubmit() {
    const address = this.walletService.wallets.current;
    if (address === this.relieveMainAddress) {
      await this.txService.unBrotherAll(address, this.relievePassword, this.relieveGas[1], this.relieveGas[0]);
    } else {
      await this.txService.unBrotherSingle(address, this.relievePassword, this.relieveMainAddress, this.relieveGas[1], this.relieveGas[0]);
    }
    this.relieveStep++;
    setTimeout(this.committeeService.refreshSentinelRank.bind(this.committeeService), 5000);
  }
}
