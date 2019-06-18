import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import 'pixi-spine';
import 'pixi-viewport';

import GraphicsSVG from '../../services/pixi-svg/SVG';

import PIXIGlowFilter from '../../pixi-filters/glow';
import PIXINoiseFilter from '../../pixi-filters/noise';

// TODO: READ https://github.com/cursedcoder/awesome-pixijs

@Component({
  selector: 'app-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.sass']
})
export class EnvironmentComponent implements AfterViewInit, OnChanges {
  @Input() public speed: number;
  @ViewChild('pixiBackground', {static: false}) bgContainerRef: ElementRef;
  @ViewChild('monthsSVG', {static: true}) monthsSVGContainerRef: ElementRef;

  public loadingPercentage: number;
  public loading: boolean;
  public accoef = 0; // Acceleration Coefficient.

  /* Pixie Demo Stuff */
  public background: PIXI.Sprite;
  public background2: PIXI.Sprite;
  public foreground: PIXI.Sprite;
  public foreground2: PIXI.Sprite;
  public months: PIXI.Sprite;
  public months2: PIXI.Sprite;
  public foregroundRealSize = [6000, 500];
  public backgroundRealSize = [6000, 500];
  public monthsRealSize = [6000, 500];
  public bgCalcSize = [];
  public fgCalcSize = [];
  public mtCalcSize = [];
  public combinedHeight = 1100;
  public pixie: any;

