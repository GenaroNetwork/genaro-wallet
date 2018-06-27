import { Component, OnInit } from '@angular/core';
import { SqliteService } from '../../services/sqlite.service';

@Component({
  selector: 'app-walletNew',
  templateUrl: './walletNew.component.html',
  styleUrls: ['./walletNew.component.scss']
})
export class WalletNewComponent implements OnInit {

  constructor(private sqlite: SqliteService) { }
  newWalletType: string = null;
  title: string = "WALLETNEW.TITLE";
  toFrontPage() {
    this.title = "WALLETNEW.TITLE";
    this.newWalletType = null;
  }
  createStep: number = 0;
  toCreate() {
    this.title = "WALLETNEW.TITLE1";
    this.newWalletType = "create";

    this.createStep = 0;
  }
  importStep: number = 0;
  toImport() {
    this.title = "WALLETNEW.TITLE2";
    this.newWalletType = "import";

    this, this.importStep = 0;
  }

  async save() {
    this.sqlite.saveWallet("测试一个", {
      address: "0x123456",
      count: 123,
    })
  }

  async read() {
    let result = await this.sqlite.getWallet("0x123456");
    console.log(result);
  }


  ngOnInit() {
  }

}
