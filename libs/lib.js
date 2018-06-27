"use strict";
exports.__esModule = true;
var DB = require("better-sqlite3");
var electron_1 = require("electron");
var fs_1 = require("fs");
var config_1 = require("../src/app/libs/config");
var path_1 = require("path");
if (!fs_1.existsSync(config_1.GENARO_ROOT_PATH))
    fs_1.mkdirSync(config_1.GENARO_ROOT_PATH);
if (!fs_1.existsSync(config_1.WALLET_CONFIG_PATH))
    fs_1.mkdirSync(config_1.WALLET_CONFIG_PATH);
function default_1() {
    var wallet = new DB(path_1.join(config_1.WALLET_CONFIG_PATH, "wallet.sqlite"));
    wallet.prepare("CREATE TABLE IF NOT EXISTS wallet(\n    name TEXT UNIQUE,\n    address TEXT UNIQUE,\n    wallet TEXT\n    )").run();
    electron_1.ipcMain.on("db.wallet.run", function (event, ipcId, sql) {
        wallet.prepare(sql).run();
        event.sender.send("db.wallet.run." + ipcId);
    });
    electron_1.ipcMain.on("db.wallet.get", function (event, ipcId, sql) {
        var data = wallet.prepare(sql).get();
        event.sender.send("db.wallet.get." + ipcId, data);
    });
    electron_1.ipcMain.on("db.wallet.all", function (event, ipcId, sql) {
        var data = wallet.prepare(sql).all();
        event.sender.send("db.wallet.all." + ipcId, data);
    });
}
exports["default"] = default_1;
;
