import {
  Component, ElementRef, NgZone, OnDestroy,
  OnInit, ViewChild, ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'rotating-dial',
  styleUrls: [ './rotating-dial.component.scss' ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './rotating-dial.component.html'
})

export class RotatingDialComponent implements OnInit, OnDestroy {
  public w = 1200;
  public h = 1200;
  public dialScene: any;

  // private eventOptions: boolean|{capture?: boolean, passive?: boolean};

  @ViewChild('_r', {static: false}) public _r: ElementRef;

  constructor(
    public ngZone: NgZone
  ) {}

  public ngOnInit() {

    /*if (passiveSupported() as any) { // use the implementation on mozilla
      this.eventOptions = {
        capture: true,
        passive: true
      };
    } else {
      this.eventOptions = true;
    }
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.scroll, this.eventOptions as any);
    });*/
  }

  public ngOnDestroy() {
    // window.removeEventListener('scroll', this.scroll, this.eventOptions as any);
    // unfortunately the compiler doesn't know yet about this object, so cast to any
  }

  /*public scroll = (): void => {
    console.log('scroll');

    /!*if (somethingMajorHasHappenedTimeToTellAngular) {
      this.ngZone.run(() => {
        this.tellAngular();
      });
    }*!/
  }*/

  public homeSceneReady(scene) {
    console.log(scene);
    this.dialScene = scene;
  }
}
