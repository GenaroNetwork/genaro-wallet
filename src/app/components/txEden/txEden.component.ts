import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-txEden',
  templateUrl: './txEden.component.html',
  styleUrls: ['./txEden.component.scss']
})
export class TxEdenComponent implements OnInit {

  constructor(
    private wallet: WalletService
  ) { }

  ngOnInit() {
  }

}
