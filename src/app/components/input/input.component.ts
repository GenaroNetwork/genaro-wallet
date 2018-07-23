import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {

  @Input("name") name: string;
  @Input("ipt") ngModel: any;
  @Input("span") span: number[];
  @Output("iptChange") ngModelChange: EventEmitter<any> = new EventEmitter;

  // gas
  gasDetail: boolean = true;
  gasMin: number = 1;
  gasMax: number = 100;
  gasLimit: number = 21000;
  gasDefault: number = 1;
  gasMarks: {};

  constructor(
    public i18n: TranslateService,
    public txService: TransactionService,
  ) { }

  async ngOnInit() {
    if (!this.span) this.span = [6, 18];
    if (this.name === "gas") {
      this.gasDefault = await this.txService.getGas();
      this.gasMin = Number(this.gasDefault);
      this.gasMax = this.gasMin + 10;
      this.i18n.get("COMMON.DONE").subscribe(() => {
        this.gasMarks = {
          "1": this.i18n.instant("INPUT.GAS_SLOW"),
          [this.gasMax]: this.i18n.instant("INPUT.GAS_FAST"),
        };
      });
      if (this.ngModel && this.ngModel[0])
        this.gasDefault = this.ngModel[0];
      if (this.ngModel && this.ngModel[1])
        this.gasLimit = this.ngModel[1];
      this.ngModelChange.emit([this.gasDefault, this.gasLimit]);
    }
    else if (this.name === "buyTraffic" || this.name === "spaceRange" || this.name === "spaceLimit") {
      this.ngModelChange.emit([this.ngModel[0], this.ngModel[1]]);
    }
  }

}
