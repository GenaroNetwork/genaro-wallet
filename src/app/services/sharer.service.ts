import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shell } from 'electron';
import Dnode from 'dnode';
import prettyms from 'pretty-ms';
import { TransactionService } from './transaction.service';
import { DAEMON_CONFIG } from '../libs/config';
import { IpcService } from './ipc.service';

const path = require('path');
const fs = require('fs');
const os = require('os');
const BASE_PATH = path.join(os.homedir(), '.config/genaroshare');
const CONFIG_DIR = path.join(BASE_PATH, 'configs_testchain');
const LOG_DIR = path.join(BASE_PATH, 'logs');

@Injectable({
  providedIn: 'root'
})
export class SharerService {
  public driversData: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public tableOpt: any = {
    nodeColShow: true,
    statusColShow: true,
    uptimeColShow: true,
    restartsColShow: false,
    peersColShow: false,
    allocsColShow: false,
    deltaColShow: false,
    portColShow: true,
    sharedColShow: true,
    bridgesColShow: true,
    addressColShow: true,
  };
  private configIds: any[] = [];
  private interval: any = null;
  private mkdirPSync(dirpath, made) {
    if (!made) { made = null; }
    dirpath = path.normalize(dirpath);
    try {
      fs.mkdirSync(dirpath);
      made = made || dirpath;
    } catch (err) {
      if (err.code === 'ENOENT') {
        made = this.mkdirPSync(path.dirname(dirpath), made);
        this.mkdirPSync(dirpath, made);
      } else {
        try {
          const stat = fs.statSync(dirpath);
          if (!stat.isDirectory()) {
            throw err;
          }
        } catch (err) {
          throw err;
        }
      }
    }
    return made;
  }

  private initConfigs() {
    fs.readdirSync(CONFIG_DIR).forEach(file => {
      const fileobj = path.parse(file);
      if (fileobj.ext === '.json' && fileobj.name.length === 40) {
        this.configIds.push(fileobj.name);
      }
    });
  }

  private getPrivateKey() {
    return this.ipc.ipcSync('storj.lib.getPrivateKey');
  }

  private getNodeID(key) {
    return this.ipc.ipcSync('storj.lib.getNodeID', [key]);
  }

  private validateConfig(config) {
    return this.ipc.ipcSync('storj.lib.validateConfig', [config]);
  }
  private getConfigPathById(nodeId) {
    return path.join(
      CONFIG_DIR,
      `${nodeId}.json`
    );
  }

  private getNewPort(defaultPort) {
    const ids = this.getSharerNodeIds();
    const usedPorts = ids.map(id => {
      const path = this.getConfigPathById(id);
      try {
        const config = JSON.parse(fs.readFileSync(path).toString());
        return config.rpcPort;
      } catch (err) {
        return 0;
      }
    });
    while (usedPorts.indexOf(defaultPort) > -1) {
      defaultPort++;
    }
    return defaultPort;
  }

  private convert(space) {
    const start = space.match(/([KMGT]?)B/);
    const head = parseFloat(space.substring(0, start.index));
    const tail = space.substring(start.index);
    const vmap = new Map();
    vmap.set("B", 1);
    vmap.set("KB", Math.pow(10, 3));
    vmap.set("MB", Math.pow(10, 6));
    vmap.set("GB", Math.pow(10, 9));
    vmap.set("TB", Math.pow(10, 12));

    return (vmap.get(tail) * head);
  }

  getSharerNodeIds() {
    this.configIds = [];
    this.initConfigs();
    return this.configIds || [];
  }

  create(shareSize, shareUnit, shareBasePath) {
    let configFileDescriptor;
    let storPath;
    const config = DAEMON_CONFIG.prodConfig;
    config.networkPrivateKey = this.getPrivateKey();
    const nodeID = this.getNodeID(config.networkPrivateKey);
    config.storagePath = shareBasePath;
    try {
      this.mkdirPSync(shareBasePath, null);
    } catch (err) { }

    if (config.storagePath === undefined || config.storagePath === '') {
      storPath = path.join('/', nodeID);
    } else {
      storPath = path.join(config.storagePath, '/');
    }

    config.storagePath = storPath;
    config.storageAllocation = shareSize + shareUnit;
    config.rpcPort = this.getNewPort(config.rpcPort);

    const configFilePath = path.join(
      CONFIG_DIR,
      `${nodeID}.json`
    );

    config.loggerOutputFile = LOG_DIR;
    const configArray = JSON.stringify(config, null, 2).split('\n');
    const configBuffer = Buffer.from(configArray.join('\n'));
    try {
      const err = this.validateConfig(config);
      if (err) {
        throw err;
      }
      configFileDescriptor = fs.openSync(configFilePath, 'w');
      fs.writeFileSync(configFileDescriptor, configBuffer);
    } catch (err) {
      console.error(err);
    } finally {
      if (configFileDescriptor) {
        fs.closeSync(configFileDescriptor);
      }
    }
    this.initConfigs();
    return nodeID;
  }

  private remove(nodeId) {
    const configPath = this.getConfigPathById(nodeId);
    fs.unlinkSync(configPath);
  }

  start(nodeId, cb) {
    const dnode = new Dnode(undefined, { weak: false });
    const d = dnode.connect(DAEMON_CONFIG.RPC_PORT);
    d.on('remote', (remote) => {
      const configPath = this.getConfigPathById(nodeId);
      remote.start(configPath, (err) => {
        if (cb) {
          cb(err);
        }
        d.end();
      });
    });
  }

