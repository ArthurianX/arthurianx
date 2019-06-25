import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import GraphicsSVG from '../../services/pixi-svg/SVG';
import { throttleTime } from 'rxjs/operators';
import { TweenLite, TweenMax } from 'gsap';
import PIXIGlowFilter from '../../pixi-filters/glow';
import { KawaseBlurFilter } from 'pixi-filters';


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
  public mousePosition: EventEmitter<any> = new EventEmitter();
  private app: PIXI.Application;
  private particlesContainer: PIXI.ParticleContainer;
  private tickerValue: number;
  constructor() {
    this.mousePosition
        .pipe( throttleTime(50) )
        .subscribe((res) => {
          // console.log('stream', res);
          const foundSpriteIndex = [];
          const triangleCoordinatesLength = this.triangleCoordinates.length;
          for (let i = 0; i < triangleCoordinatesLength; ++i) {
            if (
                res.x > this.triangleCoordinates[i][0] &&
                res.x < this.triangleCoordinates[i][0] + 50 &&
                res.y > this.triangleCoordinates[i][1] &&
                res.y < this.triangleCoordinates[i][1] + 50
            ) { foundSpriteIndex.push(i); }
          }
          // TODO: Still sucks.
          foundSpriteIndex.map((ele) => {
            this.triangleSprites[ele].alpha = 0.7;
            TweenLite.to(this.triangleSprites[ele], 1, {alpha: 0});
          });

        });
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

  // private createCoordinatesCentral() {
  //   const point = (x, y) => {
  //     return {x, y} as PIXI.Point;
  //   };
  //
  //   const withinBorder = (p: PIXI.Point, coords) => {
  //     return p.x > coords[0] - movingFrame
  //         && p.x < coords[2] /*+ movingFrame*/
  //         && p.y > coords[1] - movingFrame
  //         && p.y < coords[3] /*+ movingFrame*/;
  //   };
  //
  //   const verifyPoint = (list, p) => {
  //     const indexes = list.length;
  //     let existence = false;
  //     for (let i = 0; i < indexes; i++) {
  //       if (list[i].x === p.x && list[i].y === p.y) {
  //         existence = true;
  //         break;
  //       }
  //     }
  //     return existence;
  //   };
  //
  //   const pushNeighbourhingPoints = (list, source) => {
  //     list.push(source);
  //     if (!withinBorder(source, screenCoord)) {
  //       return false;
  //     }
  //
  //     const r = point(source.x + movingFrame, source.y );
  //     !verifyPoint(list, r) ? pushNeighbourhingPoints(list, r) : list.push(r);
  //
  //     const rt = point(source.x + movingFrame, source.y - movingFrame );
  //     !verifyPoint(list, rt) ? pushNeighbourhingPoints(list, rt) : list.push(rt);
  //
  //     const rb = point(source.x + movingFrame, source.y + movingFrame );
  //     !verifyPoint(list, rb) ? pushNeighbourhingPoints(list, rb) : list.push(rb);
  //     const t = point(source.x, source.y - movingFrame );
  //     !verifyPoint(list, t) ? pushNeighbourhingPoints(list, t) : list.push(t);
  //     const b = point(source.x, source.y + movingFrame );
  //     !verifyPoint(list, b) ? pushNeighbourhingPoints(list, b) : list.push(b);
  //     const l = point(source.x - movingFrame, source.y );
  //     !verifyPoint(list, l) ? pushNeighbourhingPoints(list, l) : list.push(l);
  //     const lt = point(source.x - movingFrame, source.y - movingFrame );
  //     !verifyPoint(list, lt) ? pushNeighbourhingPoints(list, lt) : list.push(lt);
  //     const lb = point(source.x - movingFrame, source.y + movingFrame );
  //     !verifyPoint(list, lb) ? pushNeighbourhingPoints(list, lb) : list.push(lb);
  //   };
  //
  //
  //   const screenCoord = [0, 0, window.innerWidth, window.innerHeight];
  //   const movingFrame = 52;
  //   const center = {x: Math.floor(window.innerWidth / 2), y: Math.floor(window.innerHeight / 2)} as PIXI.Point;
  //
  //   pushNeighbourhingPoints(this.triCoordGenerated, center);
  //
  //   this.triCoordGenerated = _.uniqWith(this.triCoordGenerated, _.isEqual);
  //   console.log('this.triCoordGenerated', this.triCoordGenerated);
  // }

  private createCoordinatesLine() {
    const point = (x, y) => {
      return {x, y};
    };

    const isEven = (n) => {
      return n % 2 === 0;
    };

    const isOdd = (n) => {
      return Math.abs(n % 2) === 1;
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
    this.particlesContainer = new PIXI.ParticleContainer();
    this.particlesContainer.width = window.innerWidth;
    this.particlesContainer.height = window.innerHeight;
    this.particlesContainer.position.x = 0;
    this.particlesContainer.position.y = 0;
    // this.particlesContainer.filters = [new PIXIGlowFilter()];
    // this.particlesContainer.filters = [new PIXI.filters.BlurFilter(20, 1, 1)];
    this.particlesContainer.filters = [new PIXI.filters.NoiseFilter(10, 30)];
    // this.createCoordinatesCentral();
    this.createCoordinatesLine();

    for (let i = 0; i < this.triCoordGenerated.length; ++i) {
      for (let j = 0; j < this.triCoordGenerated[i].length; ++j) {
        let sprite;
        if (i % 2 === 0) {
          sprite = PIXI.Sprite.from(res.triangle_rev.url);
        } else {
          sprite = PIXI.Sprite.from(res.triangle.url);
        }
        sprite.alpha = 0;
        sprite.filters = [new KawaseBlurFilter(0.1, 1, false)];
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
    // console.log('this.particlesContainer', this.particlesContainer);
    // this.particlesContainer.interactive = true;
    // this.particlesContainer.buttonMode = true;
    // this.app.stage.on('pointerover', this.onButtonOver.bind(this));
    // this.app.stage.on('pointerdown', this.onButtonDown.bind(this));

    // this.app.stage.addChild(this.particlesContainer);
    // console.log(this.particlesContainer);

    this.app.ticker.add(this.PIXIticker.bind(this));
    this.app.start();
    this.app.renderer﻿.plugins.interaction.on( 'mousemove', this.onButtonOver.bind(this));
    console.log('this.app', this.app);
  }

  public PIXIticker(time) {
    this.tickerValue = time;
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
    this.mousePosition.emit(event.data.global);
  }

  private onButtonOut(triangle: {target: PIXI.Sprite}) {
    // console.log('onButtonOut', triangle);
    // setTimeout(() => triangle.target.alpha = 1, 10);
  }


}
