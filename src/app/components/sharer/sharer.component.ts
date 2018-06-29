import { Component, OnInit } from '@angular/core';
import { SharerService } from '../../services/sharer.service';
const prettyms = require('pretty-ms');
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

  ngOnInit() {
    this.sharer.runDaemon((err) => {
      if (err) {
        return alert(err.message);
      }
      this.sharer.startAll((err) => {
        if (err) {
          return alert(err.message);
        }
      });

      setInterval(() => {
        debugger;
        this.sharer.status((err, statuses) => {
          debugger;
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
              percentUsed: "",
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
            data.percentUsed = farmerState.percentUsed == '...' ? 0 : farmerState.percentUsed;
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
        });
      }, 3000)
    });
  }
}
