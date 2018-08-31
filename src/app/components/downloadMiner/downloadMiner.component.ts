import { Component, OnInit } from '@angular/core';
import { shell } from 'electron';
import { MINER_DOWNLOAD } from '../../libs/config';

@Component({
  selector: 'app-downloadMiner',
  templateUrl: './downloadMiner.component.html',
  styleUrls: ['./downloadMiner.component.scss']
})
export class DownloadMinerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  openDownload() {
    shell.openExternal(MINER_DOWNLOAD);
  }

}
