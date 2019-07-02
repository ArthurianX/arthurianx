import {
  AfterViewInit,
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

export class AssetLoaderComponent implements OnInit, OnDestroy {

  @Output() public animComplete = new EventEmitter();
  @Output() public loadingComplete: EventEmitter<any[]> = new EventEmitter();
  @Input() public fileList: any[];
  @Input() public delayedStart = false;

  public loader: Loader;
  public lottieConfig: {};
  public loadingFinished = false;
  private anim: any;
  private loadingPercentage: number;

  constructor() {
    this.loader = new PIXI.Loader();
    this.lottieConfig = {
      path: 'assets/animations/circle_loading.json',
      autoplay: false,
      loop: false
    };
  }

  public ngOnInit(): void {
    this.fileList.map( (file) => {
      console.log('loader add', file[0], file[1]);
      this.loader.add(file[0], file[1]);
    });
  }

  public ngOnDestroy() {
    this.anim.removeEventListener('complete');
    this.loader.reset();
  }

  public startLoading() {
    if ((this.loader as any)._afterMiddleware.indexOf(PIXI.spine.AtlasParser.use) < 0) {
      console.log('Atlas Parser not present');
      this.loader.use(PIXI.spine.AtlasParser.use);
    }

    this.loader
        .on('progress', (inst) => {
          this.playAnimation(Math.floor(inst.progress));
          this.loadingPercentage = Math.floor(inst.progress);
          // console.log('this.loadingPercentage', Math.floor(inst.progress));
        })
        .load(this.loaderComplete.bind(this));
  }

  public loaderComplete(loader, res) {
    this.loadingComplete.emit(res);
    this.loader.reset();
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
    this.anim.goToAndStop(Math.ceil((120 * percent) / 100), true);
    if (percent === 100) {
      // Play until the end
      this.anim.play();
    }
  }
}
