import { Injectable, ApplicationRef } from '@angular/core';
import langs from "../i18n/langs";
import { EventEmitter } from 'events';

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
    langs.forEach(lang => {
      if (lang.id === language) use = language;
    });
    this.load(use);
  }

  instant(name: string, args?: any): string {
    let translate = this.translate[name];
    if (!translate) translate = "";
    if (args) {
      for (let key in args) {
        let value = args[key];
        let regExp = new RegExp(`/^.*\\{\\{ *${key} *\\}\\}.*$/`, "g");
        console.log(regExp)
        translate = translate.replace(regExp, args);
      }
    }
    return translate;
  }

  getLangs(): any {
    return langs;
  };

  private load(lang: string) {
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
  }

  get(name: string, lang?: string): string {

    return "";
  }
}
