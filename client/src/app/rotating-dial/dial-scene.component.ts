///<reference path="../../../node_modules/@angular/core/src/metadata/directives.d.ts"/>
import {
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  HostListener,
  EventEmitter, OnInit, NgZone, ViewEncapsulation
} from '@angular/core';

import * as PIXI from 'pixi.js';

import {
  TweenMax,
  TweenLite,
  TimelineMax,
  Circ,
  Linear,
  Sine,
  SlowMo,
  Power4
} from 'gsap';

import { SceneComponent, RendererComponent, AssetService, PixiService } from 'angular2pixi';

@Component({
  selector: 'dial-scene',
  // styleUrls: [ './dial-scene.component.scss' ],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <span class="mouse"> <span class="mouse__wheel"></span> </span>
    <div class="controls">
      <div class="mute">mute</div>
      <div class="stop">stop</div>  
    </div>`
})

// export class DialSceneComponent extends SceneComponent implements OnInit {
export class DialSceneComponent implements OnInit {
  // The renderer to use
  @Input() public renderer: RendererComponent;

  // Emitter for notifying the outside world when everything is set up
  // and passing a reference to 'this'
  @Output() public stageUpdated = new EventEmitter();

  /** Settings for Development */
  public enableSounds: boolean = false;
  /** Settings for Development */

  public scale: number = 1;
  public scaleFactor: number = 1.1;

  public dial = 'assets/svg/rotatingdial.svg';
  public safeClick = 'assets/sound/safe_click.m4a';
  public safeClickShort = 'assets/sound/safe_click_short.wav';
  public safeClickLong = 'assets/sound/safe_click_long.wav';
  public safeClickMultiple = 'assets/sound/safe_click_multiple.wav';
  public dial0 = 'assets/svg/layers/0_background_1200.svg';
  public dial1 = 'assets/svg/layers/1_inner_rim_563.svg';
  public dial2 = 'assets/svg/layers/2_inner_gears_619.svg';
  public dial3 = 'assets/svg/layers/3_curved_rim_654.svg';
  public dial4 = 'assets/svg/layers/4_inner_gears_758.svg';
  public dial5 = 'assets/svg/layers/5_middle_gears_771.svg';
  public dial6 = 'assets/svg/layers/6_Middle_grinding_inner_849.svg';
  public dial7 = 'assets/svg/layers/7_Middle_grinding_outer_920.svg';
  public dial8 = 'assets/svg/layers/8_almost_outer_gears_970.svg';
  public dial9 = 'assets/svg/layers/9_almost_outer_gears_1005.svg';
  public dial10 = 'assets/svg/layers/10_curved_rim_1041.svg';
  public dial11 = 'assets/svg/layers/11_outer_gears_1080.svg';
  public dial12 = 'assets/svg/layers/12_outer_rim_1200.svg';

  // Central container for layers
  public mainStage: PIXI.Container = new PIXI.Container();

  public animationLayersSettings: any;
  public dialSound: any;
  public dialSoundShort: any;
  public dialSoundLong: any;
  public dialSoundMultiple: any;

  public dials: any = {};
  public dialsLoaded: boolean = false;
  public layers: any = {
    background: new PIXI.Container()
  };

  public moveHandlers = {};  // Functions to execute on move
  public clickHandlers = {};  // Functions to execute on click

  constructor(
    asset: AssetService,
    pixie: PixiService,
    public ngZone: NgZone
  ) {
    // super();
    console.log('env', ENV);
    console.log('asset', asset);
    console.log('pixie', pixie);
  }

  public ngOnInit() {

    this.initLayers();
    this.initDial();

    this.renderer.pixi.worldStage.addChild(this.mainStage);

    // Output context to scene to any components listening
    this.stageUpdated.emit(this);
  }

  public initLayers() {
    this.layers.background = new PIXI.Container();
    this.renderer.pixi.worldStage.addChild(this.layers.background);
  }

  public initSound(resources) {

    // Create a new sound
    this.dialSound = PIXI.sound.Sound.from(resources.safeClick);
    this.dialSoundShort = PIXI.sound.Sound.from(resources.safeClickShort);
    this.dialSoundLong = PIXI.sound.Sound.from(resources.safeClickLong);
    this.dialSoundMultiple = PIXI.sound.Sound.from(resources.safeClickMultiple);

    // Add the sprite markers
    this.dialSound.addSprites({
      'short click': { start: 0, end: 1 },
      'click': { start: 1, end: 2 },
      'long click': { start: 4, end: 7.2 },
    });

    // Use the sprite alias to play
    // this.dialSound.play('short click').loop = true;
    // this.dialSound.play('click').loop = true;
    // this.dialSound.play('long click').loop = true;

    // Declare each sound loop and volume.
    this.dialSoundShort.loop = true;
    this.dialSoundLong.loop = true;
    this.dialSoundLong.volume = 0.3;
    this.dialSoundMultiple.loop = true;
    this.dialSoundMultiple.volume = 0.5;

    // Finally play all three sounds, start at different intervals
    if (this.enableSounds) {
      this.dialSoundShort.play();
      setTimeout(() => { this.dialSoundLong.play(); }, 500);
      setTimeout(() => { this.dialSoundMultiple.play(); }, 1000);
    }
  }

  public initDial() {

    const loader = PIXI.loader; // PixiJS exposes a premade instance for you to use.

    let i = 0;
    while (i <= 12) {
      loader.add('rotatingdial' + i, this['dial' + i]);
      i++;
    }

    loader.add('safeClick', this.safeClick);
    loader.add('safeClickShort', this.safeClickShort);
    loader.add('safeClickLong', this.safeClickLong);
    loader.add('safeClickMultiple', this.safeClickMultiple);

    loader.load((loaderx, resources) => {
      let j = 0;
      while (j <= 12) {
        this.dials['ldial' + j] = (new PIXI.Sprite(resources['rotatingdial' + j].texture));
        this.dials['ldial' + j].position.x = this.renderer.width / 2;
        this.dials['ldial' + j].position.y = this.renderer.height / 2;

        this.dials['ldial' + j].pivot.x = this.dials['ldial' + j].width / 2;
        this.dials['ldial' + j].pivot.y = this.dials['ldial' + j].height / 2;

        this.layers.background.addChild(this.dials['ldial' + j]);

        j++;
      }

      this.dialsLoaded = true;

      setTimeout(() => {
        this.init();
        this.initSound(resources);
      }, 5000);
    });
  }

  public init(layers?: any): void {

    this.ngZone.runOutsideAngular(() => {
      this.GSAPanimations();

      const scrollOnCanvas = (event) => {
        if (event.target.parentNode.parentNode.id === 'dial-renderer') {
          this.scrollOccured(event);
        }
      };

      document.addEventListener('mousewheel', scrollOnCanvas, false);
    });

  }

  public playAnimation() {

    /** Put this in the init function */

    /*let runAnimation = () => {
      if (this.dialsLoaded) {
        // console.log('this.dialsLoaded', this.dials);
        this.dials.ldial3.rotation += 0.05;
        // this.renderer.pixi.renderer.render(this.layers.background);
        this.renderer.pixi.renderer.render(this.mainStage);
      }
    };

    setInterval(() => {
      runAnimation();
    }, 500);

    animate();
    function animate() {
      requestAnimationFrame(animate);
      runAnimation();
    }

    this.ngZone.runOutsideAngular(() => requestAnimationFrame(() => {
      this.playAnimation();
    }));*/

    /** ^^ Put this in the init function */

    if (this.dialsLoaded) {
      this.dials.ldial3.rotation += 0.05;
      // this.renderer.pixi.renderer.render(this.layers.background);
      this.renderer.pixi.renderer.render(this.mainStage);
    }

    requestAnimationFrame(() => {
      this.playAnimation();
    });
  }

  public GSAPanimations() {

    this.animationLayersSettings = {

      dial0: {
        instance: null,
        time: 5,
        rotation: '+=1',
        yoyo: false,
        ease: Linear.easeNone
      },

      dial1: {
        instance: null,
        time: 5,
        rotation: '+=2',
        yoyo: false,
        ease: Linear.easeNone
      },

      dial2: {
        instance: null,
        time: 5,
        rotation: '+=1',
        yoyo: false,
        ease: Linear.easeNone
      },

      dial3: {
        instance: null,
        time: 5,
        rotation: '-=1',
        yoyo: false,
        ease: Linear.easeNone
      },

      dial4: {
        instance: null,
        time: 5,
        rotation: '+=0.5',
        yoyo: false,
        ease: Linear.easeNone
      },

      dial5: {
        instance: null,
        time: 5,
        rotation: '+=1',
        yoyo: false,
        ease: Linear.easeNone
      },

      dial6: {
        instance: null,
        time: 5,
        rotation: '+=0.7',
        yoyo: false,
        ease: Linear.easeNone
      },

      dial7: {
        instance: null,
        time: 5,
        rotation: '+=1.2',
        yoyo: false,
        ease: Linear.easeNone
      },

      dial8: {
        instance: null,
        time: 5,
        rotation: '+=1',
        yoyo: false,
        ease: Linear.easeNone
      },

      dial9: {
        instance: null,
        time: 5,
        rotation: '+=1',
        yoyo: false,
        ease: Linear.easeNone
      },

      dial10: {
        instance: null,
        time: 5,
        rotation: '-=1.5',
        yoyo: false,
        ease: Linear.easeNone
      },

      dial11: {
        instance: null,
        time: 5,
        rotation: '+=0.5',
        yoyo: false,
        ease: Linear.easeNone
      },

      dial12: {
        instance: null,
        time: 5,
        rotation: '+=1.5',
        yoyo: false,
        ease: Linear.easeNone
      },

    };

    let i = 0;
    while (i <= 12) {

      const currentAnimation = this.animationLayersSettings['dial' + i];

      currentAnimation.instance = TweenMax.to(this.dials['ldial' + i], currentAnimation.time, {
        rotation: currentAnimation.rotation,
        repeat: 500,
        yoyo: currentAnimation.yoyo,
        ease: currentAnimation.ease, //Sine.easeInOut,
        onComplete: (event) => {console.log('do stuff', event)}
      });

      i++;
    }
  }

  public scrollOccured(event) {

    console.log(event.deltaY);

    const maxTreshold = 700;
    let scrollAcceleration = event.deltaY;

    if (event.deltaY > maxTreshold) {
      scrollAcceleration = maxTreshold;
    }

    if (event.deltaY < -maxTreshold) {
      scrollAcceleration = -maxTreshold;
    }

    const calcSpeedPercentage = () => {
      if (scrollAcceleration > 0) {
        return 2 + (Math.floor((scrollAcceleration * 100) / maxTreshold) / 100);
      } else {
        // Backwards Rotation should happen much slower,
        return 2 + (Math.ceil((scrollAcceleration * 100) / maxTreshold) / 100);
      }
    };

    const speedPercentage = calcSpeedPercentage();

    // Run
    this.dialsVelocity(false, speedPercentage, scrollAcceleration);

    // Time to get back to initialRotation
    let clearer = null;

    if (typeof clearer === 'function') {
      clearTimeout(clearer);
    } else {
      clearer = setTimeout(() => {
        this.dialsVelocity(true);
      }, 1000 + (speedPercentage * 1000 ));
    }

  }

  public dialsVelocity(
    initial: boolean = false,
    speedPercentage: number = 1,
    scrollAcceleration: number = 0) {

    const soundAcceleration = (accelfactor: number = 1) => {
      this.dialSoundShort.speed = 1 * accelfactor * 1.2; // This one needs to be a bit louder
      this.dialSoundLong.volume = 1 * accelfactor;
      this.dialSoundLong.speed = 1 * accelfactor;
      // this.dialSoundMultiple.volume = 1.5;
      // this.dialSoundMultiple.speed = 1.5;
    };

    soundAcceleration(speedPercentage);

    let i = 0;
    while (i <= 12) {

      const initialRotation = parseInt(
        this.animationLayersSettings['dial' + i].rotation.split('=')[1], 10
      );

      if (scrollAcceleration > 0 && !initial) {
        // Scrolling down, velocity exists
        this.animationLayersSettings['dial' + i].instance
          .updateTo({rotation: '+=' + initialRotation * speedPercentage});
      } else if (scrollAcceleration < 0 && !initial) {
        // Scrolling up, velocity exists
        this.animationLayersSettings['dial' + i].instance
          .updateTo({rotation: '-=' + initialRotation * Math.abs(speedPercentage)});
      } else if (initial) {
        // Reset to initial velocity
        this.animationLayersSettings['dial' + i].instance
          .updateTo({rotation: this.animationLayersSettings['dial' + i].rotation }, true);
        soundAcceleration();
      }

      i++;
    }
  }

  /*public fadeInScene(): Promise<{}> {
      console.log('mumu');
  }
  public fadeOutScene(): Promise<{}> {
    console.log('mumu');
  }*/

  public blurScene(scene: any): void {
    console.log('mumu');
  }
  public registerHandler(eventStr: any, id: any, fn: any): void {
    console.log('mumu');
  }
  public deregisterHandler(eventStr: any, id: any): void {
    console.log('mumu');
  }
  public stageClick(data: any): void {
    console.log('mumu');
  }
  public wipe(): void {
    console.log('mumu');
  }
  public unload(): void {
    console.log('mumu');
  }

  @HostListener('window:focus', ['$event'])
  private onFocus(event: any): void {
    if (ENV !== 'development') {
      TweenMax.resumeAll();
      this.renderer.pixi.app.ticker.start();
      if (this.enableSounds) {
        this.dialSoundShort.volume = 1;
        this.dialSoundLong.volume = 0.3;
        this.dialSoundMultiple.volume = 0.5;
      }
    }
  }

  @HostListener('window:blur', ['$event'])
  private onBlur(event: any): void {
    if (ENV !== 'development') {
      TweenMax.pauseAll();
      this.renderer.pixi.app.ticker.stop();
      if ( this.enableSounds ) {
        this.dialSoundShort.volume = 0;
        this.dialSoundLong.volume = 0;
        this.dialSoundMultiple.volume = 0;
      }
    }
  }

}
