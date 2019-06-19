import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import 'pixi-spine';
import 'pixi-viewport';

import GraphicsSVG from '../../services/pixi-svg/SVG';

import {
  TweenLite,
  TweenMax,
  TimelineMax,
  Power4,
  Linear
} from 'gsap';
import * as PixiPlugin_ from 'gsap/PixiPlugin';﻿
const PixiPlugin = PixiPlugin_;

// TODO: READ https://github.com/cursedcoder/awesome-pixijs

@Component({
  selector: 'app-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.sass']
})
export class EnvironmentComponent implements AfterViewInit, OnChanges {
    constructor() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }
  @Input() public speed: number;
  @Output() public envReady: EventEmitter<any> = new EventEmitter();
  @ViewChild('pixiBackground', {static: false}) bgContainerRef: ElementRef;
  @ViewChild('clouds', {static: true}) cloudsContainerRef: ElementRef;
  @ViewChild('sun', {static: true}) sunContainerRef: ElementRef;

  public loadingPercentage: number;
  public loading: boolean;

  public accoef = 0; // Acceleration Coefficient.
  public outsideTickerAnimationDuration = 3; // Animations outside

  public visible: {
    sky: boolean;
    sun: boolean;
    clouds: boolean;
    hills: boolean;
    road: boolean;
    months: boolean
  } = {
    sky: true,
    sun: true,
    clouds: true,
    hills: false,
    road: true,
    months: true
  };

  public background: PIXI.Sprite;
  public background2: PIXI.Sprite;
  public foreground: PIXI.Sprite;
  public foreground2: PIXI.Sprite;
  public months: PIXI.Sprite;
  public months2: PIXI.Sprite;
  public sky: PIXI.TilingSprite;
  public sky1: PIXI.TilingSprite;
  public skiTextures: PIXI.Texture[] = [];
  public sun: PIXI.Graphics | PIXI.Sprite;
  public sun2: PIXI.Graphics | PIXI.Sprite;
  public clouds: PIXI.Graphics[] = [];
  public cloudsMovementCoefficient: number[] = [];

  public foregroundRealSize = [6000, 500];
  public backgroundRealSize = [6000, 500];
  public monthsRealSize = [6000, 500];
  public combinedHeight = 1100;

  public bgCalcSize = [];
  public fgCalcSize = [];
  public mtCalcSize = [];

  public pixie: any;
  public tickerPosition = 0;
  public pixi: {
    app?: PIXI.Application
  } = {};

  private innerWidth: number;
  private innerHeight: number;
  private renderer: any;

  // The ticker calls this function, and this function decides how things get moved.
  private static spriteMotion(sprite, position, size, tile = false, extraAcceleration = 1 ) {
    // Move the sprite from right to left
    sprite.x = -(position * extraAcceleration) + size[0];

    // If this is the tile, set its position right after the first sprite and move
    sprite.x += tile ? size[0] : 0;

    // TODO: Don't know exactly what happens here, maybe reseting the tile ?
    sprite.x %= size[0] * 2;
    if (sprite.x < 0) {
      sprite.x += size[0] * 2;
    }
    sprite.x -= size[0];
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.resizeAssets();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.speed && changes.speed.currentValue) {
      this.accoef = changes.speed.currentValue * 3;
      // TODO: Formulate a better speed setting
      this.outsideTickerAnimationDuration = (3 - changes.speed.currentValue);
    }
  }

  ngAfterViewInit() {
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

    this.pixi.app.ticker.add(this.PIXIticker.bind(this));
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
        // good stuff below
        .add('sky1', 'assets/story/sky/sky1.jpg')
        .add('sky2', 'assets/story/sky/sky2.jpg')
        .add('sky3', 'assets/story/sky/sky3.jpg')
        .add('sky4', 'assets/story/sky/sky4.jpg')
        .add('sky5', 'assets/story/sky/sky5.jpg')
        .add('sun', 'assets/story/sky/sun.png')
        .add('sun2', 'assets/story/sky/sun.png')
        .on('progress', (inst) => { this.loadingPercentage = Math.floor(inst.progress); this.loading = inst.loading; })
        .load(this.assetsLoaded.bind(this));
  }

  public assetsLoaded(loader: any, res: any) {
    this.loadingPercentage = Math.floor(loader.progress);
    this.loading = loader.loading;
    console.log('assetsLoaded', loader, res);

    this.containersBackground(res); // to be deleted
    this.containersRunner(res); // to be deleted
    this.containersSky(res);
    this.containersSun(res);
    this.containersMonths(res);
    this.containersClouds();

    // Resize everything put on stage
    this.resizeAssets();


    this.pixi.app.stage.on('pointerdown', this.onTouchStart);

    this.pixi.app.start();

    // Call out the component to announce readiness of pixi app.
    setTimeout(() => { this.envReady.emit(true); }, 500);
  }

  public PIXIticker(time) {
    this.tickerPosition += this.accoef; // Position is shifted by an acceleration coefficient.

    // Background spacing on x axis happens in relation to the layers calculated widths
    EnvironmentComponent.spriteMotion(this.background2, this.tickerPosition, this.bgCalcSize);
    EnvironmentComponent.spriteMotion(this.background, this.tickerPosition, this.bgCalcSize, true);

    EnvironmentComponent.spriteMotion(this.foreground2, this.tickerPosition, this.fgCalcSize);
    EnvironmentComponent.spriteMotion(this.foreground, this.tickerPosition, this.fgCalcSize, true);

    EnvironmentComponent.spriteMotion(this.months2, this.tickerPosition, this.mtCalcSize);
    EnvironmentComponent.spriteMotion(this.months, this.tickerPosition, this.mtCalcSize, true);

    this.clouds.map((cloud, idx) => {
      // TODO Maybe also show two sets of clouds, to be more continuous
      // Push the clouds and the random generated movement coefficient
      EnvironmentComponent.spriteMotion(cloud, this.tickerPosition, [2700, 0], false, this.cloudsMovementCoefficient[idx]);
    });

    EnvironmentComponent.spriteMotion(this.sun, this.tickerPosition, [this.innerWidth + 280, 0], false, 0.4);
    EnvironmentComponent.spriteMotion(this.sun2, this.tickerPosition, [this.innerWidth + 280, 0], true, 0.4);
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

    // TODO: Refactor the logic here, it's crappy.
    // Foreground / Background
    const bgSize = this.calculateAssetSize(this.backgroundRealSize[1], this.backgroundRealSize[0] / this.backgroundRealSize[1]);
    this.bgCalcSize = [bgSize.width, bgSize.height];
    const fgSize = this.calculateAssetSize(this.foregroundRealSize[1], this.foregroundRealSize[0] / this.foregroundRealSize[1]);
    this.fgCalcSize = [fgSize.width, fgSize.height];

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
    this.months.anchor.set(0, 1);
    this.months.position.y = this.months.height;
    this.months2.anchor.set(0, 1);
    this.months2.position.y = this.months.height;

    this.foreground.anchor.set(0, 1.62);
    this.foreground2.anchor.set(0, 1.62);
    // Set it at the bottom of the screen
    this.foreground.position.y = this.pixi.app.screen.height / window.devicePixelRatio;
    this.foreground2.position.y = this.pixi.app.screen.height / window.devicePixelRatio;
  }

  private containersBackground(res: any) {
    this.background = PIXI.Sprite.from(res.clouds1.url);
    this.background2 = PIXI.Sprite.from(res.clouds.url);

    this.foreground = PIXI.Sprite.from(res.hills1.url);
    this.foreground2 = PIXI.Sprite.from(res.hills.url);

    if (this.visible.sky) {
      this.pixi.app.stage.addChild(this.background, this.background2);
    }

    if (this.visible.hills) {
      this.pixi.app.stage.addChild(this.foreground, this.foreground2);
    }
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
    debugger;
    this.months2 = PIXI.Sprite.from(res.months.url);

    if (this.visible.months) {
      this.pixi.app.stage.addChild(this.months, this.months2);
    }
  }

  private containersClouds() {
    // Also add the ones as png's
    const clouds = new GraphicsSVG(this.cloudsContainerRef.nativeElement) as any;
    clouds.children[0].children.map((ele) => {

      // ele.tint = Math.random() * 0xFFFFFF;
      // console.log(ele.getBounds());
      ele.position.y = this.randint(-100, 200);

      // Push the clouds
      this.clouds.push(ele);
      // Push the cloud movement coefficient
      this.cloudsMovementCoefficient.push(this.randint(0.6, 1.8));
    });

    if (this.visible.clouds) {
      // Add all the clouds to the scene
      this.clouds.map((cloud) => this.pixi.app.stage.addChild(cloud));
    }
  }

  private containersSun(res) {
    // this.sun = new GraphicsSVG(this.sunContainerRef.nativeElement);
    this.sun = PIXI.Sprite.from(res.sun.url);
    this.sun2 = PIXI.Sprite.from(res.sun2.url);
    if (this.visible.sun) {
      const tint = 0xe3eba4;
      this.sun.tint = tint;
      this.sun2.tint = tint;
      this.pixi.app.stage.addChild(this.sun);
      this.pixi.app.stage.addChild(this.sun2); // Uncomment
    }
  }

  private containersSky(res: any) {
    this.skiTextures.push(PIXI.Texture.from(res.sky1.url));
    this.skiTextures.push(PIXI.Texture.from(res.sky2.url));
    this.skiTextures.push(PIXI.Texture.from(res.sky3.url));
    this.skiTextures.push(PIXI.Texture.from(res.sky4.url));
    this.skiTextures.push(PIXI.Texture.from(res.sky5.url));

    /* create a tiling sprite ...
     * requires a texture, a width and a height
     * in WebGL the image size should preferably be a power of two
     */
    this.sky = new PIXI.TilingSprite(
        this.skiTextures[0],
        this.pixi.app.screen.width,
        this.pixi.app.screen.height,
    );
    this.sky1 = new PIXI.TilingSprite(
        this.skiTextures[1],
        this.pixi.app.screen.width,
        this.pixi.app.screen.height,
    );

    console.log(this.sky);

    if (this.visible.sky) {
      this.pixi.app.stage.addChild(this.sky1, this.sky);

      setTimeout(() => {
        this.colorSunChange('autumn', this.sun, this.sun2);
        this.colorSkyChange('autumn', this.sky, this.sky1);
        setTimeout(() => {
          this.colorSunChange('summer', this.sun, this.sun2);
          this.colorSkyChange('summer', this.sky, this.sky1);
        }, 5000);
      }, 5000);
    }
  }

  private colorSkyChange(toTexture: 'spring' | 'summer' | 'autumn' | 'winter' | 'spring2', sky, sky1) {
    let nextTexture;
    switch (toTexture) {
      case 'spring':
        nextTexture = this.skiTextures[1];
        break;
      case 'summer':
        nextTexture = this.skiTextures[2];
        break;
      case 'autumn':
        nextTexture = this.skiTextures[3];
        break;
      case 'winter':
        nextTexture = this.skiTextures[4];
        break;
      case 'spring2':
        nextTexture = this.skiTextures[0];
        break;
    }

    if (!sky.alpha) {
      sky.texture = nextTexture;
      TweenLite.to(sky, this.outsideTickerAnimationDuration, { alpha: '1', yoyo: false, ease: Power4.easeInOut });
    } else {
      sky1.texture = nextTexture;
      TweenLite.to(sky, this.outsideTickerAnimationDuration, { alpha: '0', yoyo: false, ease: Power4.easeInOut });
    }
  }

  private colorSunChange(toTint: 'spring' | 'summer' | 'autumn' | 'winter' | 'spring2', sun, sun1) {
    let tint = 0xE3EBA4;
    switch (toTint) {
      case 'spring':
        tint = 0xE3EBA4;
        break;
      case 'summer':
        tint = 0xFF6000;
        break;
      case 'autumn':
        tint = 0x55E270;
        break;
      case 'winter':
        tint = 0x41D4E2;
        break;
      case 'spring2':
        tint = 0xF8FFB9;
        break;
    }

    TweenLite.to(sun, this.outsideTickerAnimationDuration, { pixi: { tint }});
    TweenLite.to(sun1, this.outsideTickerAnimationDuration, { pixi: { tint }});
  }

  private calculateAssetSize(assetHeight, ratio) {
    const height = this.innerHeight;
    const defaultHeight = this.combinedHeight;

    const calcHeight = (height * assetHeight) / defaultHeight;
    const calcWidth = calcHeight * ratio;
    return {width: calcWidth / window.devicePixelRatio, height: calcHeight  / window.devicePixelRatio};
  }

  private onTouchStart() {
    this.pixie.state.setAnimation(0, 'jump', false);
    this.pixie.state.addAnimation(0, 'running', true, 0);
  }

  private applyFilters() {
    // this.pixie.filters = [new PIXI.filters.BlurFilter()];
    this.pixie.filters = [
      // new PIXIGlowFilter(),
      // new PIXINoiseFilter()
    ];
  }

  private randint(min, max): number {
    return Math.random() * (max - min) + min;
  }
}
