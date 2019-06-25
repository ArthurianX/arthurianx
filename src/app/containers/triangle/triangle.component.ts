import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import GraphicsSVG from '../../services/pixi-svg/SVG';
import { throttleTime } from 'rxjs/operators';
import { TweenLite, TimelineLite, Power2 } from 'gsap';

import { KawaseBlurFilter, AdjustmentFilter, CRTFilter, AdjustmentOptions, CRTOptions } from 'pixi-filters';
import PIXIGlowFilter from '../../pixi-filters/glow';


@Component({
  selector: 'app-play',
  templateUrl: './triangle.component.html',
  styleUrls: ['./triangle.component.sass']
})
export class TriangleComponent implements AfterViewInit {
  loader: PIXI.Loader = PIXI.Loader.shared;
  @ViewChild('triangleBg', {static: true}) triangleBgRef: ElementRef;
  @ViewChild('triangle', {static: true}) triangleRef: ElementRef;
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
  public settings: {
    initialSpriteAlpha: number;
    trailOpacity: number;
    trail: number;
  } = {
    initialSpriteAlpha: 0,
    trailOpacity: 0.7,
    trail: 1
  };
  public entryTriangle: PIXI.Sprite;
  private app: PIXI.Application;
  private particlesContainer: PIXI.ParticleContainer;
  private tickerValue: number;


