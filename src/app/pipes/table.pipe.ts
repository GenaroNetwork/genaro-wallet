import { Pipe, PipeTransform } from '@angular/core';
import { TASK_STATE } from '../libs/config';

@Pipe({
  name: 'tableTask'
})
export class TablePipe implements PipeTransform {
  transform(data: any, opt: any): any {
    const INPROCESS = [TASK_STATE.INIT, TASK_STATE.INPROCESS];
    const DONE = [TASK_STATE.DONE, TASK_STATE.ERROR, TASK_STATE.CANCEL];
    switch (opt) {
      case 'eden-inprocess':
        return data.filter(data => INPROCESS.indexOf(data.state) > -1);
      case 'eden-done':
        return data.filter(data => DONE.indexOf(data.state) > -1);
    }
  }

}