  startAll(cb) {
    const errs = [];
    let len = this.configIds.length;
    this.configIds.forEach(nodeId => {
      this.start(nodeId, err => {
        if (err) {
          errs.push(err);
        }
        len--;
        if (cb) {
          if (len === 0) {
            if (errs.length > 0) {
              cb(errs);
            } else {
              cb();
            }
          }
        }
      });
    });
  }

  stop(nodeId, cb) {
    const dnode = new Dnode(undefined, { weak: false });
    const d = dnode.connect(DAEMON_CONFIG.RPC_PORT);
    d.on('remote', (remote) => {
      remote.stop(nodeId, (err) => {
        if (cb) {
          cb(err);
        }
        d.end();
      });
    });
  }

  restart(nodeId, cb) {
    const dnode = new Dnode(undefined, { weak: false });
    const d = dnode.connect(DAEMON_CONFIG.RPC_PORT);
    d.on('remote', (remote) => {
      remote.restart(nodeId, (err) => {
        if (cb) {
          cb(err);
        }
        d.end();
      });
    });
  }

  status() {
    if (this.interval) {
      return;
    }
    let datas = [];
    this.interval = setInterval(() => {
      const dnode = new Dnode(undefined, { weak: false });
      const d = dnode.connect(DAEMON_CONFIG.RPC_PORT);
      d.on('remote', (remote) => {
        remote.status((err, statuses) => {
          if (!err) {
            datas.forEach(_data => {
              _data.delete = true;
            });

            if (statuses) {
              statuses.forEach(share => {
                let data: any = {},
                  isNew = true;
                const config = share.config,
                  farmerState = share.meta.farmerState || {},
                  portStatus = farmerState.portStatus || {},
                  ntpStatus = farmerState.ntpStatus || {};

                datas.forEach(_data => {
                  if (_data.id == share.id) {
                    data = _data;
                    data.delete = false;
                    isNew = false;
                  }
                });

                data.id = share.id;
                data.location = config.storagePath;
                data.shareBasePath = config.shareBasePath;
                data.storageAllocation = config.storageAllocation;
                data.spaceUsed = (!farmerState.spaceUsed || farmerState.spaceUsed == '...') ? '0KB' : farmerState.spaceUsed;
                data.spaceUsed = this.convert(data.spaceUsed) > this.convert(data.storageAllocation) ? data.storageAllocation : data.spaceUsed;
                const percentUsed = parseFloat(!farmerState.percentUsed || farmerState.percentUsed == '...' ? '0' : farmerState.percentUsed);
                data.percentUsed = percentUsed > 100 ? 100 : percentUsed;
                data.time = prettyms(share.meta.uptimeMs);
                data.restarts = share.meta.numRestarts || 0;
                data.peers = farmerState.totalPeers;
                data.contractCount = farmerState.contractCount || 0;
                data.dataReceivedCount = farmerState.dataReceivedCount || 0;
                data.bridges = farmerState.bridgesConnectionStatus || 0;
                data.allocs = data.bridges === 0 ? '0' : data.contractCount + '(' + data.dataReceivedCount + 'received)';

                data.listenPort = portStatus.listenPort;
                data.connectionType = portStatus.connectionType;
                data.connectionStatus = portStatus.connectionStatus;

                data.state = share.state;

                data.delta = ntpStatus.delta || '...';
                data.deltaStatus = ntpStatus.status;

                if (!data.address) {
                  this.txService.getAddressByNodeId(data.id).then(val => {
                    data.address = val;
                  });
                }

                data.show = false;
                data.delete = false;

                if (isNew) {
                  datas.push(data);
                }
              });
              datas = datas.filter(_data => {
                return !_data.delete;
              });
            }

            this.driversData.next(datas);
          } else {
            console.log(err);
            // clearInterval(this.interval);
          }
          d.end();
        });
      });
    }, 5000);
  }

  destroy(nodeId, cb) {
    const dnode = new Dnode(undefined, { weak: false });
    const d = dnode.connect(DAEMON_CONFIG.RPC_PORT);
    d.on('remote', (remote) => {
      remote.destroy(nodeId, (err) => {
        this.remove(nodeId);
        if (cb) {
          cb(err);
        }
        d.end();
      });
    });
  }

  openLogFolder() {
    shell.showItemInFolder(LOG_DIR);
  }

  openConfig(nodeId) {
    const configPath = this.getConfigPathById(nodeId);
    shell.openItem(configPath);
  }

  getBindToken(nodeId, address, cb) {
    const dnode = new Dnode(undefined, { weak: false });
    const d = dnode.connect(DAEMON_CONFIG.RPC_PORT);
    d.on('remote', (remote) => {
      const configPath = this.getConfigPathById(nodeId);
      remote.getNodeToken(configPath, address, (err, token) => {
        d.end();
        if (err) {
          return cb(err);
        }
        cb(null, token);
      });
    });
  }

  constructor(
    private txService: TransactionService,
    private ipc: IpcService,
  ) {
    try {
      this.mkdirPSync(BASE_PATH, null);
      this.mkdirPSync(LOG_DIR, null);
      this.mkdirPSync(CONFIG_DIR, null);
    } catch (error) { }
    this.initConfigs();
  }
}
