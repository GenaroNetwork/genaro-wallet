import * as DB from "better-sqlite3";
import { ipcMain } from "electron";
import { mkdirSync, existsSync } from "fs";
import { GENARO_ROOT_PATH, WALLET_CONFIG_PATH } from "../src/app/libs/config";
import { join } from "path";
if (!existsSync(GENARO_ROOT_PATH)) mkdirSync(GENARO_ROOT_PATH);
if (!existsSync(WALLET_CONFIG_PATH)) mkdirSync(WALLET_CONFIG_PATH);


export default function () {
    let wallet = new DB(join(WALLET_CONFIG_PATH, "wallet.sqlite"));
    wallet.prepare(`CREATE TABLE IF NOT EXISTS wallet(
    name TEXT UNIQUE,
    address TEXT UNIQUE,
    wallet TEXT
    )`).run();

    ipcMain.on("db.wallet.run", (event, ipcId, sql) => {
        wallet.prepare(sql).run();
        event.sender.send(`db.wallet.run.${ipcId}`);
    });
    ipcMain.on("db.wallet.get", (event, ipcId, sql) => {
        let data = wallet.prepare(sql).get();
        event.sender.send(`db.wallet.get.${ipcId}`, data);
    });
    ipcMain.on("db.wallet.all", (event, ipcId, sql) => {
        let data = wallet.prepare(sql).all();
        event.sender.send(`db.wallet.all.${ipcId}`, data);
    });
};