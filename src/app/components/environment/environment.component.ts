import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import * as PIXI from 'pixi.js';
import { PixiService } from 'ngxpixi';



@Component({
  selector: 'app-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.sass']
})
export class EnvironmentComponent implements AfterViewInit {
  @Input() public speed: number;
  @ViewChild('pixiBackground', {static: false}) bgContainerRef: ElementRef;

  public pixiApp: any;

  private innerWidth: number;
  private innerHeight: number;

  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    console.log('this.pixiApp', this.pixiApp);
  }

  constructor(
    public pixi: PixiService
  ) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  ngAfterViewInit() {
    this.pixiApp = this.pixi.init(
      this.innerWidth,
      this.innerHeight,
      this.bgContainerRef.nativeElement,
      true,
      window
    );
  }

}
