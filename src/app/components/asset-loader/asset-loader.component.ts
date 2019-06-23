import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation
} from '@angular/core';

import 'pixi-spine';
import { Loader } from 'pixi.js';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'asset-loader',
  styleUrls: [ './asset-loader.component.scss' ],
  templateUrl: './asset-loader.component.html'
})

export class AssetLoaderComponent implements OnDestroy {

  @Output() public animComplete = new EventEmitter();
  @Output() public loadingComplete: EventEmitter<any[]> = new EventEmitter();
  @Input() public loader: Loader;

  public lottieConfig: {};
  public loadingFinished = false;
  private anim: any;
  private loadingPercentage: number;

  constructor() {

    this.lottieConfig = {
      path: 'assets/animations/checkmark.json',
      autoplay: false,
      loop: false
    };

  }

  public ngOnDestroy() {
    this.anim.removeEventListener('complete');
  }

  public startLoading() {
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
          this.playAnimation(Math.floor(inst.progress));
          this.loadingPercentage = Math.floor(inst.progress);
          // console.log('this.loadingPercentage', Math.floor(inst.progress));
        })
        .load(this.loaderComplete.bind(this));
  }

  public loaderComplete(loader, res) {
    this.loadingComplete.emit(res);
    // this.anim.setSpeed(1);
  }

  public handleAnimation(anim: any) {
    this.anim = anim;
    this.anim.addEventListener('complete', (ev) => {
      console.log('complete');
      this.loadingFinished = true;
      // Init destruction
    });
    this.startLoading();
  }

  private playAnimation(percent: number) {
    // 16 is 100%
    // x is percent param
    this.anim.goToAndStop(Math.ceil((16 * percent) / 100), true);
    if (percent === 100) {
      // Play until the end
      this.anim.play();
    }
  }
}
