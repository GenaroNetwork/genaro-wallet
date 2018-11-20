import { Injectable } from '@angular/core';
import langs from "../i18n/langs";
import { EventEmitter } from 'events';
import { nextTick } from 'q';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {

  translate: {
    [propName: string]: string
  } = {};
  constructor() {
  }

  event: EventEmitter = new EventEmitter();
  use(language: any = "") {
    let use = langs[0].id;
    let trigger = false;
    langs.forEach(lang => {
      if (lang.id === language) use = language;
      trigger = true;
    });
    this.load(use, trigger);
  }

  instant(name: string, args?: any): string {
    let translate = this.translate[name];
    if (!translate) translate = "";
    if (args) {
      for (let key in args) {
        let value = args[key];
        let regExp = new RegExp(`^(.*)\\{\\{ *${key} *\\}\\}(.*)$`, "g");
        translate = translate.replace(regExp, `$1${value}$2`);
      }
    }
    return translate;
  }

  getLangs(): any {
    return langs;
  };

  private load(lang: string, trigger: boolean = false) {
    let translateBefore = require(`../i18n/${lang}`).default;
    let translateAfter = {};
    let deepParse = (obj: any, key: string = null, prefix: string[] = []) => {
      let prefixInner = Array.from(prefix);
      if (key) prefixInner.push(key);
      if (typeof obj === "string") {
        let key = prefixInner.join(".");
        translateAfter[key] = obj;
      }

      if (typeof obj === "object") {
        for (let key in obj) {
          deepParse(obj[key], key, prefixInner);
        }
      }
    }
    deepParse(translateBefore);
    this.translate = translateAfter;
    nextTick(() => {
      if (trigger) this.event.emit("loaded-with-given");
      else this.event.emit("loaded-without-given");
    });
  }
}
