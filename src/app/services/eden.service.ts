import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EdenService {

  // 当前路径，用于更新界面
  currentPath: BehaviorSubject<string[]> = new BehaviorSubject([""]);

  // 当前视图，用于更新界面
  currentDisplay: BehaviorSubject<any[]> = new BehaviorSubject([]);
  /**   demo: 如下参数构成的数组
   *    {
   *      name: "test",  // 文件名，如果以 / 结尾，则删除斜杠，标记为文件夹
   *      type: "file", "bucket", "folder" 三者之一
   *      
   *      
   *    }
   */
  constructor() {
  }

}
