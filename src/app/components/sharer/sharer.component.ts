import { Component, OnInit } from '@angular/core';
import { SharerService } from '../../services/sharer.service';
@Component({
  selector: 'app-sharer',
  templateUrl: './sharer.component.html',
  styleUrls: ['./sharer.component.scss']
})
export class SharerComponent implements OnInit {

  constructor(
    private sharer: SharerService,
  ) {}

  ngOnInit() {
    this.sharer.runDaemon((err) => {
      if(err) {
        return alert(err);
      }
      this.sharer.startAll((err)=>{
        if(err) {
          return alert(err);
        }
      });
    });
  }

}
