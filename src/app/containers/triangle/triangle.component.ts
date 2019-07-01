import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import GraphicsSVG from '../../services/pixi-svg/SVG';
import { throttleTime } from 'rxjs/operators';
import { TweenLite, TweenMax, TimelineLite, Power2 } from 'gsap';

import { KawaseBlurFilter, AdjustmentFilter, CRTFilter, AdjustmentOptions, CRTOptions } from 'pixi-filters';
import PIXIGlowFilter from '../../pixi-filters/glow';
import ParticleContainer = PIXI.ParticleContainer;
import { Router } from '@angular/router';
import { AnimationControllerService } from '../../services/animation.controller.service';


@Component({
  selector: 'app-play',
  templateUrl: './triangle.component.html',
  styleUrls: ['./triangle.component.sass']
})
export class TriangleComponent implements AfterViewInit, OnDestroy {
  loader: PIXI.Loader = PIXI.Loader.shared;
  @ViewChild('triangleBg', {static: true}) triangleBgRef: ElementRef;
  @ViewChild('triangle', {static: true}) triangleRef: ElementRef;
  @ViewChild('logoTriangle', {static: true}) triangleLogoRef: ElementRef;
  public triCoordGenerated: {x: number; y: number}[][] = [];
  public triangleSprites: any[] = [];
  private triangleCoordinates: any[] = [];
  public mousePositionStream: EventEmitter<any> = new EventEmitter();
  public tickerStream: EventEmitter<any> = new EventEmitter();
  public filters = {
    adjustment: new AdjustmentFilter({gamma: 3, contrast: 1, saturation: 1, brightness: 2, red: 1, green: 1, blue: 1, alpha: 1} as AdjustmentOptions),
    blur: new KawaseBlurFilter(0, 1, false),
    crt: new CRTFilter({curvature: 2, lineWidth: 0.5, lineContrast: 0.2, verticalLine: 0, noise: 0.3, noiseSize: 1.2, vignetting: 0.1, vignettingAlpha: 0, vignettingBlur: 0.5, time: 6} as CRTOptions),
    glow: new PIXIGlowFilter()
    // crt: new CRTFilter({curvature: 1, lineWidth: 3, lineContrast: 0.3, verticalLine: 0, noise: 0.2, noiseSize: 1, vignetting: 0.3, vignettingAlpha: 1, vignettingBlur: 0.3, time: 0.5} as CRTOptions)
  };
  public globalCursorPosition: {
    x: number;
    y: number;
  } = {
    x: 0,
    y: 0
  };
  public settings: {
    initialSpriteAlpha: number;
    trailOpacity: number;
    trail: number;
    triangleSize: number;
    baseImageScaleSize: number;
  } = {
    initialSpriteAlpha: 0,
    trailOpacity: 0.7,
    trail: 1,
    triangleSize: 35,
    baseImageScaleSize: 50
  };
  public toggles: {
    staticAnimation: boolean;
    drawingMode: boolean
    trailMode: boolean
    stageFilters: boolean
  } = {
    trailMode: true,
    drawingMode: false,
    staticAnimation: true,
    stageFilters: true
  };
  public entryTriangle: PIXI.Sprite;
  private app: PIXI.Application;
  private particlesContainer: PIXI.ParticleContainer;
  private tickerValue: number;
  private logoTriangle: {
    r?: PIXI.Sprite;
    g?: PIXI.Sprite;
    b?: PIXI.Sprite;
  } = {};


  constructor(
      public router: Router, public animService: AnimationControllerService
  ) {
    this.mousePositionStream
        .pipe( throttleTime(50) )
        .subscribe((res) => {
          // Set the global cursor position (used for drawing atm)
          this.globalCursorPosition = res;

          // Find triangles near the mouse and animate them
          const foundTrianglesIndexes = this.findTriangleIndexesNearCoordinates(res);
          this.animateTrianglesUnderCursor(foundTrianglesIndexes);
        });
    this.tickerStream
      .pipe( throttleTime(350) )
        .subscribe((time) => {
          // console.log('stream', res);
          this.filters.crt.time = time;
          this.filters.crt.curvature = time;
          const alpha = this.randintFloat(0.2, 1).toFixed(2) as any;
          if (this.entryTriangle) {
            TweenLite.to(this.entryTriangle, 0.35, {alpha})/*.delay(this.randint(0, 0.3))*/;
          }
          // this.filters.crt.seed = time;

        });
  }

