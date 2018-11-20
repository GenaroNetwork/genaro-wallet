import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { TranslateService } from '../../services/translate.service';
import { TransactionService } from '../../services/transaction.service';
import { SettingService } from '../../services/setting.service';
import { shell } from 'electron';
import { UPDATE_STATES } from "../../libs/config";

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnChanges {

  @Input('name') name: string;
  @Input('span') span: number[] = [6, 18];
  @Input('ipt') ipt: any;
  @Output('iptChange') iptChange: EventEmitter<any> = new EventEmitter;
  @Input('iptExtra') iptExtra: string[] = [];
  @Output("submit") submit: EventEmitter<any> = new EventEmitter;

  shell = shell;
  // gas
  gasDetail = true;
  gasMin = 1;
  gasMax = 100;
  gasLimit = 21000;
  gasDefault = 1;
  gasMarks: {};
  async gasInit() {
    this.gasDefault = await this.txService.getGas();
    this.gasMin = Number(this.gasDefault);
    this.gasMax = this.gasMin + 10;
    this.gasMarks = {
      '1': this.i18n.instant('INPUT.GAS_SLOW'),
      [this.gasMax]: this.i18n.instant('INPUT.GAS_FAST'),
    };
    if (this.ipt && this.ipt[0]) {
      this.gasDefault = this.ipt[0];
    }
    if (this.ipt && this.ipt[1]) {
      this.gasLimit = this.ipt[1];
    }
    this.iptChange.emit([this.gasDefault, this.gasLimit]);
  }

  // setting
  settingInit() {
    this.span = [16, 6, 1];
  }
  settingChange(value) {
    this.settingService.set(this.ipt, value);
  }

  buyTrafficInit() {
    this.iptChange.emit([this.ipt[0], this.ipt[1]]);
  }
  spaceRangeInit() {
    this.iptChange.emit([this.ipt[0], this.ipt[1]]);
  }
  spaceLimitInit() {
    this.iptChange.emit([this.ipt[0], this.ipt[1]]);
  }

  UPDATE_STATES = UPDATE_STATES;

  constructor(
    public i18n: TranslateService,
    public txService: TransactionService,
    public settingService: SettingService,
  ) { }

  ngOnChanges(changes: { [prop: string]: SimpleChange }) {
    if (changes.name) {
      let name = changes.name.currentValue;
      if (this[`${name}Init`]) this[`${name}Init`]();
    }
  }
}
