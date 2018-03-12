import {
  Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'logo-animation',
  styleUrls: [ './logo-animation.component.scss' ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './logo-animation.component.html'
})

export class LoadingAnimationComponent implements OnInit, OnDestroy {

  @Output() public animComplete = new EventEmitter();

  public lottieConfig: {};
  private anim: any;
  private animationSpeed: number = 1;

  constructor() {

    this.lottieConfig = {
      path: 'assets/animations/logo.json',
      autoplay: false,
      loop: false
    };

  }

  public ngOnInit() {
    console.log('animation logo');
  }

  public ngOnDestroy() {
    this.anim.removeEventListener('complete');
  }

  public handleAnimation(anim: any) {
    this.anim = anim;
    this.anim.addEventListener('complete', (ev) => this.animComplete.emit(true));
    setTimeout(() => this.anim.play(), 1000);
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
