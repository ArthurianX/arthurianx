import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';

import 'pixi-spine';
import 'pixi-viewport';

import GraphicsSVG from '../../services/pixi-svg/SVG';
const svgLoader = GraphicsSVG;

// TODO: READ https://github.com/cursedcoder/awesome-pixijs

@Component({
  selector: 'app-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.sass'],
  // providers: [ GraphicsSVG ]
})
export class EnvironmentComponent implements AfterViewInit {
  @Input() public speed: number;
  @ViewChild('pixiBackground', {static: false}) bgContainerRef: ElementRef;

  public loadingPercentage: number;
  public loading: boolean;

  /* Pixie Demo Stuff */
  public position = 0;
  public background: PIXI.Sprite;
  public background2: PIXI.Sprite;
  public foregroundSize = [1286, 179];
  public backgroundSize = [1286, 640];
  public foreground: PIXI.Sprite;
  public foreground2: PIXI.Sprite;
  public pixie: any;

  /* Pixie Demo Stuff */
  public pixi: {
    app?: PIXI.Application
  } = {};
  private innerWidth: number;
  private innerHeight: number;
  private stage: PIXI.Container;



  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.resizeAssets();
    // console.log('this.foreground', this.foreground);
    // console.log('this.background', this.background);
    // console.log('this.pixie', this.pixie);
    // this.pixi.sizeCollection(undefined, {width: this.innerWidth, height: this.innerHeight});
  }

  constructor() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    // console.log(new svgLoader());

  }

  ngAfterViewInit() {

    // this.pixi.init(
    //   this.innerWidth,
    //   this.innerHeight,
    //   this.bgContainerRef.nativeElement,
    //   true,
    //   window
    // );
    //
    // if ((this.pixi.app.loader as any)._afterMiddleware.indexOf(PIXI.spine.AtlasParser.use) < 0) {
    //   this.pixi.app.loader.use(PIXI.spine.AtlasParser.use);
    // }

    this.pixi.app = new PIXI.Application({
      width: this.innerWidth,
      height: this.innerHeight,
      view: this.bgContainerRef.nativeElement,
      transparent: true,
      antialias: true,
      resizeTo: window
    });

    this.initWorld();
  }

  public initWorld() {
    /* Pixie Demo Stuff */
    this.pixi.app.stage.interactive = true;

    /* Pixie Demo Stuff */

    this.pixi.app.stop();

    this.loadAssets();

    this.addTicker();
  }

  public loadAssets() {
    const loader = PIXI.Loader.shared;
    // const loader = new PIXI.Loader;
    if ((loader as any)._afterMiddleware.indexOf(PIXI.spine.AtlasParser.use) < 0) {
      console.log('Atlas Parser not present');
      this.pixi.app.loader.use(PIXI.spine.AtlasParser.use);
    }

    loader
        .add('pixie', 'assets/demo-story/pixie/pixie.json')
        .add('bg', 'assets/demo-story/iP4_BGtile.jpg')
        .add('fg', 'assets/demo-story/iP4_ground.png')
        .on('progress', (inst) => { this.loadingPercentage = Math.floor(inst.progress); this.loading = inst.loading; })
        .load(this.assetsLoaded.bind(this));
  }

  public onTouchStart() {
    this.pixie.state.setAnimation(0, 'jump', false);
    this.pixie.state.addAnimation(0, 'running', true, 0);
  }

  public assetsLoaded(loader: any, res: any) {
    this.loadingPercentage = Math.floor(loader.progress);
    this.loading = loader.loading;
    console.log('assetsLoaded', loader, res);

    this.containersBackground(res);
    this.containersRunner(res);

    this.pixi.app.stage.on('pointerdown', this.onTouchStart);

    this.pixi.app.start();
    setTimeout(() => { this.pixi.app.stop(); }, 5000);
  }

  public addTicker() {
    this.pixi.app.ticker.add(() => {
      this.position += 2;

      this.background.x = -(this.position * 0.6);
      this.background.x %= 1286 * 2;
      if (this.background.x < 0) {
        this.background.x += 1286 * 2;
      }
      this.background.x -= 1286;

      this.background2.x = -(this.position * 0.6) + 1286;
      this.background2.x %= 1286 * 2;
      if (this.background2.x < 0) {
        this.background2.x += 1286 * 2;
      }
      this.background2.x -= 1286;

      this.foreground.x = -this.position;
      this.foreground.x %= 1286 * 2;
      if (this.foreground.x < 0) {
        this.foreground.x += 1286 * 2;
      }
      this.foreground.x -= 1286;

      this.foreground2.x = -this.position + 1286;
      this.foreground2.x %= 1286 * 2;
      if (this.foreground2.x < 0) {
        this.foreground2.x += 1286 * 2;
      }
      this.foreground2.x -= 1286;
    });
  }

  private containersBackground(res: any) {
    this.background = PIXI.Sprite.from(res.bg.url);
    this.background2 = PIXI.Sprite.from(res.bg.url);

    this.foreground = PIXI.Sprite.from(res.fg.url);
    this.foreground2 = PIXI.Sprite.from(res.fg.url);
    this.foreground.anchor.set(0, 0.7);
    this.foreground.position.y = this.pixi.app.screen.height;
    this.foreground2.anchor.set(0, 0.7);
    this.foreground2.position.y = this.pixi.app.screen.height;

    this.pixi.app.stage.addChild(this.background, this.background2, this.foreground, this.foreground2);
  }

  private containersRunner(res: any) {
    const spineData = res.pixie.spineData;

    this.pixie = new PIXI.spine.Spine(spineData);

    this.resizeAssets();

    this.pixi.app.stage.addChild(this.pixie);

    this.pixie.stateData.setMix('running', 'jump', 0.2);
    this.pixie.stateData.setMix('jump', 'running', 0.4);

    this.pixie.state.setAnimation(0, 'running', true);
  }

  public resizeAssets() {
    console.log('resizeAssets', this.pixie, this.foreground, this.background);

    // Pixie Stuff
    const scale = 0.3;
    this.pixie.x = 1024 / 3;
    this.pixie.y = 500;
    this.pixie.scale.x = this.pixie.scale.y = scale;

    // Foreground / Background
  }
}
