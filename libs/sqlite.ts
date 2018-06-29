import * as DB from "better-sqlite3";
import { ipcMain } from "electron";
import { mkdirSync, existsSync } from "fs";
import { GENARO_ROOT_PATH, WALLET_CONFIG_PATH } from "../src/app/libs/config";
import { join } from "path";
if (!existsSync(GENARO_ROOT_PATH)) mkdirSync(GENARO_ROOT_PATH);
if (!existsSync(WALLET_CONFIG_PATH)) mkdirSync(WALLET_CONFIG_PATH);

export default class {
    constructor() {
        let tx = new DB(join(WALLET_CONFIG_PATH, "transactions.sqlite"));
        /*tx.prepare(`CREATE TABLE IF NOT EXISTS wallet(
        name TEXT UNIQUE,
        address TEXT UNIQUE,
        wallet TEXT
        )`).run();*/

        ipcMain.on("db.tx.run", (event, ipcId, sql) => {
            tx.prepare(sql).run();
            event.sender.send(`db.tx.run.${ipcId}`);
        });
        ipcMain.on("db.tx.get", (event, ipcId, sql) => {
            let data = tx.prepare(sql).get();
            event.sender.send(`db.tx.get.${ipcId}`, data);
        });
        ipcMain.on("db.tx.all", (event, ipcId, sql) => {
            let data = tx.prepare(sql).all();
            event.sender.send(`db.tx.all.${ipcId}`, data);
        });
    }
};