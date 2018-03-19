import {
  Component, NgZone,
  OnInit
} from '@angular/core';

import { AppState } from '../app.service';
import { Title } from './title';
import { XLargeDirective } from './x-large';
import { CalendarConnector } from './home.service';

@Component({
  /**
   * The selector is what angular internally uses
   * for `document.querySelectorAll(selector)` in our index.html
   * where, in this case, selector is the string 'home'.
   */
  selector: 'home',  // <home></home>
  /**
   * We need to tell Angular's Dependency Injection which providers are in our app.
   */
  providers: [
    Title, CalendarConnector
  ],
  /**
   * Our list of styles in our component. We may add more to compose many styles together.
   */
  styleUrls: [ './home.component.scss' ],
  /**
   * Every Angular template is first compiled by the browser before Angular runs it's compiler.
   */
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  /**
   * Set our default values
   */
  public localState = { value: '' };
  /**
   * TypeScript public modifiers
   */

  public lottieConfig: {};
  private anim: any;
  private animationSpeed: number = 1;

  constructor(
    public appState: AppState,
    public title: Title,
    public ngZone: NgZone,
    public calendar: CalendarConnector
  ) {

    this.lottieConfig = {
      path: 'assets/animations/logo.json',
      autoplay: true,
      loop: true
    };

    calendar.getEvents().subscribe( (result) => {
      console.log('calendar event', result);
    });

  }

  public ngOnInit() {
    console.log('hello `Home` component');
    /**
     * this.title.getData().subscribe(data => this.data = data);
     */

    this.ngZone.runOutsideAngular(() => {

      this.hookDetector();
      this.hookAnimationFrame();

    });
  }

  public submitState(value: string) {
    console.log('submitState', value);
    this.appState.set('value', value);
    this.localState.value = '';
  }

  public handleAnimation(anim: any) {
    this.anim = anim;
  }

  public stop() {
    this.anim.stop();
  }

  public play() {
    this.anim.play();
  }

  public pause() {
    this.anim.pause();
  }

  public setSpeed(speed: number) {
    this.animationSpeed = speed;
    this.anim.setSpeed(speed);
  }

  public hookAnimationFrame() {



  }

  public hookDetector() {



  }
}
