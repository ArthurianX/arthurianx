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
import * as PixiPlugin_ from 'gsap/PixiPlugin';
const PixiPlugin = PixiPlugin_;
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { EnvironmentSwitcher, TerrainGen } from '../../interfaces/environment.interface';

import {GlitchFilter, PixelateFilter, AsciiFilter, AdvancedBloomFilter, DropShadowFilter} from 'pixi-filters';


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

  public loadingPercentage: number;
  public loading: boolean;
  public tickerLoop: Subject<any> = new Subject();
  public tickerState: {
    month: 'Jan';
    year: 1985;
  } = {
    month: 'Jan',
    year: 1985
  };

  public accoef = 0; // Acceleration Coefficient.
  public outsideTickerAnimationDuration = 3; // Animations outside

  public visible: EnvironmentSwitcher = {
    sky: true,
    sun: true,
    clouds: true,
    hills: true,
    road: true,
    months: true
  };

  /* Filters */
  public fgFilter: GlitchFilter | AsciiFilter | any;
  public dShadow: DropShadowFilter = new DropShadowFilter();
  public aBloom: any;
  /* Filters*/

  public frontHills: PIXI.Sprite;
  public frontHills1: PIXI.Sprite;
  public backHills: PIXI.Sprite;
  public backHills1: PIXI.Sprite;
  public soil: PIXI.Sprite;
  public soil1: PIXI.Sprite;
  public yearWidth = 70;
  public year: PIXI.Text;
  public year2: PIXI.Text;
  public months: PIXI.Sprite;
  public months2: PIXI.Sprite;
  public sky: PIXI.TilingSprite;
  public sky1: PIXI.TilingSprite;
  public skiTextures: PIXI.Texture[] = [];
  public sun: PIXI.Graphics | PIXI.Sprite;
  public sun2: PIXI.Graphics | PIXI.Sprite;
  public clouds: PIXI.Graphics[] = [];
  public cloudMotion: number[] = [];

  public monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  public soilTileSize = [3708, 545]; // Soil tile size
  public monthsTileSize = [6000, 500];
  public combinedHeight = 1500; // TODO: How do I handle this ?

  public backHillsSettings: TerrainGen = {
    width: 6000, height: 700,
    amplitude: 128, wavelength: 128, octaves: 2 };
  public frontHillsSettings: TerrainGen = {
    width: 6000, height: 700,
    amplitude: 128, wavelength: 128, octaves: 2 };

  public hillSizes = [];
  public soilSizes = [];
  public monthsSizes = [];

  public pixieSpineDemo: PIXI.spine.Spine;
  public ticker = 0;
  public app: PIXI.Application;

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
      // this.outsideTickerAnimationDuration = (3 - changes.speed.currentValue);
    }
  }

  ngAfterViewInit() {

    // if ((this.app.loader as any)._afterMiddleware.indexOf(PIXI.spine.AtlasParser.use) < 0) {
    //   this.app.loader.use(PIXI.spine.AtlasParser.use);
    // }

    this.app = new PIXI.Application({
      width: this.innerWidth,
      height: this.innerHeight,
      view: this.bgContainerRef.nativeElement,
      transparent: true,
      antialias: true,
      resizeTo: window
    });

    this.initWorld();

    // Change the month with GSAP
    this.tickerLoop
        .pipe(
            throttleTime(500)
        )
        .subscribe((res) => {
          // console.log('Ticker Stream', res);
          // this.fgFilter.refresh();

          const monthPixels = res.width / 12;
          // TODO: Figure out how we're going in reverse !?!? second param to adjustSeason
          if (res.x > 0) {
            this.adjustSeason(this.monthsList[12 - Math.ceil(res.x / monthPixels)]);
          } else {
            this.adjustSeason(this.monthsList[Math.abs(Math.ceil(res.x / monthPixels))]);
          }

        });
  }

  public initWorld() {
    this.app.stage.interactive = true;

    this.app.stop();

    this.loadAssets();

    this.app.ticker.add(this.PIXIticker.bind(this));
  }

  public loadAssets() {
    const loader = PIXI.Loader.shared;
    // const loader = new PIXI.Loader;
    if ((loader as any)._afterMiddleware.indexOf(PIXI.spine.AtlasParser.use) < 0) {
      console.log('Atlas Parser not present');
      this.app.loader.use(PIXI.spine.AtlasParser.use);
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
        .add('displacement_map', 'assets/story/soil/displacement_map_repeat.jpg')
        .add('ground', 'assets/story/soil/soil-tile.png')
        .on('progress', (inst) => { this.loadingPercentage = Math.floor(inst.progress); this.loading = inst.loading; })
        .load(this.assetsLoaded.bind(this));
  }

  public assetsLoaded(loader: any, res: any) {
    this.loadingPercentage = Math.floor(loader.progress);
    this.loading = loader.loading;
    console.log('assetsLoaded', loader, res);

    // TODO: Order is really important here, last in > first on top.
    this.containersSky(res);
    this.containersHillsSetup(res);
    this.containersGround(res);
    this.containersSun(res);
    this.containersMonths(res);
    this.containersYear(res);
    this.containersClouds();
    // this.containersRunner(res); // to be deleted

    // Resize everything put on stage
    this.resizeAssets();

    this.applyFiltersToSprites();


    this.app.stage.on('pointerdown', this.onTouchStart);

    // this.introEnvironment();

    this.app.start();

    // Call out the component to announce readiness of pixi app.
    setTimeout(() => { this.envReady.emit(true); }, 500);
  }

  public PIXIticker(time) {
    this.ticker += this.accoef; // Position is shifted by an acceleration coefficient.

    // Background spacing on x axis happens in relation to the layers calculated widths
    EnvironmentComponent.spriteMotion(this.frontHills1, this.ticker, this.hillSizes, false, 0.8);
    EnvironmentComponent.spriteMotion(this.frontHills, this.ticker, this.hillSizes, true, 0.8);

    EnvironmentComponent.spriteMotion(this.backHills, this.ticker, this.hillSizes, false, 0.6);
    EnvironmentComponent.spriteMotion(this.backHills1, this.ticker, this.hillSizes, true, 0.6);

    EnvironmentComponent.spriteMotion(this.soil1, this.ticker, this.soilSizes, false, 1.2);
    EnvironmentComponent.spriteMotion(this.soil, this.ticker, this.soilSizes, true, 1.2);

    EnvironmentComponent.spriteMotion(this.months2, this.ticker, this.monthsSizes);
    EnvironmentComponent.spriteMotion(this.months, this.ticker, this.monthsSizes, true);
    // Has to have width of months.
    EnvironmentComponent.spriteMotion(this.year, this.ticker, [this.monthsSizes[0], this.monthsSizes[1]]);
    EnvironmentComponent.spriteMotion(this.year2, this.ticker, [this.monthsSizes[0], this.monthsSizes[1]], true);

    this.clouds.map((cloud, idx) => {
      // TODO Maybe also show two sets of clouds, to be more continuous
      // Push the clouds and the random generated movement coefficient
      EnvironmentComponent.spriteMotion(cloud, this.ticker, [2700, 0], false, this.cloudMotion[idx]);
    });

    EnvironmentComponent.spriteMotion(this.sun, this.ticker, [this.innerWidth + 280, 0], false, 0.4);
    EnvironmentComponent.spriteMotion(this.sun2, this.ticker, [this.innerWidth + 280, 0], true, 0.4);

    this.tickerLoop.next({
      width: this.months.width,
      scale: this.months.scale,
      x: this.months.x,
      position: this.months.position
    });
  }

  public resizeAssets() {
    // Set renderer devicePixelRatio size
    this.renderer = this.app.renderer;
    this.renderer.resolution = window.devicePixelRatio;

    // Don't know what this is for
    this.renderer.resize(this.innerWidth - 1, this.innerHeight);
    this.renderer.resize(
        this.innerWidth ,
        this.innerHeight
    );

    this.renderer.plugins.interaction.resolution = window.devicePixelRatio;

    console.log('resizeAssets', this.pixieSpineDemo, this.soil, this.frontHills, this.months2);

    // Pixie Stuff
    // const scale = 0.3;
    // this.pixieSpineDemo.x = 1024 / 5;
    // this.pixieSpineDemo.y = 500;
    // this.pixieSpineDemo.scale.x = this.pixieSpineDemo.scale.y = scale;

    // TODO: Refactor the logic here, it's crappy.
    // Foreground / Background
    const bgSize = this.calculateAssetSize(this.backHillsSettings.height, this.backHillsSettings.width / this.backHillsSettings.height);
    this.hillSizes = [bgSize.width, bgSize.height];
    const fgSize = this.calculateAssetSize(this.soilTileSize[1], this.soilTileSize[0] / this.soilTileSize[1]);
    this.soilSizes = [fgSize.width, fgSize.height];

    const mtSize = this.calculateAssetSize(this.monthsTileSize[1], this.monthsTileSize[0] / this.monthsTileSize[1]);
    this.monthsSizes = [mtSize.width, mtSize.height];

    this.sky.width = this.app.stage.width;
    this.sky.height = this.app.stage.height;
    this.sky1.width = this.app.stage.width;
    this.sky1.height = this.app.stage.height;

    this.frontHills.width = bgSize.width;
    this.frontHills.height = bgSize.height;
    this.frontHills1.width = bgSize.width;
    this.frontHills1.height = bgSize.height;
    this.backHills.width = bgSize.width;
    this.backHills.height = bgSize.height;
    this.backHills1.width = bgSize.width;
    this.backHills1.height = bgSize.height;

    this.frontHills.anchor.set(0, 0.7);
    this.frontHills1.anchor.set(0, 0.7);
    this.backHills.anchor.set(0, 0.9);
    this.backHills1.anchor.set(0, 0.9);

    this.frontHills.position.y = (this.app.screen.height / 3 ) * 2.1 / window.devicePixelRatio;
    this.frontHills1.position.y = (this.app.screen.height / 3 ) * 2.1 / window.devicePixelRatio;
    this.backHills.position.y = (this.app.screen.height / 3 ) * 2.1 / window.devicePixelRatio;
    this.backHills1.position.y = (this.app.screen.height / 3 ) * 2.1 / window.devicePixelRatio;

    this.months.width = mtSize.width;
    this.months.height = mtSize.height;
    this.months2.width = mtSize.width;
    this.months2.height = mtSize.height;

    // Set it at the bottom of the screen
    this.months.anchor.set(0, 1);
    this.months.position.y = this.months.height;
    this.months2.anchor.set(0, 1);
    this.months2.position.y = this.months.height;

    // FOREGROUND (soil, ground) dimensions
    this.soil.width = fgSize.width;
    this.soil.height = fgSize.height;
    this.soil1.width = fgSize.width;
    this.soil1.height = fgSize.height;


    this.soil.anchor.set(0, 0.8);
    this.soil1.anchor.set(0, 0.8);
    // Set it at the bottom of the screen
    this.soil.position.y = this.app.screen.height / window.devicePixelRatio;
    this.soil1.position.y = this.app.screen.height / window.devicePixelRatio;

    this.sun.scale.x = 1 / window.devicePixelRatio;
    this.sun.scale.y = 1 / window.devicePixelRatio;
    this.sun2.scale.x = 1 / window.devicePixelRatio;
    this.sun2.scale.y = 1 / window.devicePixelRatio;

    this.clouds.map((cloud) => {
      cloud.scale.x = 1 / window.devicePixelRatio;
      cloud.scale.y = 1 / window.devicePixelRatio;
      cloud.position.y /= window.devicePixelRatio;
    });
  }

  public receiveTerrain(background: 'foreground' | 'background', $event: PIXI.Sprite[]) {
    console.log('receiveTerrain for ', background, $event);
    switch (background) {
      case 'background':
        this.frontHills = $event[1];
        this.frontHills1 = $event[0];
        break;
      case 'foreground':
        this.backHills = $event[1];
        this.backHills1 = $event[0];
        break;
    }
  }

  private containersHillsSetup(res: any) {
    // Initial tint
    this.frontHills.tint = 0x5BAF5D;
    this.frontHills1.tint = 0x5BAF5D;
    this.backHills.tint = 0x509B50;
    this.backHills1.tint = 0x509B50;
    // Flip the second tile sprite, to match the first
    // this.frontHills1.scale.x *= -1;
    // this.backHills1.scale.x *= -1;

    // NOTE: POSSIBLE PERFORMANCE HOG - Displacement maps
    const displacementSprite = PIXI.Sprite.from(res.displacement_map.url);

    displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    const displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
    displacementFilter.padding = 10;

    displacementSprite.position = this.backHills.position;

    // this.app.stage.addChild(displacementSprite);

    this.backHills.filters = [displacementFilter];
    this.backHills1.filters = [displacementFilter];
    // NOTE: ^ POSSIBLE PERFORMANCE HOG - Displacement maps

    if (this.visible.hills) {
      this.app.stage.addChild(this.backHills, this.backHills1, this.frontHills, this.frontHills1);
    }
  }

  private containersGround(res: any) {
    this.soil = PIXI.Sprite.from(res.ground.url);
    this.soil1 = PIXI.Sprite.from(res.ground.url);

    // NOTE: POSSIBLE PERFORMANCE HOG - Displacement maps
    const displacementSprite = PIXI.Sprite.from(res.displacement_map.url);

    displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    const displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
    displacementFilter.padding = 10;

    displacementSprite.position = this.soil.position;

    this.app.stage.addChild(displacementSprite);


    this.soil.filters = [displacementFilter];
    this.soil1.filters = [displacementFilter];
    // NOTE: ^ POSSIBLE PERFORMANCE HOG - Displacement maps

    this.soil.blendMode = PIXI.BLEND_MODES.SOFT_LIGHT;
    this.soil1.blendMode = PIXI.BLEND_MODES.SOFT_LIGHT;

    if (this.visible.road) {
      this.app.stage.addChild(this.soil, this.soil1);
    }
  }

  private containersRunner(res: any) {
    const spineData = res.pixie.spineData;

    this.pixieSpineDemo = new PIXI.spine.Spine(spineData);

    this.app.stage.addChild(this.pixieSpineDemo);

    this.pixieSpineDemo.stateData.setMix('running', 'jump', 0.2);
    this.pixieSpineDemo.stateData.setMix('jump', 'running', 0.4);

    this.pixieSpineDemo.state.setAnimation(0, 'running', true);

    // this.pixieSpineDemo.anchor.set(0, 1);
    setTimeout(() => {
      this.pixieSpineDemo.transform.position.y = this.app.screen.height / window.devicePixelRatio - 50;
      this.pixieSpineDemo.transform.position.x = this.app.screen.width / window.devicePixelRatio / 2.6;
    }, 200);

    this.applyFilters();
  }

  private containersMonths(res: any) {
    this.months = PIXI.Sprite.from(res.months.url);
    this.months2 = PIXI.Sprite.from(res.months.url);

    if (this.visible.months) {
      this.app.stage.addChild(this.months, this.months2);
    }
  }

  private containersYear(res: any) {
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 30,
      fontStyle: 'normal',
      fontWeight: 'bold',
      fill: ['#ffffff'/*, '#ccc'*/], // gradient
      // stroke: '#4a1850',
      // strokeThickness: 5,
      // dropShadow: true,
      // dropShadowColor: '#000000',
      // dropShadowBlur: 4,
      // dropShadowAngle: Math.PI / 6,
      // dropShadowDistance: 6,
      // wordWrap: true,
      // wordWrapWidth: 440,
    });

    this.year = new PIXI.Text(this.tickerState.year.toString(), style);
    this.year2 = new PIXI.Text((this.tickerState.year + 1).toString(), style);

    this.year.width = this.yearWidth;
    this.year2.width = this.yearWidth;

    this.year.y = 20;
    this.year2.y = 20;

    this.year.anchor.set(0.5, 0);
    this.year2.anchor.set(0.5, 0);

    this.app.stage.addChild(this.year, this.year2);
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
      this.cloudMotion.push(this.randint(0.6, 1.8));
    });

    if (this.visible.clouds) {
      // Add all the clouds to the scene
      this.clouds.map((cloud) => this.app.stage.addChild(cloud));
    }
  }

  private containersSun(res) {
    this.sun = PIXI.Sprite.from(res.sun.url);
    this.sun2 = PIXI.Sprite.from(res.sun2.url);
    if (this.visible.sun) {
      const tint = 0xe3eba4;
      this.sun.tint = tint;
      this.sun2.tint = tint;
      this.app.stage.addChild(this.sun);
      this.app.stage.addChild(this.sun2); // Uncomment
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
        this.skiTextures[1],
        this.app.screen.width,
        this.app.screen.height,
    );
    this.sky1 = new PIXI.TilingSprite(
        this.skiTextures[0],
        this.app.screen.width,
        this.app.screen.height,
    );

    console.log(this.sky);

    if (this.visible.sky) {
      this.app.stage.addChild(this.sky1, this.sky);
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
        tint = 0xFFD53F;
        break;
      case 'autumn':
        tint = 0xC2FFE9;
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

  private colorHillsChange(toTint: 'spring' | 'summer' | 'autumn' | 'winter' | 'spring2', bg, bg1, bg2, bg3) {
    let tint = 0x509B50;
    let tint1 = 0x5BAF5D;
    switch (toTint) {
      case 'spring':
        tint = 0x00796B;
        tint1 = 0x00897B;
        break;
      case 'summer':
        tint = 0xEB5F0E;
        tint1 = 0xBF2C0A;
        break;
      case 'autumn':
        tint = 0x169C9C;
        tint1 = 0x1D788C;
        break;
      case 'winter':
        tint = 0x7DAAD8;
        tint1 = 0xbbe5ff;
        break;
      case 'spring2':
        tint = 0x00796B;
        tint1 = 0x00897B;
        break;
    }

    TweenLite.to([bg, bg1], this.outsideTickerAnimationDuration, { pixi: { tint: tint1 }});
    TweenLite.to([bg2, bg3], this.outsideTickerAnimationDuration, { pixi: { tint }});
    // TweenLite.to([this.soil, this.soil1], this.outsideTickerAnimationDuration, { pixi: { tint: tint1  }});
  }

  private calculateAssetSize(assetHeight, ratio) {
    const height = this.innerHeight;
    const defaultHeight = this.combinedHeight;

    const calcHeight = (height * assetHeight) / defaultHeight;
    const calcWidth = calcHeight * ratio;
    return {width: calcWidth / window.devicePixelRatio, height: calcHeight  / window.devicePixelRatio};
  }

  private onTouchStart() {
    this.pixieSpineDemo.state.setAnimation(0, 'jump', false);
    this.pixieSpineDemo.state.addAnimation(0, 'running', true, 0);
  }

  private applyFilters() {
    // this.pixieSpineDemo.filters = [new PIXI.filters.BlurFilter()];
    this.pixieSpineDemo.filters = [
      // new PIXIGlowFilter(),
      // new PIXINoiseFilter()
    ];
  }

  private randint(min, max): number {
    return Math.random() * (max - min) + min;
  }

  private adjustSeason(month, reverse = false) {
    if (this.tickerState.month !== month) {
      this.tickerState.month = month;

      // TODO: Introduce a animation running variable so animations don't overlap

      // TODO: Handle case of user scrolling in reverse (current months.X > last months.X)
      switch (month) {
        case 'Feb':
          this.colorSunChange('spring2', this.sun, this.sun2);
          this.colorSkyChange('spring2', this.sky, this.sky1);
          this.colorHillsChange('spring2', this.frontHills, this.frontHills1, this.backHills, this.backHills1);
          break;
        case 'May':
          this.colorSunChange('summer', this.sun, this.sun2);
          this.colorSkyChange('summer', this.sky, this.sky1);
          this.colorHillsChange('summer', this.frontHills, this.frontHills1, this.backHills, this.backHills1);

          // Changing the year now yielded the best results
          if (reverse) {
            this.year2.text = (this.tickerState.year - 1).toString();
          } else {
            this.year2.text = (this.tickerState.year + 1).toString();
          }
          
          break;
        case 'Aug':
          this.colorSunChange('autumn', this.sun, this.sun2);
          this.colorSkyChange('autumn', this.sky, this.sky1);
          this.colorHillsChange('autumn', this.frontHills, this.frontHills1, this.backHills, this.backHills1);

          // Changing the year now yielded the best results
          if (reverse) {
            this.tickerState.year -= 1;
          } else {
            this.tickerState.year += 1;
          }

          this.year.text = (this.tickerState.year).toString();
          
          break;
        case 'Nov':
          this.colorSunChange('winter', this.sun, this.sun2);
          this.colorSkyChange('winter', this.sky, this.sky1);
          this.colorHillsChange('winter', this.frontHills, this.frontHills1, this.backHills, this.backHills1);
          break;
        case 'Dec':
          break;
      }
    }
  }

  public applyFiltersToSprites() {

    // this.fgFilter = new GlitchFilter();
    // this.fgFilter = new AdvancedBloomFilter();
    // /this.dShadow = new DropShadowFilter();
    this.aBloom = new AdvancedBloomFilter(7);
    console.log('this.fgFilter', this.fgFilter);
    this.frontHills.filters ? this.frontHills.filters.push(this.dShadow) : this.frontHills.filters = [this.dShadow];
    this.frontHills1.filters ? this.frontHills1.filters.push(this.dShadow) : this.frontHills1.filters = [this.dShadow];
    this.backHills.filters ? this.backHills.filters.push(this.dShadow) : this.backHills.filters = [this.dShadow];
    this.backHills1.filters ? this.backHills1.filters.push(this.dShadow) : this.backHills1.filters = [this.dShadow];
    this.sun.filters ? this.sun.filters.push(this.dShadow) : this.sun.filters = [this.dShadow];
    this.sun2.filters ? this.sun2.filters.push(this.dShadow) : this.sun2.filters = [this.dShadow];

    // this.clouds.map((cloud) => {
    //   cloud.filters = [this.dShadow];
    // });
    // this.sky.filters ? this.sky.filters.push(this.fgFilter) : this.sky.filters = [this.fgFilter];
    // this.sky1.filters ? this.sky1.filters.push(this.fgFilter) : this.sky1.filters = [this.fgFilter];
    // this.sun.filters ? this.sun.filters.push(this.fgFilter) : this.sun.filters = [this.fgFilter];
    // this.sun2.filters ? this.sun2.filters.push(this.fgFilter) : this.sun2.filters = [this.fgFilter];
    // this.soil.filters ? this.soil.filters.push(this.fgFilter) : this.soil.filters = [this.fgFilter];
    // this.soil1.filters ? this.soil1.filters.push(this.fgFilter) : this.soil1.filters = [this.fgFilter];
  }

  public introEnvironment() {
    const pixelate = new PixelateFilter([40, 40]);
    this.app.stage.filters = [pixelate];

    const values = {
      x: 40,
      y: 40
    };

    setTimeout(() => {
      TweenLite.to(values, 5, {x: 0, y: 0, roundProps: 'x,y', onUpdate: () => {pixelate.size = [values.x, values.y]; }, onComplete: () => {
          this.app.stage.filters = [];
        }});
    }, 2000);
  }


}