  public PIXIticker(time) {
    this.tickerValue = time;
    // tslint:disable-next-line:max-line-length

    if (this.entryTriangle) {
      this.entryTriangle.tint = 0xFF0000;
    }

    this.tickerStream.next(time);
  }

  public loaderComplete(loader, res) {
    // NOTE: All the important things happen here.
    this.calculateAddSprites(res);
    this.staticTriangleAnimations();
    this.startMouseEventStream(this.app);
    this.addFiltersToStage(this.app);
    // this.addLogoTriangle(res);
    // NOTE ^: All the important things happen here.

    this.app.ticker.add(this.PIXIticker.bind(this));

    this.app.start();
  }

  ngAfterViewInit(): void {
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      view: this.triangleBgRef.nativeElement,
      transparent: true,
      antialias: true,
      resizeTo: window
    });

    this.app.stage.interactive = true;

    // const renderer = this.app.renderer;
    // renderer.resolution = window.devicePixelRatio;
    // renderer.resize(window.innerWidth - 1, window.innerHeight);
    // renderer.resize(window.innerWidth, window.innerHeight );
    // renderer.plugins.interaction.resolution = window.devicePixelRatio;

    this.app.stop();

    if ((this.loader as any)._afterMiddleware.indexOf(PIXI.spine.AtlasParser.use) < 0) {
      console.log('Atlas Parser not present');
      this.loader.use(PIXI.spine.AtlasParser.use);
    }

    this.loader
        .add('triangle', 'assets/story/triangle.png')
        .add('triangle_rev', 'assets/story/triangle-down.png')
        .add('triangle_logo', 'assets/triangle-logo.png')
        .add('triangle_logo_r', 'assets/triangle-logo-r.png')
        .add('triangle_logo_g', 'assets/triangle-logo-g.png')
        .add('triangle_logo_b', 'assets/triangle-logo-b.png')
        .load(this.loaderComplete.bind(this));
  }

  ngOnDestroy(): void {
    setTimeout(() => {
      this.loader.reset();
      this.app.stop();
      this.app.destroy(true, {children: true, texture: true});
    }, 700);
  }

  private generateTriangleCoordinates() {
    const point = (x, y) => {
      return {x, y};
    };

    const isEven = (n) => {
      return n % 2 === 0;
    };

    const heightPoints = Math.ceil(window.innerHeight / this.settings.triangleSize);
    const widthPoints = Math.ceil(window.innerWidth / this.settings.triangleSize);

    for (let i = 0; i <= heightPoints; ++i) {
      let lastPoint;
      const yEven = i * this.settings.triangleSize + (this.settings.triangleSize / 2);
      const yOdd = i * this.settings.triangleSize - (this.settings.triangleSize / 2);
      if (isEven(i)) {
        lastPoint = point(-(this.settings.triangleSize * 1.5), yEven );
      } else {
        lastPoint = point(-this.settings.triangleSize, yOdd );
      }
      this.triCoordGenerated.push([lastPoint]);
      for (let j = 0; j <= widthPoints; ++j) {
        this.triCoordGenerated[i].push(point(lastPoint.x += this.settings.triangleSize, lastPoint.y));
      }
    }
    const triCopy = JSON.parse(JSON.stringify(this.triCoordGenerated));
    const triCopyLength = triCopy.length;
    for (let i = 0; i < triCopyLength; ++i) {
      const jL = triCopy[i].length;
      for (let j = 0; j < jL; ++j) {
        triCopy[i][j].y -= this.settings.triangleSize;
      }
    }

    this.triCoordGenerated = this.triCoordGenerated.concat(triCopy);
    // TODO: There's a fuckup here on how the arrays are merged.
    // const mergedArr = [];
    // for (let i = 0; i < this.triCoordGenerated.length; ++i) {
    //   mergedArr.push(this.triCoordGenerated[i]);
    //   mergedArr.push(triCopy[i]);
    // }
    // this.triCoordGenerated = mergedArr;
  }

  private onButtonDown() {
    const triangle = this.exactTriangle(this.globalCursorPosition);

    if (!triangle) {return false;}

    if (triangle.alpha === 0.2) {
      triangle.alpha = 1;
    } else {
      triangle.alpha = 0.2;
    }
  }

  private onButtonUp(triangle: {target: PIXI.Sprite}) {
    // this.isdown = false;
    // if (this.isOver) {
    //   this.texture = textureButtonOver;
    // } else {
    //   this.texture = textureButton;
    // }
  }

  private onMouseOverStage(event: any) {
    this.mousePositionStream.emit(event.data.global);
  }

  private onButtonOut(triangle: {target: PIXI.Sprite}) {
    // console.log('onButtonOut', triangle);
    // setTimeout(() => triangle.target.alpha = 1, 10);
  }


  private findTriangleIndexesNearCoordinates(res: {x: number; y: number;}) {
    const foundSpriteIndex = [];
    const triangleCoordinatesLength = this.triangleCoordinates.length;
    for (let i = 0; i < triangleCoordinatesLength; ++i) {
      if (
          res.x > this.triangleCoordinates[i][0] - ((this.settings.triangleSize - 1) / 2) &&
          res.x < this.triangleCoordinates[i][0] + (this.settings.triangleSize + 1) &&
          res.y > this.triangleCoordinates[i][1] - ((this.settings.triangleSize - 1) / 2) &&
          res.y < this.triangleCoordinates[i][1] + this.settings.triangleSize + 1
      ) { foundSpriteIndex.push(i); }
    }
    return foundSpriteIndex;
  }

  private exactTriangle(pos: {x: number; y: number}) {

    let foundTriangle;

    const triangleCoordinatesLength = this.triangleCoordinates.length;
    for (let i = 0; i < triangleCoordinatesLength; ++i) {
      if (
          pos.x > this.triangleCoordinates[i][0] - this.settings.triangleSize / 5 &&
          pos.x < this.triangleCoordinates[i][0] + this.settings.triangleSize / 5 &&
          pos.y > this.triangleCoordinates[i][1] - this.settings.triangleSize / 5 &&
          pos.y < this.triangleCoordinates[i][1] + this.settings.triangleSize / 5
      ) { foundTriangle = this.triangleSprites[i]; }
    }

    return foundTriangle;
  }

  private animateTrianglesUnderCursor(foundSpriteIndex: any[]) {
    if (!this.toggles.trailMode) { return false; }
    foundSpriteIndex.map((ele) => {
      // NOTE: Animate every triangle besides entryTriangle
      if (!this.triangleSprites[ele].buttonMode) {
        this.triangleSprites[ele].alpha = this.settings.trailOpacity;
        TweenLite.to(this.triangleSprites[ele], this.settings.trail, {alpha: 0})/*.delay(this.randint(0, 0.3))*/;
      }
    });
  }

  /** Collection of static animations */
  private staticTriangleAnimations() {

    const showProgressingTriangle = () => {
      this.entryTriangle = this.triangleSprites[this.randint(this.triangleSprites.length / 3 - 20, this.triangleSprites.length / 3 + 20)];
      // this.entryTriangle.filters.push(new PIXIGlowFilter() as any);
      this.entryTriangle.interactive = true;
      this.entryTriangle.buttonMode = true;

      const pos = {x: this.entryTriangle.position.x + 26, y: this.entryTriangle.position.y};
      const foundTrianglesIndexes = this.findTriangleIndexesNearCoordinates(pos);
      foundTrianglesIndexes.map((index) => {
        TweenLite.to(this.triangleSprites[index], 1, {alpha: 0.3}).delay(this.randintFloat(0.1, 1.2));
      });

      TweenLite.to(this.entryTriangle, 0.5, {alpha: 1}).delay(this.randintFloat(1, 1.6));
      this.entryTriangle.on('pointerdown', this.clickedEntryTriangle.bind(this));
    };

    const drawLetterA = () => {

      const coord = [{"x":612.5,"y":157.5},{"x":595,"y":157.5},{"x":630,"y":157.5},{"x":577.5,"y":227.5},{"x":612.5,"y":227.5},{"x":647.5,"y":227.5},{"x":560,"y":227.5},{"x":595,"y":227.5},{"x":630,"y":227.5},{"x":665,"y":227.5},{"x":542.5,"y":297.5},{"x":577.5,"y":297.5},{"x":647.5,"y":297.5},{"x":682.5,"y":297.5},{"x":525,"y":297.5},{"x":560,"y":297.5},{"x":665,"y":297.5},{"x":700,"y":297.5},{"x":507.5,"y":367.5},{"x":542.5,"y":367.5},{"x":682.5,"y":367.5},{"x":717.5,"y":367.5},{"x":490,"y":367.5},{"x":525,"y":367.5},{"x":700,"y":367.5},{"x":735,"y":367.5},{"x":472.5,"y":437.5},{"x":507.5,"y":437.5},{"x":717.5,"y":437.5},{"x":752.5,"y":437.5},{"x":455,"y":437.5},{"x":490,"y":437.5},{"x":735,"y":437.5},{"x":770,"y":437.5},{"x":437.5,"y":507.5},{"x":472.5,"y":507.5},{"x":752.5,"y":507.5},{"x":787.5,"y":507.5},{"x":420,"y":507.5},{"x":455,"y":507.5},{"x":770,"y":507.5},{"x":805,"y":507.5},{"x":402.5,"y":577.5},{"x":437.5,"y":577.5},{"x":787.5,"y":577.5},{"x":822.5,"y":577.5},{"x":385,"y":577.5},{"x":420,"y":577.5},{"x":805,"y":577.5},{"x":840,"y":577.5},{"x":367.5,"y":647.5},{"x":402.5,"y":647.5},{"x":822.5,"y":647.5},{"x":857.5,"y":647.5},{"x":350,"y":647.5},{"x":385,"y":647.5},{"x":420,"y":647.5},{"x":455,"y":647.5},{"x":490,"y":647.5},{"x":525,"y":647.5},{"x":560,"y":647.5},{"x":595,"y":647.5},{"x":630,"y":647.5},{"x":665,"y":647.5},{"x":700,"y":647.5},{"x":735,"y":647.5},{"x":840,"y":647.5},{"x":875,"y":647.5},{"x":612.5,"y":122.5},{"x":577.5,"y":192.5},{"x":612.5,"y":192.5},{"x":647.5,"y":192.5},{"x":595,"y":192.5},{"x":630,"y":192.5},{"x":542.5,"y":262.5},{"x":577.5,"y":262.5},{"x":647.5,"y":262.5},{"x":682.5,"y":262.5},{"x":560,"y":262.5},{"x":595,"y":262.5},{"x":630,"y":262.5},{"x":665,"y":262.5},{"x":507.5,"y":332.5},{"x":542.5,"y":332.5},{"x":682.5,"y":332.5},{"x":717.5,"y":332.5},{"x":525,"y":332.5},{"x":560,"y":332.5},{"x":665,"y":332.5},{"x":700,"y":332.5},{"x":472.5,"y":402.5},{"x":507.5,"y":402.5},{"x":717.5,"y":402.5},{"x":752.5,"y":402.5},{"x":490,"y":402.5},{"x":525,"y":402.5},{"x":700,"y":402.5},{"x":735,"y":402.5},{"x":437.5,"y":472.5},{"x":472.5,"y":472.5},{"x":752.5,"y":472.5},{"x":787.5,"y":472.5},{"x":455,"y":472.5},{"x":490,"y":472.5},{"x":735,"y":472.5},{"x":770,"y":472.5},{"x":402.5,"y":542.5},{"x":437.5,"y":542.5},{"x":787.5,"y":542.5},{"x":822.5,"y":542.5},{"x":420,"y":542.5},{"x":455,"y":542.5},{"x":770,"y":542.5},{"x":805,"y":542.5},{"x":367.5,"y":612.5},{"x":402.5,"y":612.5},{"x":822.5,"y":612.5},{"x":857.5,"y":612.5},{"x":385,"y":612.5},{"x":420,"y":612.5},{"x":805,"y":612.5},{"x":840,"y":612.5},{"x":332.5,"y":682.5},{"x":367.5,"y":682.5},{"x":402.5,"y":682.5},{"x":437.5,"y":682.5},{"x":472.5,"y":682.5},{"x":507.5,"y":682.5},{"x":542.5,"y":682.5},{"x":577.5,"y":682.5},{"x":612.5,"y":682.5},{"x":647.5,"y":682.5},{"x":682.5,"y":682.5},{"x":717.5,"y":682.5},{"x":752.5,"y":682.5},{"x":857.5,"y":682.5},{"x":892.5,"y":682.5},{"x":350,"y":682.5},{"x":385,"y":682.5},{"x":420,"y":682.5},{"x":455,"y":682.5},{"x":490,"y":682.5},{"x":525,"y":682.5},{"x":560,"y":682.5},{"x":595,"y":682.5},{"x":630,"y":682.5},{"x":665,"y":682.5},{"x":700,"y":682.5},{"x":735,"y":682.5},{"x":840,"y":682.5},{"x":875,"y":682.5}]
      // These coordinates are for a letter a on a 1426 x 946 resolution = https://www.dropbox.com/s/o2aqic43d68jlxx/Screenshot%202019-06-26%2011.32.28.png?dl=0
      // What to do with it next ^ ?
    };

    const centerWave = () => {
      const rows = this.triangleCoordinates.length;
      const cols = this.triangleCoordinates[0].length;

      for (let row = 0; row < rows; ++row) {
        for (let col = 0; col < cols; ++col) {
          if (this.triangleSprites[row]) {
            const timeline = new TimelineLite();
            timeline.to(this.triangleSprites[row], 2, { alpha: 1, ease: Power2.easeOut }).delay(row / 600);
            timeline.to(this.triangleSprites[row], 1, { alpha: 0, ease: Power2.easeIn });
          }
          if (this.triangleSprites[rows - row]) {
            const timeline = new TimelineLite();
            timeline.to(this.triangleSprites[rows - row], 2, { alpha: 1, ease: Power2.easeOut }).delay(row / 600);
            timeline.to(this.triangleSprites[rows - row], 1, { alpha: 0, ease: Power2.easeIn });
          }
        }
      }
    };

    const lightUpTheScreen = () => {
      this.triangleSprites.map((sprite) => {
        const timeline = new TimelineLite();
        timeline.to(sprite, 3, {alpha: 1, ease: Power2.easeIn}).delay(this.randintFloat(1, 3));
        // timeline.to(sprite, 3, {alpha: 0, ease: Power2.easeOut});
      });
    };

    if (!this.toggles.staticAnimation) { return false; }
    setTimeout(() => {
      showProgressingTriangle();
      // lightUpTheScreen();
      // centerWave();







    }, 3000);
  }

  private startMouseEventStream(app) {
    app.renderer﻿.plugins.interaction.on( 'mousemove', this.onMouseOverStage.bind(this));
  }

  private calculateAddSprites(res: any) {
    this.particlesContainer = new PIXI.ParticleContainer();
    this.particlesContainer.width = window.innerWidth;
    this.particlesContainer.height = window.innerHeight;
    this.particlesContainer.position.x = 0;
    this.particlesContainer.position.y = 0;

    this.generateTriangleCoordinates();

    for (let i = 0; i < this.triCoordGenerated.length; ++i) {
      for (let j = 0; j < this.triCoordGenerated[i].length; ++j) {
        let sprite;
        if (i % 2 === 0) {
          sprite = PIXI.Sprite.from(res.triangle_rev.url);
        } else {
          sprite = PIXI.Sprite.from(res.triangle.url);
        }
        sprite.alpha = this.settings.initialSpriteAlpha;
        // sprite.filters = [this.filters.blur]; TODO: This kills the GPU.
        sprite.anchor.set(0.5);
        sprite.position.x = this.triCoordGenerated[i][j].x;
        sprite.position.y = this.triCoordGenerated[i][j].y;


        // Scalable scale :)
        sprite.scale.x = this.settings.triangleSize / this.settings.baseImageScaleSize;
        sprite.scale.y = this.settings.triangleSize / this.settings.baseImageScaleSize;

        if (this.toggles.drawingMode) {
          // Mouse & touch events are normalized into
          // the pointer* events for handling different
          // button events.
          sprite.alpha = 1;
          sprite.interactive = true;
          sprite.buttonMode = true;
          sprite.on('pointerdown', this.onButtonDown.bind(this));
          // .on('pointerup', this.onButtonUp.bind(this))
          // .on('pointerupoutside', this.onButtonUp.bind(this))
          // .on('pointerover', this.onMouseOverStage.bind(this))
          // .on('pointerout', this.onButtonOut.bind(this));
        }

        this.triangleCoordinates.push([this.triCoordGenerated[i][j].x, this.triCoordGenerated[i][j].y]);
        this.triangleSprites.push(sprite);
        this.app.stage.addChild(sprite);
        // this.particlesContainer.addChild(sprite);
      }
    }

    this.app.stage.addChild((this.particlesContainer));
  }

  private clickedEntryTriangle() {
    console.log('entry triangle clicked', this.entryTriangle);
    this.animService.setCurrentAnimation(3);
    this.router.navigate(['home']);
  }

  private randint(min, max): number {
    return Math.ceil(Math.random() * (max - min) + min);
  }

  private randintFloat(min, max): number {
    return Math.random() * (max - min) + min;
  }

  private addFiltersToStage(app: PIXI.Application) {
    if (!this.toggles.stageFilters) { return false; }
    app.stage.filters = [this.filters.adjustment, this.filters.crt];
  }

  private addLogoTriangle(res) {
    this.logoTriangle.r = PIXI.Sprite.from(res.triangle_logo_r.url);
    this.logoTriangle.g = PIXI.Sprite.from(res.triangle_logo_b.url);
    this.logoTriangle.b = PIXI.Sprite.from(res.triangle_logo_g.url);

    this.logoTriangle.r.blendMode = PIXI.BLEND_MODES.ADD;
    this.logoTriangle.g.blendMode = PIXI.BLEND_MODES.ADD;
    this.logoTriangle.b.blendMode = PIXI.BLEND_MODES.ADD;

    this.logoTriangle.r.scale.x = 0.4;
    this.logoTriangle.r.scale.y = 0.4;
    this.logoTriangle.g.scale.x = 0.4;
    this.logoTriangle.g.scale.y = 0.4;
    this.logoTriangle.b.scale.x = 0.4;
    this.logoTriangle.b.scale.y = 0.4;

    // console.log(this.logoTriangle)

    const position = {
      x: window.innerWidth,
      y: window.innerHeight
    };
    // this.logoTriangle.r.position.x = position.x;
    // this.logoTriangle.r.position.y = position.y;
    // this.logoTriangle.g.position.x = position.x;
    // this.logoTriangle.g.position.y = position.y;
    // this.logoTriangle.b.position.x = position.x;
    // this.logoTriangle.b.position.y = position.y;

    TweenMax.to(this.logoTriangle.r.position, 0.5, {x: this.randint(1, 50), y: this.randint(1, 50), repeat: -1}).yoyo();
    TweenMax.to(this.logoTriangle.g.position, 0.5, {x: this.randint(1, 50), y: this.randint(1, 50), repeat: -1}).yoyo();
    TweenMax.to(this.logoTriangle.b.position, 0.5, {x: this.randint(1, 0), y: this.randint(1, 50), repeat: -1}).yoyo();

    this.app.stage.addChild(this.logoTriangle.r, this.logoTriangle.b, this.logoTriangle.g);

  }
}
