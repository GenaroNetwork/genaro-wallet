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
    let addrTo = addr2hash(transaction.recipient);
    let chainDetail = JSON.stringify(transaction.receipt);

    let sql = (`INSERT INTO transactions 
    (amount, created, error, addrFrom, gasLimit, gasPrice, hash, message, txType, chainDetail, addrTo, state, transactionId)
    VALUES
    ('${transaction.amount}', ${transaction.created}, '${transaction.error}', '${addrFrom}', ${transaction.gasLimit},
    ${transaction.gasPrice}, '${transaction.hash}', '${transaction.message}', '${transactionType}', '${chainDetail}',
    '${addrTo}', '${TXSTATE.INIT}', '${transaction.transactionId}')`);
    await this.runSql(sql)
  }

  public async updateTxHash(transactionId, hash) {
    const sql = `UPDATE transactions SET hash = ${hash}, state = ${TXSTATE.INPROGRESS} WHERE transactionId = '${transactionId}'`
    await this.runSql(sql)
  }

  public async txSuccess(transactionId: string) {
    const sql = `UPDATE transactions SET state = ${TXSTATE.SUCCESS} WHERE transactionId = '${transactionId}'`
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