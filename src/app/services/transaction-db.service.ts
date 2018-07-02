import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { BehaviorSubject } from 'rxjs';

enum TXSTATE {
  INIT = 1,
  INPROGRESS,
  ERROR,
  SUCCESS
}

const addr2hash = add => {
  if (add.length === 40) return add;
  if (add.length === 42 && add.startsWith("0x")) return add.substr(2);
  throw new Error("Invalide Address");
};

@Injectable({
  providedIn: 'root'
})

export class TransactionDbService {
  
  public table1: BehaviorSubject<any>
  private ipcId: number = 0

  constructor() { 
    
  }

  /*
    pageNo starts from 0
  */
  public async getTransactions(pageNo: number, pageSize: number) {
    let sql = (`SELECT * FROM transactions`);
    return await this.getRows(sql)
  }

  public async addNewTransaction(transactionType, transaction) {
    // 1. insert db
    let addrFrom = addr2hash(transaction.from);
    let addrTo = addr2hash(transaction.to);
    const data = transaction.data ? `'${JSON.stringify(transaction.data)}'` : 'NULL'

    let sql = (`INSERT INTO transactions 
    (amount, created, addrFrom, gasLimit, gasPrice, txType, addrTo, state, transactionId, data)
    VALUES
    ('${transaction.value}', ${transaction.created}, '${addrFrom}', ${transaction.gasLimit},
    ${transaction.gasPrice}, '${transactionType}',
    '${addrTo}', '${TXSTATE.INIT}', '${transaction.transactionId}', ${data})`);
    await this.runSql(sql)
  }

  public async updateTxHash(transactionId, hash) {
    const sql = `UPDATE transactions SET hash = '${hash}', state = ${TXSTATE.INPROGRESS} WHERE transactionId = '${transactionId}'`
    await this.runSql(sql)
  }

  public async txSuccess(transactionId: string, reciept: string) {
    const sql = `UPDATE transactions SET state = ${TXSTATE.SUCCESS}, receipt = '${reciept}' WHERE transactionId = '${transactionId}'`
    await this.runSql(sql)
  }

  public async txError(transactionId: string, error: string) {
    const sql = `UPDATE transactions SET state = ${TXSTATE.ERROR}, error = '${error}' WHERE transactionId = '${transactionId}'`
    await this.runSql(sql)
  }

  private getRows(sql) {
    return new Promise((res, rej) => {
      ipcRenderer.on(`db.tx.all.${this.ipcId}`, (event, data) => { res(data) });
      ipcRenderer.send("db.tx.all", this.ipcId++, sql);
    });
  }

  private runSql(sql) {
    return new Promise((res, rej) => {
      ipcRenderer.on(`db.tx.run.${this.ipcId}`, (event, data) => { res() });
      ipcRenderer.send("db.tx.run", this.ipcId++, sql);
    });
  }

}
