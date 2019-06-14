import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as PIXI from 'pixi.js';
import { PixiService } from 'ngxpixi';



@Component({
  selector: 'app-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.sass']
})
export class EnvironmentComponent implements OnInit {
  @Input() public speed: number;
  @ViewChild('pixiBackground', {static: false}) bgContainerRef: ElementRef;

  public mainStage: PIXI.Container;

  constructor(
    public pixi: PixiService,
  ) {
  }

  ngOnInit() {
    this.pixi.init(
      500,
      500,
      this.bgContainerRef.nativeElement
    );
  }

}
