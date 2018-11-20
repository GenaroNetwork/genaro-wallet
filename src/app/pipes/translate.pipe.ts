import { Pipe, PipeTransform, NgZone, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from "./../services/translate.service";

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {

  constructor(private i18n: TranslateService, private zone: NgZone) { }
  transform(value: any, args?: any): any {
    if (value === "__LANGS__") return this.i18n.getLangs();
    return this.i18n.instant(value, args);;
  }

}
