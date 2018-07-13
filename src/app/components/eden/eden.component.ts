import { Component, OnInit } from '@angular/core';
import { EdenService } from '../../services/eden.service';
@Component({
  selector: 'app-eden',
  templateUrl: './eden.component.html',
  styleUrls: ['./eden.component.scss']
})
export class EdenComponent implements OnInit {

  constructor(
    public edenService: EdenService,
  ) {
  }

  edenNeedPass: string = null;

  ngOnInit() {
    this.edenService.updateAll();
  }

}
