import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

import { Loader } from 'pixi.js';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.sass']
})
export class StoryComponent implements OnInit, AfterViewInit {
  public globalSpeed: number;
  public showDial = false;
  public app: PIXI.Application;
  public appRunning = false;
  public loader: Loader = Loader.shared;

  // PIXI Canvas DOM Element Ref
  @ViewChild('pixiBackground', {static: false}) bgContainerRef: ElementRef;

  // Pause the whole app on SPACE press.
  @HostListener('window:keydown', ['$event'])
  onKeyDown($event) {
    if ($event.keyCode === 32) {
      this.pauseStory($event);
    }
  }
  constructor() {
    this.loader = PIXI.Loader.shared;
  }

  ngOnInit() {
    this.globalSpeed = 0.3;
  }

  ngAfterViewInit() {
    // Break the ExpressionChangedAfterItHasBeenCheckedError Error by just delaying it.
    setTimeout(() => this.initWorld());
  }

  public initWorld() {

    // if ((this.app.loader as any)._afterMiddleware.indexOf(PIXI.spine.AtlasParser.use) < 0) {
    //   this.app.loader.use(PIXI.spine.AtlasParser.use);
    // }

    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      view: this.bgContainerRef.nativeElement,
      transparent: true,
      antialias: true,
      resizeTo: window
    });

    this.app.stage.interactive = true;

    this.app.stop();

    // this.app.ticker.add(this.PIXIticker.bind(this));
  }

  public receiveDialSpeed(speed) {
    /**
     * This will be the global speed multiplier for all the other looped animations.
     * */

    // console.log('dialSpeed', speed);
    this.globalSpeed = speed;
  }

  envReady($event: any) {
      this.showDial = true;
      this.app.start();
      this.appRunning = true;
  }

  pauseStory($event) {
    if (this.appRunning) {
      this.app.stop();
      this.appRunning = false;
    } else {
      this.app.start();
      this.appRunning = true;
    }
  }
}
