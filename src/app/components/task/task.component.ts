import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EdenService } from '../../services/eden.service';

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
