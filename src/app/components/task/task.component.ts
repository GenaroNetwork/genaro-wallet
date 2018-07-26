import { Component } from '@angular/core';
import { ActivatedRoute } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent {

  url = this.route.snapshot.url[0].path;
  constructor(
    public route: ActivatedRoute,
  ) { }

}
