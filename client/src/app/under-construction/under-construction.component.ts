import {
  Component, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'under-construction',
  styleUrls: [ './under-construction.component.scss' ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './under-construction.component.html'
})

export class UnderConstructionComponent implements OnInit, OnDestroy, OnChanges {

  @Input() public animationSpeed: number = 0.5;

  public lottieConfig: {};

  private anim: any;

  constructor() {

    this.lottieConfig = {
      path: 'assets/animations/incomprehension.json',
      autoplay: false,
      loop: true
    };

  }

  public ngOnInit() {
    console.log('under construction animation', this);
    setTimeout(() => this.anim.play(), 2500);
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.animationSpeed.currentValue !== 0) {
      // console.log('Animation speed changed to', changes.animationSpeed.currentValue);
      this.anim.setSpeed(changes.animationSpeed.currentValue);

    }
  }

  public ngOnDestroy() {
    // this.anim.removeEventListener('complete');
  }

  public handleAnimation(anim: any) {
    this.anim = anim;
    this.anim.setSpeed(0.5);
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
