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
  private gasDetail: boolean = false;
  private gasMin: number = 1;
  private gasMax: number = 100;
  private gasLimit: number = 21000;
  private gasDefault: number = 1;
  private gasMarks: {};

  // 买空间/流量
  private spaceLimitValue: number = 0;
  private spaceLimitUnit: number = 30;
  private spaceRangeValue: number = 0;
  private spaceRangeUnit: number = 1;
  private trafficValue: number = 0;
  private trafficUnit: number = 1;

  constructor(
    private i18n: TranslateService,
    private txService: TransactionService,
  ) { }

  test(e) {
    console.log(e);
  }

  async ngOnInit() {
    if (!this.span) this.span = [6, 18];
    if (this.name === "gas") {
      this.gasDefault = await this.txService.getGas();
      this.gasMax = this.gasDefault * 2;
      this.i18n.get("COMMON.DONE").subscribe(() => {
        this.gasMarks = {
          "1": this.i18n.instant("INPUT.GAS_SLOW"),
          [this.gasMax]: this.i18n.instant("INPUT.GAS_FAST"),
        };
      });
      if (this.ngModel) {
        this.gasDefault = this.ngModel[0];
        this.gasLimit = this.ngModel[1];
      }
      this.ngModelChange.emit([this.gasDefault, this.gasLimit]);
    }
  }

}
