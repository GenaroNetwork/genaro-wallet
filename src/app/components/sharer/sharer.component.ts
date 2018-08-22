import { Component, OnInit } from '@angular/core';
import { SharerService } from '../../services/sharer.service';
const { dialog } = require('electron').remote;
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-sharer',
  templateUrl: './sharer.component.html',
  styleUrls: ['./sharer.component.scss']
})
export class SharerComponent implements OnInit {

  constructor(
    public sharer: SharerService,
    private alert: NzMessageService,
  ) { }

  modalTitle = '';
  modalMessage = '';
  modalVisible = false;
  modalType = 0;
  modalDataId = '';
  addShareFilePath = '';
  addShareShareSize = '';
  addShareSelectUnit = 'TB';
  visible = false;
  hiddenVisible = false;
  bindModalVisible = false;
  bindNodeId = '';
  bindNodeAddress = '';
  bindToken = '';
  bindTokenStep = 0;

  selectFile() {
    const _this = this;
    dialog.showOpenDialog({
      title: '请选择待分享空间',
      properties: ['openDirectory']
    }, function (res) {
      if (res && res[0]) {
        _this.addShareFilePath = res[0];
      }
    });
  }

  addShare() {
    this.visible = false;
    if (!this.addShareFilePath) {
      return this.alert.error('请选择目录');
    }
    const nodeId = this.sharer.create(this.addShareShareSize, this.addShareSelectUnit, this.addShareFilePath);
    this.sharer.start(nodeId, (err) => {
      if (err) {
        return this.alert.error(err.message);
      }
    });
  }

  restartShare(data) {
    this.modalVisible = true;
    this.modalType = 1;
    this.modalTitle = 'DRIVE.RESTART';
    this.modalMessage = 'DRIVE.RESTART_CONFIRM_TIP';
    this.modalDataId = data.id;
  }

  startShare(data) {
    this.modalVisible = true;
    this.modalType = 1;
    this.modalTitle = 'DRIVE.START';
    this.modalMessage = 'DRIVE.START_CONFIRM_TIP';
    this.modalDataId = data.id;
  }

  stopShare(data) {
    this.modalVisible = true;
    this.modalType = 2;
    this.modalTitle = 'DRIVE.STOP';
    this.modalMessage = 'DRIVE.STOP_CONFIRM_TIP';
    this.modalDataId = data.id;
  }

  deleteShare(data) {
    this.modalVisible = true;
    this.modalType = 3;
    this.modalTitle = 'DRIVE.DELETE';
    this.modalMessage = 'DRIVE.DELETE_CONFIRM_TIP';
    this.modalDataId = data.id;
  }

  showLog() {
    this.sharer.openLogFolder();
  }

  openConfig(data) {
    this.sharer.openConfig(data.id);
  }

  openBindTokenDialog(data) {
    this.bindNodeId = data.id;
    this.bindNodeAddress = '';
    this.bindTokenStep = 0;
    this.bindModalVisible = true;
  }

  getBindToken() {
    if (this.bindTokenStep === 1) {
      this.bindModalVisible = false;
      return;
    }
    this.sharer.getBindToken(this.bindNodeId, this.bindNodeAddress, (err, token) => {
      if (err) {
        return this.alert.error(err.message);
      }
      this.bindToken = token;
      this.bindTokenStep = 1;
    });
  }

  handleCancel() {
    this.modalVisible = false;
    this.modalType = 0;
    this.modalTitle = '';
    this.modalMessage = '';
    this.modalDataId = '';
  }

  handleOk() {
    const id = this.modalDataId;
    switch (this.modalType) {
      case 1:
        this.sharer.restart(id, (err) => {
          if (err) {
            return this.alert.error(err.message);
          }
        });
        break;
      case 2:
        this.sharer.stop(id, (err) => {
          if (err) {
            return this.alert.error(err.message);
          }
        });
        break;
      case 3:
        this.sharer.destroy(id, (err) => {
          if (err) {
            return this.alert.error(err.message);
          }
        });
        break;
    }

    this.modalVisible = false;
    this.modalType = 0;
    this.modalTitle = '';
    this.modalMessage = '';
    this.modalDataId = '';
  }

  tableAction(event) {
    const name = event[0];
    const args = event.slice(1);
    if (this[name]) { this[name](...args); }
  }

  ngOnInit() {
    this.sharer.startAll((err) => {
      if (err) {
        // return this.alert.error(err.message);
      }
      this.sharer.status();
    });
  }
}
