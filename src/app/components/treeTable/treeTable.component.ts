import { Component, OnInit, Input, OnDestroy, HostListener, ElementRef, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-treeTable',
  templateUrl: './treeTable.component.html',
  styleUrls: ['./treeTable.component.scss']
})
export class TreeTableComponent implements OnInit, OnDestroy, OnChanges {

  @Input('name') name: string;
  @Input('opt') opt: any;
  @Input('change') change: number;
  @Output('action') action: EventEmitter<any> = new EventEmitter;

  @HostListener('window:resize', ['$event'])
  onResize(event) {

  }

  collapse(array, data, $event: boolean): void {
    if ($event === false) {
      if (data.children) {
        data.children.forEach(d => {
          const target = array.find(a => a.address === d.address);
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  convertTreeToList(root: object) {
    const stack = [];
    const array = [];
    const hashMap = {};
    stack.push({ ...root, level: 0, expand: false });

    while (stack.length !== 0) {
      const node = stack.pop();
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({ ...node.children[i], level: node.level + 1, expand: false, parent: node });
        }
      }
    }
    return array;
  }

  visitNode(node, hashMap: object, array): void {
    if (!hashMap[node.address]) {
      hashMap[node.address] = true;
      array.push(node);
    }
  }

  constructor() { }

  rankTreeData: any = [];
  rankTreeExpandDataCache: any = {};
  rankTreeInit() {
    this.rankTreeData = [
      {
        address: '0x123',
        nickName: 'xxxxx',
        stake: 60,
        data_size: 564561561,
        sentinel: 45514,
        children: [
          {
            address: '0x1234',
            nickName: 'xxxxx',
            stake: 60,
            data_size: 564561561,
            sentinel: 45514,
          },
          {
            address: '0x1235',
            nickName: 'xxxxx',
            stake: 60,
            data_size: 564561561,
            sentinel: 45514,
          }
        ]
      }
    ];
    this.rankTreeData.forEach(item => {
      this.rankTreeExpandDataCache[item.address] = this.convertTreeToList(item);
    });
  }


  committeeTreeData: any = [];
  committeeTreeExpandDataCache: any = {};
  committeeTreeInit() {
    this.committeeTreeData = [
      {
        address: '0x123',
        nickName: 'xxxxx',
        stake: 60,
        data_size: 564561561,
        sentinel: 45514,
        children: [
          {
            address: '0x1234',
            nickName: 'xxxxx',
            stake: 60,
            data_size: 564561561,
            sentinel: 45514,
          },
          {
            address: '0x1235',
            nickName: 'xxxxx',
            stake: 60,
            data_size: 564561561,
            sentinel: 45514,
          }
        ]
      }
    ];
    this.committeeTreeData.forEach(item => {
      this.committeeTreeExpandDataCache[item.address] = this.convertTreeToList(item);
    });
  }




  ngOnInit() {
    if (this[`${this.name}Init`]) {
      this[`${this.name}Init`]();
    }
  }

  ngOnChanges(changes: { [prop: string]: SimpleChange }) {
    if (changes.change) {
      if (this[`${name}Change`]) {
        this[`${name}Change`]();
      }
    }
  }

  ngOnDestroy() {
    if (this[`${this.name}Destroy`]) {
      this[`${this.name}Destroy`]();
    }
  }
}
