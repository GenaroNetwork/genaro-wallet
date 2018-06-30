import { Component, OnInit } from '@angular/core';
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
    private sharer: SharerService,
  ) { }

  driversData: Array<Object> = [];
  gettingStatus: boolean = false;
  modalTitle: string = "";
  modalMessage: string = "";
  modalVisible: boolean = false;
  modalType: number = 0;
  modalDataId: string = "";
  addShareFilePath: string = "";
  addShareShareSize: string = "";
  addShareSelectUnit: string = "GB";
  visible: boolean = false;


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
    this.sharer.runDaemon((err) => {
      if (err) {
        return alert(err.message);
      }
      this.sharer.startAll((err) => {
        if (err) {
          //return alert(err.message);
        }
      });

      setInterval(() => {
        if (this.gettingStatus) {
          return;
        }
        this.gettingStatus = true;
        this.sharer.status((err, statuses) => {
          if (err) {
            return alert(err.message);
          }
          let datas = [];
          let connectId = "";
          statuses.forEach(share => {
            let data = {
              id: "",
              location: "",
              shareBasePath: "",
              spaceUsed: "",
              storageAllocation: "",
              percentUsed: 0,
              time: "",
              restarts: "",
              peers: "",
              contractCount: "",
              dataReceivedCount: "",
              bridges: 0,
              allocs: "",
              listenPort: "",
              connectionType: "",
              portColor: "",
              bridgesText: "",
              bridgesColor: "",
              state: 0,
              statusSwitch: false,
              status: "",
              statusColor: "",
              delta: "",
              deltaColor: "",
              show: false
            },
              config = share.config,
              farmerState = share.meta.farmerState || {},
              portStatus = farmerState.portStatus || {},
              ntpStatus = farmerState.ntpStatus || {};
            data.id = share.id;
            data.location = config.storagePath;
            data.shareBasePath = config.shareBasePath;
            data.spaceUsed = (!farmerState.spaceUsed || farmerState.spaceUsed == '...') ? "0KB" : farmerState.spaceUsed;
            data.storageAllocation = config.storageAllocation;
            data.percentUsed = (farmerState.percentUsed == '...' ? 0 : farmerState.percentUsed) || 0;
            data.time = prettyms(share.meta.uptimeMs);
            data.restarts = share.meta.numRestarts || 0;
            data.peers = farmerState.totalPeers;
            data.contractCount = farmerState.contractCount || 0;
            data.dataReceivedCount = farmerState.dataReceivedCount || 0;
            data.bridges = farmerState.bridgesConnectionStatus || 0;
            data.allocs = data.bridges === 0 ? "0" : data.contractCount + '(' + data.dataReceivedCount + 'received)';

            data.listenPort = portStatus.listenPort;
            data.connectionType = portStatus.connectionType;
            switch (portStatus.connectionStatus) {
              case 0:
                data.portColor = 'text-green';
                break;
              case 1:
                data.portColor = 'text-yellow';
                break;
              case 2:
                data.portColor = 'text-red';
                break;
            }

            switch (data.bridges) {
              case 0:
                data.bridgesText = "disconnected";
                data.bridgesColor = 'text-gray';
                break;
              case 1:
                data.bridgesText = "connecting";
                data.bridgesColor = 'text-yellow';
                break;
              case 2:
                data.bridgesText = "confirming";
                data.bridgesColor = 'text-orange';
                break;
              case 3:
                data.bridgesText = "connected";
                data.bridgesColor = 'text-green';
                break;
            }

            data.state = share.state;
            switch (data.state) {
              case 0:
                data.statusSwitch = false;
                data.status = 'stopped';
                data.statusColor = 'text-gray';
                break;
              case 1:
                data.statusSwitch = true;
                connectId = share.id;
                data.status = 'running';
                data.statusColor = 'text-green';
                break;
              case 2:
                data.statusSwitch = false;
                data.status = 'errored';
                data.statusColor = 'text-red';
                break;
              default:
                data.status = 'unknown';
                break;
            }

            data.delta = ntpStatus.delta || '...';
            switch (ntpStatus.status) {
              case 0:
                data.deltaColor = 'text-green';
                break;
              case 1:
                data.deltaColor = 'text-yellow';
                break;
              case 2:
                data.deltaColor = 'text-red';
                break;
            }

            data.show = false;

            datas.push(data);
          })
          this.driversData = datas;
          this.gettingStatus = false;
        });
      }, 3000)
    });
  }
}