  constructor() {
    this.mousePositionStream
        .pipe( throttleTime(50) )
        .subscribe((res) => {
          // console.log('stream', res);
          const foundTrianglesIndexes = this.findTriangleIndexesNearCoordinates(res);
          this.animateTrianglesUnderCursor(foundTrianglesIndexes);
        });
    this.tickerStream
      .pipe( throttleTime(50) )
        .subscribe((time) => {
          // console.log('stream', res);
          this.filters.crt.time = time;
          this.filters.crt.curvature = time;
          const alpha = this.randintFloat(0.6, 0.9).toFixed(2) as any;
          if (this.entryTriangle) {
            this.entryTriangle.alpha = alpha;
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

    this.app.stop();

    if ((this.loader as any)._afterMiddleware.indexOf(PIXI.spine.AtlasParser.use) < 0) {
      console.log('Atlas Parser not present');
      this.loader.use(PIXI.spine.AtlasParser.use);
    }

    this.loader
        .add('triangle', 'assets/story/triangle.png')
        .add('triangle_rev', 'assets/story/triangle-down.png')
        .load(this.loaderComplete.bind(this));
  }

  private createCoordinatesLine() {
    const point = (x, y) => {
      return {x, y};
    };

    const isEven = (n) => {
      return n % 2 === 0;
    };

    const movingFrame = 50;

    const heightPoints = Math.ceil(window.innerHeight / movingFrame);
    const widthPoints = Math.ceil(window.innerWidth / movingFrame);

    for (let i = 0; i <= heightPoints; ++i) {
      let lastPoint;
      const yEven = i * movingFrame + (movingFrame / 2);
      const yOdd = i * movingFrame - (movingFrame / 2);
      if (isEven(i)) {
        lastPoint = point(-(movingFrame * 1.5), yEven );
      } else {
        lastPoint = point(-movingFrame, yOdd );
      }
      this.triCoordGenerated.push([lastPoint]);
      for (let j = 0; j <= widthPoints; ++j) {
        this.triCoordGenerated[i].push(point(lastPoint.x += movingFrame, lastPoint.y));
      }
    }
    const triCopy = JSON.parse(JSON.stringify(this.triCoordGenerated));
    const triCopyLength = triCopy.length;
    for (let i = 0; i < triCopyLength; ++i) {
      const jL = triCopy[i].length;
      for (let j = 0; j < jL; ++j) {
        triCopy[i][j].y -= movingFrame;
      }
    }
    this.triCoordGenerated = this.triCoordGenerated.concat(triCopy);
  }

  private count() {
    const w = window.innerWidth / 50;
    const h =  window.innerHeight / 50;

    return Math.ceil(w * h + (w * h / 5));
  }

  public loaderComplete(loader, res) {
    // NOTE: All the important things happen here.
    this.calculateAddSprites(res);
    this.staticTriangleAnimations();
    this.startMouseEventStream(this.app);
    // NOTE ^: All the important things happen here.

    this.app.ticker.add(this.PIXIticker.bind(this));
    this.app.stage.filters = [this.filters.adjustment, this.filters.crt];
    this.app.start();
  }

  private onButtonDown(triangle: {target: PIXI.Sprite}) {
    console.log(triangle);
    // this.isdown = true;
    // this.texture = textureButtonDown;
    // this.alpha = 1;
  }

  private onButtonUp(triangle: {target: PIXI.Sprite}) {
    // this.isdown = false;
    // if (this.isOver) {
    //   this.texture = textureButtonOver;
    // } else {
    //   this.texture = textureButton;
    // }
  }

  private onButtonOver(event: any) {
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
          res.x > this.triangleCoordinates[i][0] - 26 &&
          res.x < this.triangleCoordinates[i][0] + 52 &&
          res.y > this.triangleCoordinates[i][1] - 26 &&
          res.y < this.triangleCoordinates[i][1] + 52
      ) { foundSpriteIndex.push(i); }
    }
    return foundSpriteIndex;
  }

  private animateTrianglesUnderCursor(foundSpriteIndex: any[]) {
    foundSpriteIndex.map((ele) => {
      // NOTE: Animate every triangle besides entryTriangle
      if (!this.triangleSprites[ele].buttonMode) {
        this.triangleSprites[ele].alpha = this.settings.trailOpacity;
        TweenLite.to(this.triangleSprites[ele], this.settings.trail, {alpha: 0})/*.delay(this.randint(0, 0.3))*/;
      }
    });
  }

  private staticTriangleAnimations() {
    setTimeout(() => {

      // this.triangleSprites.map((sprite) => {
      //   const timeline = new TimelineLite();
      //   timeline.to(sprite, 3, {alpha: 1, ease: Power2.easeIn});
      //   timeline.to(sprite, 3, {alpha: 0, ease: Power2.easeOut});
      // });

      this.entryTriangle = this.triangleSprites[this.randint(this.triangleSprites.length / 3 - 20, this.triangleSprites.length / 3 + 20)];
      // this.entryTriangle.filters.push(new PIXIGlowFilter() as any);
      this.entryTriangle.interactive = true;
      this.entryTriangle.buttonMode = true;
      this.entryTriangle.alpha = 1;
      this.entryTriangle.on('pointerdown', this.clickedEntryTriangle.bind(this));

      // const pos = {x: this.entryTriangle.position.x + 26, y: this.entryTriangle.position.y};
      // const foundTrianglesIndexes = this.findTriangleIndexesNearCoordinates(pos);
      // foundTrianglesIndexes.map((index) => {
      //   this.triangleSprites[index].buttonMode = true;
      //   this.triangleSprites[index].alpha = 0.2;
      // });





    }, 3000);
  }

  private startMouseEventStream(app) {
    app.renderer﻿.plugins.interaction.on( 'mousemove', this.onButtonOver.bind(this));
  }

  private calculateAddSprites(res: any) {
    this.particlesContainer = new PIXI.ParticleContainer();
    this.particlesContainer.width = window.innerWidth;
    this.particlesContainer.height = window.innerHeight;
    this.particlesContainer.position.x = 0;
    this.particlesContainer.position.y = 0;

    this.createCoordinatesLine();

    for (let i = 0; i < this.triCoordGenerated.length; ++i) {
      for (let j = 0; j < this.triCoordGenerated[i].length; ++j) {
        let sprite;
        if (i % 2 === 0) {
          sprite = PIXI.Sprite.from(res.triangle_rev.url);
        } else {
          sprite = PIXI.Sprite.from(res.triangle.url);
        }
        sprite.alpha = this.settings.initialSpriteAlpha;
        sprite.filters = [this.filters.blur];
        sprite.position.x = this.triCoordGenerated[i][j].x;
        sprite.position.y = this.triCoordGenerated[i][j].y;

        // sprite.interactive = true;
        // sprite.buttonMode = true;
        // sprite
        // // Mouse & touch events are normalized into
        // // the pointer* events for handling different
        // // button events.
        //     .on('pointerdown', this.onButtonDown.bind(this))
        //     .on('pointerup', this.onButtonUp.bind(this))
        //     .on('pointerupoutside', this.onButtonUp.bind(this))
        //     .on('pointerover', this.onButtonOver.bind(this))
        //     .on('pointerout', this.onButtonOut.bind(this));

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
    window.location.reload();
  }

  private randint(min, max): number {
    return Math.ceil(Math.random() * (max - min) + min);
  }

  private randintFloat(min, max): number {
    return Math.random() * (max - min) + min;
  }
}
