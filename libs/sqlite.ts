import * as DB from "better-sqlite3";
import { ipcMain } from "electron";
import { SQLITE_CONFIG_PATH } from "./config";
import { join } from "path";

export default class {
    constructor() {
        let sql: any = {};

        // transactions
        sql.tx = new DB(join(SQLITE_CONFIG_PATH, "transactions.sqlite"));
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
        sql.txeden = new DB(join(SQLITE_CONFIG_PATH, "txeden.sqlite"));
        sql.txeden.prepare(`CREATE TABLE IF NOT EXISTS txeden (
            address TEXT,
            tokens TEXT
        )`).run();

        // settings
        sql.setting = new DB(join(SQLITE_CONFIG_PATH, "setting.sqlite"));
        sql.setting.prepare(`CREATE TABLE IF NOT EXISTS setting (
            name TEXT,
            value TEXT
        )`).run();

        // tasks
        sql.task = new DB(join(SQLITE_CONFIG_PATH, "task.sqlite"));
        sql.task.prepare(`CREATE TABLE IF NOT EXISTS task (
            id TEXT UNIQUE,
            bucketId TEXT,
            bucketName TEXT,
            fileId TEXT,
            fileName TEXT,
            nativePath TEXT,
            env TEXT,
            created NUMERIC,
            updated NUMERIC,
            process INTEGER,
            state INTEGER,
            type INTEGER,
            doneBytes REAL,
            allBytes REAL,
            error TEXT
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