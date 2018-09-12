import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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
  @Input('ipt') ngModel: any;
  @Input('span') span: number[] = [6, 18];
  @Input('iptExtra') iptExtra: string[] = [];
  @Output('iptChange') ngModelChange: EventEmitter<any> = new EventEmitter;
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
    this.i18n.get('COMMON.DONE').subscribe(() => {
      this.gasMarks = {
        '1': this.i18n.instant('INPUT.GAS_SLOW'),
        [this.gasMax]: this.i18n.instant('INPUT.GAS_FAST'),
      };
    });
    if (this.ngModel && this.ngModel[0]) {
      this.gasDefault = this.ngModel[0];
    }
    if (this.ngModel && this.ngModel[1]) {
      this.gasLimit = this.ngModel[1];
    }
    this.ngModelChange.emit([this.gasDefault, this.gasLimit]);
  }

  // setting
  settingLangs: any[];
  settingInit() {
    this.span = [16, 6, 1];
    this.settingLangs = this.i18n.getLangs();
  }
  settingChange(value) {
    this.settingService.set(this.ngModel, value);
  }
  settingGetLanguageName(lang) {
    try {
      const name = require(`../../../assets/i18n/${lang}.json`).LANGUAGE_NAME;
      if (name) { return name; } else { return lang; }
    } catch (e) {
      return lang;
    }
  }

  buyTrafficInit() {
    this.ngModelChange.emit([this.ngModel[0], this.ngModel[1]]);
  }
  spaceRangeInit() {
    this.ngModelChange.emit([this.ngModel[0], this.ngModel[1]]);
  }
  spaceLimitInit() {
    this.ngModelChange.emit([this.ngModel[0], this.ngModel[1]]);
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