  /* Pixie Demo Stuff */
  public pixi: {
    app?: PIXI.Application
  } = {};
  private innerWidth: number;
  private innerHeight: number;
  private renderer: any;



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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.speed && changes.speed.currentValue) {
      this.accoef = changes.speed.currentValue * 3;
      // TODO: Formulate a better speed setting
    }
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
    this.pixi.app.stage.interactive = true;

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
        .add('clouds', 'assets/months/clouds.jpg')
        .add('clouds1', 'assets/months/clouds1.jpg')
        .add('hills', 'assets/months/hills.png')
        .add('hills1', 'assets/months/hills1.png')
        .add('months', 'assets/months/months.png')
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
    this.containersMonths(res);

    // Resize everything put on stage
    this.resizeAssets();


    this.pixi.app.stage.on('pointerdown', this.onTouchStart);

    this.pixi.app.start();

    // setTimeout(() => {this.pixi.app.stop();}, 7000);
  }

  public addTicker() {
    let position = 0;
    this.pixi.app.ticker.add((time) => {
      // console.log(time);
      position += this.accoef; // Position is shifted by an acceleration coefficient.

      // Background spacing on x axis happens in relation to the layers calculated widths
      this.background.x = -(position/* * 0.6*/); // Background moves slower than foreground
      this.background.x %= this.bgCalcSize[0] * 2;
      if (this.background.x < 0) {
        this.background.x += this.bgCalcSize[0] * 2;
      }
      this.background.x -= this.bgCalcSize[0];
      // this.background.y -= this.tickerHop(-1.6, 1.6);

      this.background2.x = -(position/* * 0.6*/) + this.bgCalcSize[0];
      this.background2.x %= this.bgCalcSize[0] * 2;
      if (this.background2.x < 0) {
        this.background2.x += this.bgCalcSize[0] * 2;
      }
      this.background2.x -= this.bgCalcSize[0];
      // this.background2.y -= this.tickerHop(-1.6, 1.6);

      // Foreground spacing on x axis happens in relation to the layers calculated widths
      this.foreground.x = -position;
      this.foreground.x %= this.fgCalcSize[0] * 2;
      if (this.foreground.x < 0) {
        this.foreground.x += this.fgCalcSize[0] * 2;
      }
      this.foreground.x -= this.fgCalcSize[0];
      // this.foreground.y -= this.tickerHop(-0.6, 0.6);

      this.foreground2.x = -position + this.fgCalcSize[0];
      this.foreground2.x %= this.fgCalcSize[0] * 2;
      if (this.foreground2.x < 0) {
        this.foreground2.x += this.fgCalcSize[0] * 2;
      }
      this.foreground2.x -= this.fgCalcSize[0];
      // this.foreground2.y -= this.tickerHop(-0.6, 0.6);

      // Months
      this.months.x = -position;
      this.months.x %= this.mtCalcSize[0] * 2;
      if (this.months.x < 0) {
        this.months.x += this.mtCalcSize[0] * 2;
      }
      this.months.x -= this.mtCalcSize[0];

      this.months2.x = -position + this.mtCalcSize[0];
      this.months2.x %= this.mtCalcSize[0] * 2;
      if (this.months2.x < 0) {
        this.months2.x += this.mtCalcSize[0] * 2;
      }
      this.months2.x -= this.mtCalcSize[0];
    });
  }

  private containersBackground(res: any) {
    this.background = PIXI.Sprite.from(res.clouds1.url);
    this.background2 = PIXI.Sprite.from(res.clouds.url);

    this.foreground = PIXI.Sprite.from(res.hills1.url);
    this.foreground2 = PIXI.Sprite.from(res.hills.url);

    this.pixi.app.stage.addChild(this.background, this.background2, this.foreground, this.foreground2);
  }

  private containersRunner(res: any) {
    const spineData = res.pixie.spineData;

    this.pixie = new PIXI.spine.Spine(spineData);

    this.pixi.app.stage.addChild(this.pixie);

    this.pixie.stateData.setMix('running', 'jump', 0.2);
    this.pixie.stateData.setMix('jump', 'running', 0.4);

    this.pixie.state.setAnimation(0, 'running', true);

    // this.pixie.anchor.set(0, 1);
    setTimeout(() => {
      this.pixie.transform.position.y = this.pixi.app.screen.height / window.devicePixelRatio - 50;
      this.pixie.transform.position.x = this.pixi.app.screen.width / window.devicePixelRatio / 2.6;
    }, 200);

    this.applyFilters();
  }

  private containersMonths(res: any) {
    this.months = PIXI.Sprite.from(res.months.url);
    this.months2 = PIXI.Sprite.from(res.months.url);

    // TODO: Hack! - anchor and position must be set after rendering, otherwise they won't be placed.
    setTimeout(() => {
      this.months.anchor.set(0, 1);
      this.months.position.y = this.months.height;
      this.months2.anchor.set(0, 1);
      this.months2.position.y = this.months.height;
    }, 100);


    this.pixi.app.stage.addChild(this.months, this.months2);
  }

  public resizeAssets() {
    // Set renderer devicePixelRatio size
    this.renderer = this.pixi.app.renderer;
    this.renderer.resolution = window.devicePixelRatio;

    // Don't know what this is for
    this.renderer.resize(this.innerWidth - 1, this.innerHeight);
    this.renderer.resize(
        this.innerWidth ,
        this.innerHeight
    );

    this.renderer.plugins.interaction.resolution = window.devicePixelRatio;

    console.log('resizeAssets', this.pixie, this.foreground, this.background, this.months2);

    // Pixie Stuff
    const scale = 0.3;
    this.pixie.x = 1024 / 5;
    this.pixie.y = 500;
    this.pixie.scale.x = this.pixie.scale.y = scale;

    // Foreground / Background
    const bgSize = this.calculateAssetSize(this.backgroundRealSize[1], this.backgroundRealSize[0] / this.backgroundRealSize[1]);
    this.bgCalcSize = [bgSize.width, bgSize.height]
    const fgSize = this.calculateAssetSize(this.foregroundRealSize[1], this.foregroundRealSize[0] / this.foregroundRealSize[1]);
    this.fgCalcSize = [fgSize.width, fgSize.height]

    const mtSize = this.calculateAssetSize(this.monthsRealSize[1], this.monthsRealSize[0] / this.monthsRealSize[1]);
    this.mtCalcSize = [mtSize.width, mtSize.height];

    this.background.width = bgSize.width;
    this.background.height = bgSize.height;
    this.background2.width = bgSize.width;
    this.background2.height = bgSize.height;

    this.foreground.width = fgSize.width;
    this.foreground.height = fgSize.height;
    this.foreground2.width = fgSize.width;
    this.foreground2.height = fgSize.height;

    this.months.width = mtSize.width;
    this.months.height = mtSize.height;
    this.months2.width = mtSize.width;
    this.months2.height = mtSize.height;

    // Set it at the bottom of the screen
    this.months.position.y = this.pixi.app.screen.height / window.devicePixelRatio;
    this.months2.position.y = this.pixi.app.screen.height / window.devicePixelRatio;

    this.foreground.anchor.set(0, 1.62);
    this.foreground2.anchor.set(0, 1.62);
    // Set it at the bottom of the screen
    this.foreground.position.y = this.pixi.app.screen.height / window.devicePixelRatio;
    this.foreground2.position.y = this.pixi.app.screen.height / window.devicePixelRatio;
  }

  private calculateAssetSize(assetHeight, ratio) {
    const height = this.innerHeight;
    const defaultHeight = this.combinedHeight;

    const calcHeight = (height * assetHeight) / defaultHeight;
    const calcWidth = calcHeight * ratio;
    return {width: calcWidth / window.devicePixelRatio, height: calcHeight  / window.devicePixelRatio};
  }

  private applyFilters() {
    // this.pixie.filters = [new PIXI.filters.BlurFilter()];
    this.pixie.filters = [
      // new PIXIGlowFilter(),
      // new PIXINoiseFilter()
    ];
  }

  private tickerHop(min, max) {
    // min = Math.ceil(min);
    // max = Math.floor(max);
    // return Math.floor(Math.random() * (max - min + 1)) + min;
    return (Math.random() * (max - min) + min).toFixed(2);
  }
}
