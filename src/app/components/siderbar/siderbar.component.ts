import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SettingService } from '../../services/setting.service';

@Component({
  selector: 'app-siderbar',
  templateUrl: './siderbar.component.html',
  styleUrls: ['./siderbar.component.scss']
})
export class SiderbarComponent implements OnInit {

  constructor(
    private router: Router,
    public settingService: SettingService,
  ) { }

  page: string = "/wallet";
  open(url: string, string: string) {
    return url.startsWith(string);
  }
  ngOnInit() {
    this.router.events.subscribe(value => {
      if (!(value instanceof NavigationEnd)) return;
      this.page = value.urlAfterRedirects;
    });
  }



}
