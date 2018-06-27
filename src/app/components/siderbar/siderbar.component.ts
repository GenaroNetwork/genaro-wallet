import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-siderbar',
  templateUrl: './siderbar.component.html',
  styleUrls: ['./siderbar.component.scss']
})
export class SiderbarComponent implements OnInit {

  constructor(private router: Router) { }

  page: string = "/wallet";
  ngOnInit() {
    this.router.events.subscribe(value => {
      if (!(value instanceof NavigationEnd)) return;
      this.page = value.urlAfterRedirects;
    })
  }

}
