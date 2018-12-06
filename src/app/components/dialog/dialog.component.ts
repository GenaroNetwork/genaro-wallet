import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange, NgZone } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { CommitteeService } from '../../services/committee.service';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '../../services/translate.service';
import { nextTick } from 'q';
import { SPACE_UNIT_PRICE, TRAFFIC_UNIT_PRICE } from '../../libs/config';
import { TransactionService } from '../../services/transaction.service';
import { EdenService } from '../../services/eden.service';
import { TxEdenService } from '../../services/txEden.service';
import { SettingService } from '../../services/setting.service';
import { BrotherhoodService } from '../../services/brotherhood.service';
import { NickService } from '../../services/nick.service';
import { remote } from 'electron';
import { v1 as uuidv1 } from 'uuid';
import { basename } from "path";

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
    private nickService: NickService,
    private zone: NgZone,
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
      this.txEdenService.getAll();
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
  async edenNeedPassDone() {
    await this.txEdenService.beforehandSign(this.edenNeedPass);
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
  edenDeleteBucket: string = '';
  edenDeleteShareFiles: string = '';
  async edenDeleteBucketInit() {
    this.edenDeleteShareFiles = '';
    let buckets = this.options;
    let sharedFiles = [];
    let allSharedFiles = this.txEdenService.shareFileList.from;
    for (let index = 0, bucketLength = buckets.length; index < bucketLength; index++) {
      let files = await this.edenService.getFilesByBucketId(buckets[index].id) || [];
      files.forEach(file => {
        for (let i = 0, length = allSharedFiles.length; i < length; i++) {
          if (file.id === allSharedFiles[i].bucketEntryId) {
            sharedFiles.push(file);
            break;
          }
        }
      });
    }
    if (sharedFiles.length > 0) {
      sharedFiles.forEach(file => {
        this.edenDeleteShareFiles += file.filename + ',';
      });
      if (this.edenDeleteShareFiles.lastIndexOf(',')) {
        this.edenDeleteShareFiles = this.edenDeleteShareFiles.substring(0, this.edenDeleteShareFiles.length - 1);
      }
      if (this.edenDeleteShareFiles.length > 6) {
        this.edenDeleteShareFiles = this.edenDeleteShareFiles.substring(0, 6) + '...';
      }
    }
    this.edenDeleteBucket = '';
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

  // eden 删除文件
  edenDeleteFileNames: string = "";
  edenDeleteFilesInit() {
    this.edenDeleteFileNames = "";
    let allSharedFiles = this.txEdenService.shareFileList.from;
    this.options.forEach(file => {
      for (let i = 0, length = allSharedFiles.length; i < length; i++) {
        if (file.id === allSharedFiles[i].bucketEntryId) {
          this.edenDeleteFileNames += file.name + ',';
          break;
        }
      }
    });
    if (this.edenDeleteFileNames.lastIndexOf(',')) {
      this.edenDeleteFileNames = this.edenDeleteFileNames.substring(0, this.edenDeleteFileNames.length - 1);
    }
    if (this.edenDeleteFileNames.length > 6) {
      this.edenDeleteFileNames = this.edenDeleteFileNames.substring(0, 6) + '...';
    }
  };
  edenDeleteFilesDone() {
    this.edenService.fileRemoveTask(this.options);
  }


  // txeden 需要密码
  txEdenNeedPass = '';
  async txEdenNeedPassDone() {
    await this.txEdenService.beforehandSign(this.txEdenNeedPass);
    return new Promise((res, rej) => {
      if (this.edenService.generateEnv(this.txEdenNeedPass)) { res(); } else { (rej()); }
    });
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

  // 扩容空间
  spaceExpansionStep = 0;
  spaceExpansionLimit = 0;
  spaceExpansionLimitParams: number[] = [0, 30];
  spaceExpansionRange = 0;
  spaceExpansionRangeParams: number[] = [0, 1];
  spaceExpansionPassword = '';
  spaceExpansionGas: number[] = [null, 2100000];
  spaceExpansionDisabled = false;
  spaceExpansionBucket: any = null;
  spaceExpansionPrice: number = 0;
  spaceExpansionInit() {
    this.spaceExpansionStep = 0;
    this.spaceExpansionLimit = 0;
    this.spaceExpansionRange = 0;
    this.spaceExpansionPassword = '';
    this.spaceExpansionRangeParams = [0, 1];
    this.spaceExpansionLimitParams = [0, 30];
    this.spaceExpansionBucket = this.options;
    this.spaceExpansionPrice = 0;
  }
  async spaceExpansionSubmit() {
    this.spaceExpansionDisabled = true;
    const address = this.walletService.wallets.current;
    try {
      await this.txService.bucketSupplement(address, this.spaceExpansionPassword, this.spaceExpansionBucket.bucketId, this.spaceExpansionRange, this.spaceExpansionLimit, this.spaceExpansionGas[1], this.spaceExpansionGas[0]);
      this.spaceExpansionStep++;
    } catch (e) { } finally {
      this.spaceExpansionDisabled = false;
    }
  }
  calcPrice() {
    let timeNow = Date.now() / 1000,
      timeStart = this.spaceExpansionBucket.timeStart,
      timeEnd = this.spaceExpansionBucket.timeEnd,
      limitStorage = this.spaceExpansionBucket.limitStorage / 1024 / 1024 / 1024,
      durationTime = (timeEnd - timeNow) / (timeEnd - timeStart);
    this.spaceExpansionPrice = ((durationTime * this.spaceExpansionRange) + (limitStorage + this.spaceExpansionRange) * this.spaceExpansionLimit) * this.SPACE_UNIT_PRICE;
    if (this.spaceExpansionPrice !== 0 && this.spaceExpansionPrice < 0.01) {
      this.spaceExpansionPrice = 0.01;
    }
  }


  // shareFile
  shareFileStep = 0;
  shareFilePassword = '';
  shareFileGas: number[] = [null, 2100000];
  shareFileInfo: any = {};
  shareFileDisabled = false;
  shareFileRecipient = '';
  shareFileChargePrice = 0;
  shareFileInit() {
    this.shareFileStep = 0;
    this.shareFilePassword = '';
    this.shareFileInfo = this.options;
    this.shareFileDisabled = false;
    this.shareFileRecipient = '';
    this.shareFileChargePrice = 0;
  }
  async shareFileSubmit() {
    this.shareFileDisabled = true;
    const address = this.walletService.wallets.current;
    try {
      let key = await this.edenService.shareFile(this.shareFileInfo.rsaKey, this.shareFileInfo.rsaCtr, this.shareFileRecipient);
      if (key && key.key.cipher && key.ctr.cipher) {
        let share = await this.walletService.shareFile(address, this.shareFilePassword, this.shareFileInfo.id, this.shareFileRecipient, this.shareFileChargePrice, this.shareFileInfo.name, key);
        await this.txService.shareFile(address, this.shareFileRecipient, this.shareFilePassword, this.shareFileChargePrice, this.shareFileInfo.id, share._id, this.spaceExpansionGas[1], this.spaceExpansionGas[0]);
        this.shareFileStep++;
      }
      else {
        this.alert.error(this.i18n.instant("ERROR.NO_SHARE_KEY"));
        this.shareFileDisabled = false;
      }
    } catch (e) { } finally {
      this.shareFileDisabled = false;
    }
  }

  // agreeShare
  agreeShareStep = 0;
  agreeSharePassword = '';
  agreeShareBucketId = '';
  agreeShareDisabled = false;
  agreeShareInfo: any = {};
  agreeShareBuckets: any = [];
  agreeShareGas: number[] = [null, 2100000];
  agreeShareInit() {
    this.agreeShareStep = 0;
    this.agreeSharePassword = '';
    this.agreeShareBucketId = '';
    this.agreeShareDisabled = false;
    this.agreeShareInfo = this.options;
    this.agreeShareBuckets = (this.edenService.currentBuckets || []).filter(bucket => {
      if (this.edenService.mail.inbox === bucket.id || this.edenService.mail.outbox === bucket.id) {
        return false;
      }
      return true
    });
  }
  async agreeShareSubmit() {
    this.agreeShareDisabled = true;
    const address = this.walletService.wallets.current;
    try {
      if (!(await this.walletService.getShareExist(this.agreeShareInfo._id))) {
        return this.alert.error(this.i18n.instant("ERROR.SHARE_FILE_NOT_EXIST"));
      }
      await this.txService.agreeShare(address, this.agreeSharePassword, this.agreeShareInfo._id, this.agreeShareGas[1], this.agreeShareGas[0]);
      await this.walletService.agreeShare(address, this.agreeSharePassword, this.agreeShareInfo._id, this.agreeShareBucketId);
      this.agreeShareStep++;
    } catch (e) { } finally {
      this.agreeShareDisabled = false;
    }
  }
  agreeShareBucketChange(id) {
    this.agreeShareBucketId = id;
  }

  // rejectShare
  rejectShareStep = 0;
  rejectSharePassword = '';
  rejectShareDisabled = false;
  rejectShareInfo: any = {};
  rejectShareInit() {
    this.rejectShareStep = 0;
    this.rejectSharePassword = '';
    this.rejectShareDisabled = false;
    this.rejectShareInfo = this.options;
  }
  async rejectShareSubmit() {
    this.rejectShareDisabled = true;
    const address = this.walletService.wallets.current;
    try {
      await this.walletService.rejectShare(address, this.rejectSharePassword, this.rejectShareInfo._id);
      await this.txEdenService.getUserShares();
      this.rejectShareStep++;
    } catch (e) { } finally {
      this.rejectShareDisabled = false;
    }
  }

  // deleteShare
  deleteShareStep = 0;
  deleteSharePassword = '';
  deleteShareDisabled = false;
  deleteShareInfo: any = {};
  deleteShareInit() {
    this.deleteShareStep = 0;
    this.deleteSharePassword = '';
    this.deleteShareDisabled = false;
    this.deleteShareInfo = this.options;
  }
  async deleteShareSubmit() {
    this.deleteShareDisabled = true;
    const address = this.walletService.wallets.current;
    try {
      await this.walletService.deleteShare(address, this.deleteSharePassword, this.deleteShareInfo._id, this.deleteShareInfo.type);
      await this.txEdenService.getUserShares();
      this.deleteShareStep++;
    } catch (e) { } finally {
      this.deleteShareDisabled = false;
    }
  }

  // setInbox
  setInboxPass = '';
  setInboxInit() {
    this.setInboxPass = '';
  }
  async setInboxDone() {
    const address = this.walletService.wallets.current;
    await this.walletService.setInOutbox(address, this.setInboxPass, this.options, 'inbox');
  }

  // setOutbox
  setOutboxPass = '';
  setOutboxInit() {
    this.setOutboxPass = '';
  }
  async setOutboxDone() {
    const address = this.walletService.wallets.current;
    await this.walletService.setInOutbox(address, this.setOutboxPass, this.options, 'outbox');
  }

  // signInMessage
  signInMessageStep = 0;
  signInMessagePassword = '';
  signInMessageGas: number[] = [null, 2100000];
  signInMessageDisabled = false;

  // 0: all  1: usage 2: free  3: attaches
  signInMessageAttahcesSize: number[] = [];
  signInMessageInit() {
    this.signInMessageStep = 0;
    this.signInMessagePassword = '';
    this.options.attaches = this.options.attaches || [];
    let inbox = this.edenService.currentBuckets.find(bucket => bucket.id === this.edenService.mail.inbox);
    this.signInMessageAttahcesSize = [inbox.limitStorage, inbox.usedStorage, inbox.limitStorage - inbox.usedStorage, 0];
    this.options.attaches.forEach(attach => {
      this.signInMessageAttahcesSize[3] += attach.fileSize;
    });
  }
  async signInMessageSubmit() {
    this.signInMessageDisabled = true;
    nextTick(async () => {
      const address = this.walletService.wallets.current;
      try {
        for (let attach of this.options.attaches) {
          await this.txService.agreeShare(address, this.signInMessagePassword, attach._id, this.signInMessageGas[1], this.signInMessageGas[0]);
          await this.walletService.agreeShare(address, this.signInMessagePassword, attach._id, this.edenService.mail.inbox);
        }
        await this.txService.agreeShare(address, this.signInMessagePassword, this.options.mail._id, this.signInMessageGas[1], this.signInMessageGas[0]);
        await this.walletService.rejectShare(address, this.signInMessagePassword, this.options.mail._id);
        this.edenService.updateAll();
        this.signInMessageStep++;
      } catch (e) { } finally {
        this.signInMessageDisabled = false;
      }
    });
  }

  // sendMessage
  sendMessageStep = 0;
  sendMessageTo = '';
  sendMessageToAddress = '';
  sendMessageId = null;
  sendMessageTitle = '';
  sendMessageContent = '';
  sendMessagePassword = '';
  sendMessageGas: number[] = [null, 2100000];
  sendMessageAttaches: any[] = null;
  sendMessageDisabled = false;
  sendMessageInit() {
    this.sendMessageStep = 0;
    this.sendMessageTo = '';
    this.sendMessageId = Date.now();
    this.sendMessageToAddress = '';
    this.sendMessageTitle = '';
    this.sendMessageContent = '';
    this.sendMessagePassword = '';
    this.sendMessageAttaches = [];
  }
  sendMessageAttach() {
    let files = remote.dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });

    files.forEach(async file => {
      let attach = {
        name: basename(file),
        percentage: 10,
        rsaKey: null,
        rsaCtr: null,
        id: null,
        taskEnv: null,
        done: false,
      };
      this.sendMessageAttaches.push(attach);
      let { rsaKey, rsaCtr, taskEnv } = await this.edenService.mailAttach(this.options, `1|${this.sendMessageId}|${attach.name}`, file,
        (process, allBytes) => {
          this.zone.run(() => {
            let percentage = process * 100;
            attach.percentage = percentage <= 10 ? 10 : percentage;
          });
        },
        (err, fileId) => {
          if (err) {
            console.error(err);
            return;
          }
          this.zone.run(() => {
            attach.percentage = 100;
            attach.id = fileId;
            attach.done = true;
          });
        });
      attach.rsaKey = rsaKey;
      attach.rsaCtr = rsaCtr;
      attach.taskEnv = taskEnv;
    });
  }
  sendMessageRemoveAttach(i) {
    let attach = this.sendMessageAttaches[i];
    this.sendMessageAttaches.splice(i, 1);
    if (!attach.taskEnv) return;
    if (attach.done) { }
    else {
      let env = this.edenService.allEnvs[this.walletService.wallets.current];
      env.storeFileCancel(attach.taskEnv);
    }
  }

  async sendMessageSubmit(submit: boolean = true) {
    if (!submit) {
      let uploaded = true;
      for (let attach of this.sendMessageAttaches) {
        if (!attach.done) uploaded = false
      }
      if (uploaded) this.sendMessageStep++;
      else this.alert.error("您添加的附件正在上传中，请上传成功后再发送邮件。");
      return;
    }
    this.sendMessageDisabled = true;
    nextTick(async () => {
      let sendMessageTitle = this.sendMessageTitle;
      sendMessageTitle = `0|${this.sendMessageId}|${sendMessageTitle}`
      const address = this.walletService.wallets.current;
      try {
        let nickAddress = await this.nickService.getAddress(this.sendMessageTo);
        if (!nickAddress) {
          nickAddress = await this.txService.getAccountByName(this.sendMessageTo);
          if (nickAddress) {
            this.nickService.update(nickAddress, this.sendMessageTo);
          }
        }
        this.sendMessageToAddress = nickAddress || this.sendMessageTo;
        // 发送附件 
        let promises = [];
        for (let attach of this.sendMessageAttaches) {
          let promise = new Promise(async (res, rej) => {
            let key = await this.edenService.shareFile(attach.rsaKey, attach.rsaCtr, this.sendMessageToAddress);
            let share = await this.walletService.shareMail(address, this.sendMessagePassword, attach.id, this.sendMessageToAddress, 0, `1|${this.sendMessageId}|${attach.name}`, key);
            await this.txService.shareFile(address, this.sendMessageToAddress, this.sendMessagePassword, 0, attach.id, share._id, this.sendMessageGas[1], this.sendMessageGas[0]);
          });
          promises.push(promise);
        };

        await Promise.all(promises);
        let message = await this.edenService.sendMessageTask(this.sendMessageToAddress, this.sendMessageId, sendMessageTitle, this.sendMessageContent, this.options);
        let { fileId, fileSize, fileHash, key, ctr, str } = message;
        this.edenService.encryptMetaToFile(str, fileId);
        let shareKey = await this.edenService.shareFile(key, ctr, this.sendMessageToAddress);
        if (shareKey && shareKey.key.cipher && shareKey.ctr.cipher) {
          let share = await this.walletService.shareMail(address, this.sendMessagePassword, fileId, this.sendMessageToAddress, 0, sendMessageTitle, shareKey);
          await this.txService.shareFile(address, this.sendMessageToAddress, this.sendMessagePassword, 0, fileId, share._id, this.sendMessageGas[1], this.sendMessageGas[0], fileSize, fileHash);
          this.sendMessageStep++;
        } else {
          this.alert.error(this.i18n.instant("EDEN.SEND_MESSAGE_ERROR"));
          this.sendMessageDisabled = false;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.sendMessageDisabled = false;
      }
    });
  }

  // openMessage
  openMessageTitle = '';
  openMessageContent = '';
  openMessageFromAddress = '';
  openMessageToAddress = '';
  async openMessageInit() {
    this.openMessageTitle = '';
    this.openMessageFromAddress = '';
    this.openMessageToAddress = '';
    this.openMessageContent = '';
    try {
      let data = await this.edenService.showMessage(this.options.file, this.options.bucketId);
      if (data) {
        let { title, content, fromAddress, toAddress } = <{ title, content, fromAddress, toAddress }>data;
        this.openMessageTitle = title.substr(16);
        this.openMessageContent = content;
        this.openMessageFromAddress = (await this.nickService.getNick(fromAddress)) || fromAddress;
        this.openMessageToAddress = (await this.nickService.getNick(toAddress)) || toAddress;
      }
    } catch (e) { }
  }
  async openMessageDownload(attach) {
    let fileName = `1|${attach.mailId}|${attach.fileName}`;
    let user = this.txEdenService.currentUser;
    let used = user.usedDownloadBytes || 0;
    let all = user.limitBytes || 0;
    let file = this.edenService.currentFiles.find(file => file.name === fileName);
    let fileForDownload = Object.assign({}, file);
    fileForDownload.name = attach.fileName;
    this.edenService.fileDownloadTask(fileForDownload, all - used, true)
  }

  // deleteMesage
  deleteMessageStep = 0;
  deleteMessagePassword = '';
  deleteMessageDisabled = false;
  deleteMessageInfo: any = {};
  deleteMessageInit() {
    this.deleteMessageStep = 0;
    this.deleteMessagePassword = '';
    this.deleteMessageDisabled = false;
    this.deleteMessageInfo = this.options;
  }
  async deleteMessageSubmit() {
    this.deleteMessageDisabled = true;
    const address = this.walletService.wallets.current;
    try {
      await this.walletService.deleteShare(address, this.deleteMessagePassword, this.deleteMessageInfo.shareId, this.deleteMessageInfo.type);
      if (this.deleteMessageInfo.fileId) {
        await this.edenService.fileRemoveTask([{ id: this.deleteMessageInfo.fileId }]);
      }
      this.deleteMessageStep++;
    } catch (e) { } finally {
      this.deleteShareDisabled = false;
    }
  }

  // applyNick
  applyNickStep = 0;
  applyNickName = '';
  applyNickPassword = '';
  applyNickDisabled = false;
  applyNickGas: number[] = [null, 2100000];
  applyNickPrice = 0;
  applyNickInit() {
    this.applyNickStep = 0;
    this.applyNickName = '';
    this.applyNickPassword = '';
    this.applyNickDisabled = false;
  }
  async getNamePrice() {
    try {
      const nickAddress = await this.txService.getAccountByName(this.applyNickName);
      if (nickAddress) {
        return this.alert.error("别名已被使用");
      }
      this.applyNickPrice = parseInt(await this.txService.getNamePrice(this.applyNickName), 16) / Math.pow(10, 18);
      this.applyNickStep++;
    } catch (e) { } finally {
      this.applyNickDisabled = false;
    }
  }
  async applyNickSubmit() {
    this.applyNickDisabled = true;
    const address = this.walletService.wallets.current;
    try {
      await this.txService.applyNick(address, this.applyNickPassword, this.applyNickName, this.applyNickGas[1], this.applyNickGas[0]);
      this.nickService.update('0x' + this.walletService.wallets.current, this.applyNickName);
      this.walletService.wallets.currentNick = this.applyNickName;
      this.applyNickStep++;
    } catch (e) { } finally {
      this.applyNickDisabled = false;
    }
  }
}
