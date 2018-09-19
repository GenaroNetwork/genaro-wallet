Object.defineProperty(global, "_bitcore", {
  get() {
    return void 0
  },
  set() { },
});

import { app, BrowserWindow, screen, Menu, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { fork } from 'child_process';
import { connect } from 'net';
import Sqlite from "./libs/sqlite";
import Protocol from "./libs/protocol";
import StorjLib from "./libs/storj-lib";
import Geth from "./libs/geth";
import { AutoUpdate } from "./libs/autoUpdate";
import { DAEMON_CONFIG } from "./libs/config";
import { join } from "path";


let DAEMON = join(__dirname, "./dist/assets/daemon/rpc-server.js");
if (process.env.NODE_ENV === 'development') {
  DAEMON = join(__dirname, "./src/assets/daemon/rpc-server.js");
}
let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function createWindow() {
  let preWindow = new BrowserWindow({
    width: 634,
    height: 384,
    titleBarStyle: 'hidden',
  });
  preWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'prewindow/index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  // start libs;
  new Sqlite;
  new Protocol;
  new StorjLib;
  new Geth;
  new AutoUpdate;

  //add extensions
  // BrowserWindow.addDevToolsExtension('./extensions/elgalmkoelokbchhkhacckoklkejnhcd/1.19.1_0');

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    show: false,
    width: size.width,
    height: size.height,
  });

  let setMenu = (lang: string = "en") => {
    // set menu
    let i18n = {
      "en": [
        "G-BOX",
        "About Application",
        "Quit",
        "Edit",
        "Undo",
        "Redo",
        "Cut",
        "Copy",
        "Paste",
        "Select All",
        "Dev",
        "Open Dev Tools",
      ],
      "zh": [
        "G-BOX",
        "关于",
        "退出",
        "编辑",
        "撤销",
        "重做",
        "剪切",
        "复制",
        "粘贴",
        "全选",
        "开发者",
        "打开控制台",
      ]
    };
    let template = [{
      label: i18n[lang][0],
      submenu: [
        { label: i18n[lang][1], selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { label: i18n[lang][2], accelerator: "Command+Q", click: function () { app.quit(); } }
      ]
    }, {
      label: i18n[lang][3],
      submenu: [
        { label: i18n[lang][4], accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: i18n[lang][5], accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: i18n[lang][6], accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: i18n[lang][7], accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: i18n[lang][8], accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: i18n[lang][9], accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    }];
    // @ts-ignore
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  };

  setMenu();
  ipcMain.on("app.set.menu", (event, ipcId, lang) => {
    setMenu(lang);
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (process.env.NODE_ENV === "development")
    win.webContents.openDevTools();

  ipcMain.once('app.loaded.lang', () => {
    preWindow.destroy();
    win.show();
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  maybeStartDaemon(() => {
    initRPCServer((msg) => {

    });
  });
}

function maybeStartDaemon(callback) {
  const sock = connect(DAEMON_CONFIG.RPC_PORT);

  sock.on('connect', () => {
    sock.end()
    sock.removeAllListeners()
    callback()
  })

  sock.on('error', () => {
    sock.removeAllListeners()
    initRPCServer(callback)
  })
}

function initRPCServer(callback) {
  let RPCServer = fork(DAEMON, [], { env: { STORJ_NETWORK: DAEMON_CONFIG.STORJ_NETWORK, RPC_PORT: DAEMON_CONFIG.RPC_PORT } });
  process.on('exit', () => {
    RPCServer.kill()
  });
  RPCServer.on('message', (msg) => {
    if (msg.state === 'init') {
      return callback();
    } else {
      RPCServer.removeAllListeners();
      callback(msg);
    }
  });
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
