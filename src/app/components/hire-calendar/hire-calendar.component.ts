import {
  Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation
} from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hire-calendar',
  styleUrls: [ './hire-calendar.component.scss' ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './hire-calendar.component.html'
})

export class HireCalendarComponent implements OnInit, OnDestroy {
  public github = 'assets/svg/github.svg';
  public linkedin = 'assets/svg/likdicon.svg';

  constructor() {}

  public ngOnInit() {}

  public ngOnDestroy() {

  }

}
