import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { TerrainGenerator } from '../../services/terrain-generator';
import { TerrainGen } from '../../interfaces/environment.interface';
import { Sprite } from 'pixi.js';

@Component({
  selector: 'app-terrain-creator',
  template: `
    <canvas #terrain id="#terrain"></canvas>
    <app-terrain-creator
        *ngIf="perlinPoints"
        [drawPoints]="perlinPoints"
        [terrainSettings]="terrainSettings"
        (generatedTerrain)="perlinGeneratedCanvas($event)"
    ></app-terrain-creator>
  `,
  styles: ['canvas { opacity: 0; overflow: hidden; pointer-events: none }'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class TerrainCreatorComponent implements OnInit {

  @Input() public terrainSettings: TerrainGen;
  @Input() public drawPoints: {pos: number[]};
  @Output() public generatedTerrain: EventEmitter<PIXI.Sprite> = new EventEmitter();
  @Output() public generatedMultiTerrain: EventEmitter<PIXI.Sprite[]> = new EventEmitter();

  public perlinPoints: {pos: number[]};

  @ViewChild('terrain', {static: true}) terrainContainerRef: ElementRef;

  constructor() {}

  ngOnInit(): void {

    // NOTE: Generate the first noise on canvas, and save the generated Perlin Points to a constant
    if (!this.drawPoints) {
      this.perlinPoints = new TerrainGenerator(
          this.terrainContainerRef,
          this.terrainSettings.width,
          this.terrainSettings.height,
          this.terrainSettings.amplitude ? this.terrainSettings.amplitude : undefined,
          this.terrainSettings.wavelength ? this.terrainSettings.wavelength : undefined,
          this.terrainSettings.octaves ? this.terrainSettings.octaves : undefined,
      );
    } else {
      this.terrainContainerRef.nativeElement.width = this.terrainSettings.width;
      this.terrainContainerRef.nativeElement.height = this.terrainSettings.height;
      TerrainGenerator.drawLine(
          {pos: this.drawPoints.pos.reverse()},
          this.terrainContainerRef.nativeElement.getContext('2d'),
          this.terrainSettings.width,
          this.terrainSettings.height,
      );
      const tSprite = new Sprite(PIXI.Texture.from(this.terrainContainerRef.nativeElement,
          { width: this.terrainSettings.width, height: this.terrainSettings.height}
      ));
      this.generatedTerrain.emit(tSprite);
    }

  }

  public perlinGeneratedCanvas($event: PIXI.Sprite) {
    const tSprite = new Sprite(PIXI.Texture.from(this.terrainContainerRef.nativeElement,
        { width: this.terrainSettings.width, height: this.terrainSettings.height}
    ));
    this.generatedMultiTerrain.emit([tSprite, $event]);
  }

  public isCanvasBlank(canvas) {
    const context = canvas.getContext('2d');

    const pixelBuffer = new Uint32Array(
        context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );

    return !pixelBuffer.some(color => color !== 0);
  }
}
