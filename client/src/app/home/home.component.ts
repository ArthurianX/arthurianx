import {
  Component, ElementRef, NgZone,
  OnInit, ViewChild
} from '@angular/core';

import * as THREE from 'three';

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
  public sceneFog: THREE.Fog = new THREE.Fog(0x050505, 1, 1000);

  constructor(
    public appState: AppState,
    public title: Title,
    public ngZone: NgZone,
    public calendar: CalendarConnector
  ) {

    calendar.getEvents().subscribe( (result) => {
      console.log('calendar event', result);
    });

  }

  public ngOnInit() {
    /**
     * this.title.getData().subscribe(data => this.data = data);
     */

    this.initialSceneSettings();

    /*this.ngZone.runOutsideAngular(() => {

      this.hookDetector();
      this.hookAnimationFrame();

    });*/
  }

  public submitState(value: string) {
    console.log('submitState', value);
    this.appState.set('value', value);
    this.localState.value = '';
  }

  public initialSceneSettings() {

    // Set Scene Fog
    this.sceneFog = new THREE.Fog( 0x050505, 2000, 4000 );
    this.sceneFog.color.setHSL( 0.102, 0.9, 0.825 );

  }
}
