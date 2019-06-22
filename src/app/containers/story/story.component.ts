import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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

  @ViewChild('pixiBackground', {static: false}) bgContainerRef: ElementRef;

  constructor() { }

  ngOnInit() {
    //  Demo Stuff, turn this off and enable dial when done.
    this.globalSpeed = 0.1;
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
