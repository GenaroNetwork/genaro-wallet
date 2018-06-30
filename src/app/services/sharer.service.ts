import { Injectable } from '@angular/core';
import { fork } from 'child_process';
import { ipcRenderer, shell } from "electron";
import Dnode from "dnode";

// usage
let ipcId = 0;
function getPrivateKey() {
  return ipcRenderer.sendSync("storj.lib.getPrivateKey", ipcId++);
}

function getNodeID(key) {
  return ipcRenderer.sendSync("storj.lib.getNodeID", ipcId++, [key]);
}

function validateConfig(config) {
  return ipcRenderer.sendSync("storj.lib.validateConfig", ipcId++, [config]);
}

const path = require('path');
const fs = require('fs');
const os = require('os');
let electron = require("electron");
const ASSETS = `${electron.remote.app.getAppPath()}/src/assets`;
const DAEMON = `${ASSETS}/daemon/rpc-server.js`;

import { SHARER, DAEMON_CONFIG } from "./../libs/config";

const BASE_PATH = path.join(os.homedir(), '.config/genaroshare');
try {
  mkdirPSync(BASE_PATH, null);
  console.log(`config base path: ${BASE_PATH}`);
} catch (error) { }
const CONFIG_DIR = path.join(BASE_PATH, 'configs');
try {
  mkdirPSync(CONFIG_DIR, null);
  console.log(`config path: ${CONFIG_DIR}`);
} catch (error) { }
const LOG_DIR = path.join(BASE_PATH, 'logs');
try {
  mkdirPSync(LOG_DIR, null);
  console.log(`log path: ${LOG_DIR}`);
} catch (error) { }

function mkdirPSync(dirpath, made) {
  if (!made) {
    made = null;
  }

  dirpath = path.normalize(dirpath);
  try {
    fs.mkdirSync(dirpath);
    made = made || dirpath;
  } catch (err) {
    if (err.code === 'ENOENT') {
      made = mkdirPSync(path.dirname(dirpath), made);
      mkdirPSync(dirpath, made);
    } else {
      let stat;
      try {
        stat = fs.statSync(dirpath);
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

let configIds = [];
function _initConfigs() {
  fs.readdirSync(CONFIG_DIR).forEach(file => {
    let fileobj = path.parse(file);
    if (fileobj.ext === '.json' && fileobj.name.length === 40) {
      console.log(`add config file: ${file}`);
      configIds.push(fileobj.name);
    }
  });
}
_initConfigs();
function _getConfigPathById(nodeId) {
  return path.join(
    CONFIG_DIR,
    `${nodeId}.json`
  );
}

function _remove(nodeId) {
  const configPath = _getConfigPathById(nodeId)
  fs.unlinkSync(configPath)
  console.log(`${configPath} deleted`)
}

function _start(nodeId, cb) {
  let dnode = new Dnode(undefined, { weak: false });
  let d = dnode.connect(DAEMON_CONFIG.RPC_PORT);
  d.on('remote', (remote) => {
    let configPath = _getConfigPathById(nodeId);
    remote.start(configPath, (err) => {
      if (cb) {
        cb(err);
      }
      d.end();
    });
  });
}

@Injectable({
  providedIn: 'root'
})
export class SharerService {
  runDaemon(callback) {
    let RPCServer = fork(DAEMON, [], { env: { STORJ_NETWORK: DAEMON_CONFIG.STORJ_NETWORK, RPC_PORT: DAEMON_CONFIG.RPC_PORT } });

    process.on('exit', () => {
      RPCServer.kill();
    });
    RPCServer.on('message', (msg) => {
      if (msg.state === 'init') {
        return callback(null);
      } else {
        RPCServer.removeAllListeners();
      }
    });
  };

  create(shareSize, shareUnit, shareBasePath) {
    console.log(`create config with size: ${shareSize}${shareUnit}, path: ${shareBasePath}`);
    let returnedPath = false;
    let configFileDescriptor;
    let storPath;
    let config = DAEMON_CONFIG.prodConfig;
    config.networkPrivateKey = getPrivateKey();
    let nodeID = getNodeID(config.networkPrivateKey);
    console.log(`creating node id: ${nodeID}`);
    config.storagePath = shareBasePath;
    try {
      mkdirPSync(shareBasePath, null);
    } catch (err) { }

    if (config.storagePath === undefined || config.storagePath === '') {
      storPath = path.join('/', nodeID);
    } else {
      storPath = path.join(config.storagePath, '/');
    }

    config.storagePath = storPath;
    config.storageAllocation = shareSize + shareUnit;

    let configFilePath = path.join(
      CONFIG_DIR,
      `${nodeID}.json`
    );

    config.loggerOutputFile = LOG_DIR;
    let configArray = JSON.stringify(config, null, 2).split('\n');
    let configBuffer = Buffer.from(configArray.join('\n'));
    try {
      let err = validateConfig(config);
      if (err) {
        throw err;
      }
      configFileDescriptor = fs.openSync(configFilePath, 'w');
      fs.writeFileSync(configFileDescriptor, configBuffer);
      console.log(`wrote config file to: ${configFilePath}`);
    } catch (err) {
      console.log(err);
    } finally {
      if (configFileDescriptor) {
        fs.closeSync(configFileDescriptor);
      }
    }
    _initConfigs();
    return nodeID;
  };

  start(nodeId, cb) {
    _start(nodeId, cb);
  };

  startAll(cb) {
    let errs = [];
    let len = configIds.length;
    configIds.forEach(nodeId => {
      _start(nodeId, err => {
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
  };

  stop(nodeId, cb) {
    let dnode = new Dnode(undefined, { weak: false });
    let d = dnode.connect(DAEMON_CONFIG.RPC_PORT);
    d.on('remote', (remote) => {
      remote.stop(nodeId, (err) => {
        if (cb) {
          cb(err);
        }
        d.end();
      });
    });
  };

  restart(nodeId, cb) {
    let dnode = new Dnode(undefined, { weak: false });
    let d = dnode.connect(DAEMON_CONFIG.RPC_PORT);
    d.on('remote', (remote) => {
      remote.restart(nodeId, (err) => {
        if (cb) {
          cb(err);
        }
        d.end();
      });
    });
  };

  status(cb) {
    let dnode = new Dnode(undefined, { weak: false });
    let d = dnode.connect(DAEMON_CONFIG.RPC_PORT);
    d.on('remote', (remote) => {
      remote.status((err, statuses) => {
        if (cb) {
          cb(err, statuses);
        }
        d.end();
      });
    });
  };

  destroy(nodeId, cb) {
    let dnode = new Dnode(undefined, { weak: false });
    let d = dnode.connect(DAEMON_CONFIG.RPC_PORT);
    d.on('remote', (remote) => {
      remote.destroy(nodeId, (err) => {
        _remove(nodeId);
        if (cb) {
          cb(err);
        }
        d.end();
      });
    });
  };

  openLogFolder() {
    shell.showItemInFolder(LOG_DIR);
  };

  openConfig(nodeId) {
    const configPath = _getConfigPathById(nodeId);
    shell.openItem(configPath);
  };

  constructor() { }

}
