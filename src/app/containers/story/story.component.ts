import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Loader } from 'pixi.js';
import { Subject } from 'rxjs';
import { GlobalDate } from '../../interfaces/environment.interface';
import { Router } from '@angular/router';
import { AnimationControllerService } from '../../services/animation.controller.service';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.sass']
})

export class StoryComponent implements OnInit, AfterViewInit, OnDestroy {
  public globalAssets: Subject<any[]> = new Subject();
  public globalSpeed: number;
  public showDial = false;
  public app: PIXI.Application;
  public appRunning = false;
  public loader: Loader = Loader.shared;
  public ticker: PIXI.Ticker;

  // PIXI Canvas DOM Element Ref
  @ViewChild('pixiBackground', {static: false}) bgContainerRef: ElementRef;

  // Pause the whole app on SPACE press.
  @HostListener('window:keydown', ['$event'])
  onKeyDown($event) {
    if ($event.keyCode === 32) {
      this.pauseStory($event);
    }
  }
  constructor(
      public router: Router, public animService: AnimationControllerService
  ) {
    this.loader = PIXI.Loader.shared;
    this.ticker = PIXI.Ticker.shared;
    this.ticker.autoStart = false;
    this.ticker.stop();
  }

  ngOnInit() {
    this.globalSpeed = 0.3;
  }

  ngAfterViewInit() {
    // Break the ExpressionChangedAfterItHasBeenCheckedError Error by just delaying it.
    setTimeout(() => this.initWorld());
  }

  ngOnDestroy(): void {
    setTimeout(() => {
      this.loader.reset();
      this.app.stop();
      this.app.destroy(true, {children: true, texture: true});
      this.ticker.stop();
      this.ticker.destroy();
    }, 700);
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

    // this.app.ticker.add(this.environmentLoop.bind(this));
  }

  public receiveDialSpeed(speed) {
    /* This will be the global speed multiplier for all the other looped animations. */
    this.globalSpeed = speed * 3;
  }

  pauseStory($event) {
    if (this.appRunning) {
      this.app.stop();
      this.ticker.stop();
      this.appRunning = false;
    } else {
      this.app.start();
      this.ticker.start();
      this.appRunning = true;
    }
  }

  allAssetsLoaded($event: any[]) {
    // All assets have loaded
    this.globalAssets.next($event);
  }

  envReady() {
    this.showDial = true;
    this.app.start();
    this.ticker.start();
    this.appRunning = true;
  }

  setGlobalDate($event: GlobalDate) {
    console.log('Date is ', `${$event.year} - ${$event.month} - moving ${$event.direction}`);
  }

  backToMainMenu() {
    this.animService.setCurrentAnimation(2);
    this.router.navigate(['home']);
  }
}
