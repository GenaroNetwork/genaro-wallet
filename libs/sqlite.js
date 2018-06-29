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
var test = require("storj-lib");
console.log(test);
var default_1 = /** @class */ (function () {
    function default_1() {
        var tx = new DB(path_1.join(config_1.WALLET_CONFIG_PATH, "transactions.sqlite"));
        /*tx.prepare(`CREATE TABLE IF NOT EXISTS wallet(
        name TEXT UNIQUE,
        address TEXT UNIQUE,
        wallet TEXT
        )`).run();*/
        electron_1.ipcMain.on("db.tx.run", function (event, ipcId, sql) {
            tx.prepare(sql).run();
            event.sender.send("db.tx.run." + ipcId);
        });
        electron_1.ipcMain.on("db.tx.get", function (event, ipcId, sql) {
            var data = tx.prepare(sql).get();
            event.sender.send("db.tx.get." + ipcId, data);
        });
        electron_1.ipcMain.on("db.tx.all", function (event, ipcId, sql) {
            var data = tx.prepare(sql).all();
            event.sender.send("db.tx.all." + ipcId, data);
        });
    }
    return default_1;
}());
exports["default"] = default_1;
;
