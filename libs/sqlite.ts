import * as DB from "better-sqlite3";
import { ipcMain } from "electron";
import { mkdirSync, existsSync } from "fs";
import { GENARO_ROOT_PATH, WALLET_CONFIG_PATH } from "./config";
import { join } from "path";
if (!existsSync(GENARO_ROOT_PATH)) mkdirSync(GENARO_ROOT_PATH);
if (!existsSync(WALLET_CONFIG_PATH)) mkdirSync(WALLET_CONFIG_PATH);

export default class {
    constructor() {
        let sql: any = {};
        sql.tx = new DB(join(WALLET_CONFIG_PATH, "transactions.sqlite"));
        sql.tx.prepare(`CREATE TABLE IF NOT EXISTS transactions (
            transactionId TEXT,
            txType TEXT,
            addrFrom TEXT,
            addrTo TEXT,
            amount REAL,
            data TEXT,
            gasPrice REAL,
            gasLimit INTEGER,
            created NUMERIC,
            state INTEGER,
            message TEXT,
            hash TEXT,
            error TEXT,
            receipt TEXT
        )`).run();


        //  txeden
        sql.txeden = new DB(join(WALLET_CONFIG_PATH, "txeden.sqlite"));
        sql.txeden.prepare(`CREATE TABLE IF NOT EXISTS txeden (
            address TEXT,
            tokens TEXT
        )`).run();

        for (let name in sql) {
            let env = sql[name];
            ipcMain.on(`db.${name}.run`, (event, ipcId, sql) => {
                env.prepare(sql).run();
                event.sender.send(`db.${name}.run.${ipcId}`);
            });
            ipcMain.on(`db.${name}.get`, (event, ipcId, sql) => {
                let data = env.prepare(sql).get();
                event.sender.send(`db.${name}.get.${ipcId}`, data);
            });
            ipcMain.on(`db.${name}.all`, (event, ipcId, sql) => {
                let data = env.prepare(sql).all();
                event.sender.send(`db.${name}.all.${ipcId}`, data);
            });
        }
    }
};