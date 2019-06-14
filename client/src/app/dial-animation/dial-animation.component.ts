import {
  Component, ElementRef, EventEmitter, NgZone, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation
} from '@angular/core';

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

import * as _ from 'lodash';

@Component({
  selector: 'dial-animation',
  styleUrls: [ './dial-animation.component.scss' ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './dial-animation.component.html'
})

export class DialAnimationComponent implements OnInit, OnDestroy {

  @Output() public animComplete = new EventEmitter();
  @Output() public dialSpeed = new EventEmitter();

  @ViewChild('_d') public _d: ElementRef;

  public lottieConfig: {
    path: string,
    autoplay: boolean,
    loop: boolean
  };

  public styleConfig: {
    position: string,
    left: string,
    marginLeft: string,
    speed: number,
    lastDeltaY: number
  } = {
    position: 'absolute',
    left: '50%',
    marginLeft: '-250px',
    speed: 1,
    lastDeltaY: 0
  };

  public github = 'assets/svg/github.svg';
  public linkedin = 'assets/svg/likdicon.svg';

  private anim: any;
  private animationSpeed: number = 1;

  constructor(
    public ngZone: NgZone
  ) {

    this.lottieConfig = {
      path: 'assets/animations/dial.json',
      autoplay: false,
      loop: false
    };

  }

  public ngOnInit() {
    console.log('animation logo');
    console.log(this);
  }

  public ngOnDestroy() {
    this.anim.removeEventListener('complete');
  }

  public handleAnimationLoaded(anim: any) {

    this.anim = anim;

    // Initial Play, first segment, intro
    setTimeout(() => this.anim.playSegments([0, 50], true), 500);
    setTimeout(() => this.setDialSpeed(0.3), 5000);

    // When the initial play stops, start second segment and loop.
    this.anim.addEventListener('complete', (ev) => {
      // Emit animation complete ? Don't think we need that.

      if (this.anim.firstFrame === 0) {
        this.setDialInPlace();
        this.anim.playSegments([50, 89], true);
      } else if (this.anim.firstFrame === 50) {
        this.anim.loop = true;
        this.anim.playSegments([89, 141], true);
        this.setSpeedBasedOnScroll();
        this.animComplete.emit(true);
      }
    });
  }

  public setDialInPlace() {
    TweenLite.to(this.styleConfig, 1, {
      left: '-4%',
      yoyo: false,
      ease: Power4.easeInOut,
      onComplete: (event) => console.log('TweenLite has set dial in palce')
    });
    return true;
  }

  public setDialSpeed(speed) {

    const updateHandler = () => {
      this.anim.setSpeed(this.styleConfig.speed);
      this.dialSpeed.emit(this.styleConfig.speed);
    };

    const completeHandler = () => {
      this.styleConfig.speed = speed;
    };

    TweenLite.to(this.styleConfig, 1, {
      speed, onUpdate: updateHandler, ease: Sine.easeInOut, onComplete: completeHandler});
  }

  public setSpeedBasedOnScroll() {

    const modifySpeed = () => {
      // normalize the speed if we overcome the boundaries
      if (this.styleConfig.speed < -3.3) {
        this.setDialSpeed(-3.2);
        return false;
      }

      // normalize the speed if we overcome the boundaries
      if (this.styleConfig.speed > 3.3) {
        this.setDialSpeed(3.2);
        return false;
      }

      // increase or decrease based on scroll direction.
      if (this.styleConfig.lastDeltaY > 0) {
        this.setDialSpeed(this.styleConfig.speed + 1);
      } else {
        this.setDialSpeed(this.styleConfig.speed - 1);
      }
    };

    const throttled = _.throttle(modifySpeed, 1000, { 'trailing': false });

    this.ngZone.runOutsideAngular(() => {

      const scrollOnCanvas = (event) => {
        // Register scroll direction
        this.styleConfig.lastDeltaY = event.deltaY;

        // If we scroll over the dial, modify the speed
        if (event.target.parentNode.
            parentNode.parentNode.parentNode.
            parentNode.parentNode.parentNode.id === 'main-dial-animation') {
          throttled();
        }
      };

      document.addEventListener('mousewheel', scrollOnCanvas, false);
    });
  }

  public stop() {
    this.anim.stop();
  }

  public play() {
    this.anim.play();
  }

  public pause() {
    this.anim.pause();
  }

  public setSpeed(speed: number) {
    this.animationSpeed = speed;
    this.anim.setSpeed(speed);
  }
}
