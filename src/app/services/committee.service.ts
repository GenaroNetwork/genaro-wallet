import { Injectable } from '@angular/core';
import { TOP_FARMER_URL } from "../libs/config";

@Injectable({
  providedIn: 'root'
})
export class CommitteeService {

  private getMembers (obj) {

    return obj;
  }

  async getSentinel(addr) {
    let url = TOP_FARMER_URL;
    if(addr) {
      url += "?address=" + addr; 
    }
    let res = await fetch(url);
    let datas = await res.json();
    return datas.map(d => {
      this.getMembers(d)
    });
  }

  constructor() { }

}
