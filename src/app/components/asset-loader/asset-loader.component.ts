import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation
} from '@angular/core';

import 'pixi-spine';
import { Loader } from 'pixi.js';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'asset-loader',
  styleUrls: [ './asset-loader.component.scss' ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './asset-loader.component.html'
})

export class AssetLoaderComponent implements OnInit, OnDestroy {

  @Output() public animComplete = new EventEmitter();
  @Output() public loadingComplete: EventEmitter<any[]> = new EventEmitter();
  @Input() public loader: Loader;

  public lottieConfig: {};
  private anim: any;
  private animationSpeed = 1;
  private loadingPercentage: number;
  private loading: boolean;

  constructor() {

    this.lottieConfig = {
      path: 'assets/animations/progress-bar.json',
      autoplay: false,
      loop: false
    };

  }

  public ngOnInit() {
    if ((this.loader as any)._afterMiddleware.indexOf(PIXI.spine.AtlasParser.use) < 0) {
      console.log('Atlas Parser not present');
      this.loader.use(PIXI.spine.AtlasParser.use);
    }

    this.loader
        .add('pixie', 'assets/demo-story/pixie/pixie.json')
        .add('months', 'assets/months/months.png')
        // good stuff below
        .add('sky1', 'assets/story/sky/sky1.jpg')
        .add('sky2', 'assets/story/sky/sky2.jpg')
        .add('sky3', 'assets/story/sky/sky3.jpg')
        .add('sky4', 'assets/story/sky/sky4.jpg')
        .add('sky5', 'assets/story/sky/sky5.jpg')
        .add('sun', 'assets/story/sky/sun.png')
        .add('sun1', 'assets/story/sky/sun.png')
        .add('displacement_map', 'assets/story/soil/displacement_map_repeat.jpg')
        .add('ground', 'assets/story/soil/soil-tile.png')
        .on('progress', (inst) => {
          this.loadingPercentage = Math.floor(inst.progress);
          this.loading = inst.loading;
          console.log('this.loadingPercentage', this.loadingPercentage);
        })
        .load(this.loaderComplete.bind(this));
  }

  public ngOnDestroy() {
    this.anim.removeEventListener('complete');
  }

  public loaderComplete(loader, res) {
    this.loadingComplete.emit(res);
    this.anim.setSpeed(1);
  }

  public handleAnimation(anim: any) {
    this.anim = anim;
    this.anim.addEventListener('loopComplete', (ev) => this.animComplete.emit(true));
    this.playAnimation(anim);
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

  private playAnimation(anim: any) {
    console.log('anim', anim);
    anim.setSpeed(0.1);
    anim.play();
    // anim.goToAndPlay(100, true);
    // anim.playSegments([0, 10], [0, 0]);

  }
}
