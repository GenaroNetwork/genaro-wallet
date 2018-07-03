import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SharerService } from '../../services/sharer.service';
const prettyms = require('pretty-ms');
const { dialog } = require('electron').remote;

@Component({
  selector: 'app-sharer',
  templateUrl: './sharer.component.html',
  styleUrls: ['./sharer.component.scss']
})
export class SharerComponent implements OnInit {

  constructor(
    private changeRef: ChangeDetectorRef,
    private sharer: SharerService,
  ) { }

  modalTitle: string = "";
  modalMessage: string = "";
  modalVisible: boolean = false;
  modalType: number = 0;
  modalDataId: string = "";
  addShareFilePath: string = "";
  addShareShareSize: string = "";
  addShareSelectUnit: string = "GB";
  visible: boolean = false;

  nodeColShow: boolean = true;
  statusColShow: boolean = true;
  uptimeColShow: boolean = true;
  restartsColShow: boolean = false;
  peersColShow: boolean = false;
  allocsColShow: boolean = false;
  deltaColShow: boolean = false;
  portColShow: boolean = true;
  sharedColShow: boolean = true;
  bridgesColShow: boolean = true;


  selectFile() {
    var _this = this;
    dialog.showOpenDialog({
      title: "请选择待分享空间",
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
      return alert("请选择目录");
    }
    let nodeId = this.sharer.create(this.addShareShareSize, this.addShareSelectUnit, this.addShareFilePath);
    this.sharer.start(nodeId, (err) => {
      if (err) {
        return alert(err);
      }
    });
  }

  restartShare(data) {
    this.modalVisible = true;
    this.modalType = 1;
    this.modalTitle = "DRIVE.RESTART";
    this.modalMessage = "DRIVE.RESTART_CONFIRM_TIP";
    this.modalDataId = data.id;
  }

  startShare(data) {
    this.modalVisible = true;
    this.modalType = 1;
    this.modalTitle = "DRIVE.START";
    this.modalMessage = "DRIVE.START_CONFIRM_TIP";
    this.modalDataId = data.id;
  }

  stopShare(data) {
    this.modalVisible = true;
    this.modalType = 2;
    this.modalTitle = "DRIVE.STOP";
    this.modalMessage = "DRIVE.STOP_CONFIRM_TIP";
    this.modalDataId = data.id;
  }

  deleteShare(data) {
    this.modalVisible = true;
    this.modalType = 3;
    this.modalTitle = "DRIVE.DELETE";
    this.modalMessage = "DRIVE.DELETE_CONFIRM_TIP";
    this.modalDataId = data.id;
  }

  showLog(data) {
    this.sharer.openLogFolder();
  }

  openConfig(data) {
    this.sharer.openConfig(data.id);
  }

  handleCancel() {
    this.modalVisible = false;
    this.modalType = 0;
    this.modalTitle = "";
    this.modalMessage = "";
    this.modalDataId = "";
  }

  handleOk() {
    var id = this.modalDataId;
    switch (this.modalType) {
      case 1:
        this.sharer.restart(id, (err) => {
          if (err) {

          }
        });
        break;
      case 2:
        this.sharer.stop(id, (err) => {

        });
        break;
      case 3:
        this.sharer.destroy(id, (err) => {
          if (err) {

          }
        });
        break;
    }

    this.modalVisible = false;
    this.modalType = 0;
    this.modalTitle = "";
    this.modalMessage = "";
    this.modalDataId = "";
  }

  ngOnInit() {
    this.sharer.startAll((err) => {
      if (err) {
        //return alert(err.message);
      }
      this.sharer.status();
    });
  }
}
