import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { TerrainGenerator } from '../../services/terrain-generator';
import { TerrainGen } from '../../interfaces/environment.interface';
import { Sprite } from 'pixi.js';

@Component({
  selector: 'app-terrain-creator',
  template: `<canvas #terrain id="#terrain"></canvas>`,
  styles: ['canvas { opacity: 0; overflow: hidden; pointer-events: none }'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class TerrainCreatorComponent implements OnInit {

  @Input() public terrainSettings: TerrainGen;
  @Output() public generatedTerrain: EventEmitter<PIXI.Sprite> = new EventEmitter();

  @ViewChild('terrain', {static: true}) terrainContainerRef: ElementRef;

  constructor() {}

  ngOnInit(): void {

    // NOTE: Generate the first noise on canvas, and save the generated Perlin Points to a constant
    const perlinPoints = new TerrainGenerator(
        this.terrainContainerRef,
        this.terrainSettings.width,
        this.terrainSettings.height,
        this.terrainSettings.amplitude ? this.terrainSettings.amplitude : undefined,
        this.terrainSettings.wavelength ? this.terrainSettings.wavelength : undefined,
        this.terrainSettings.octaves ? this.terrainSettings.octaves : undefined,
    );

    const tSprite = new Sprite(PIXI.Texture.from(this.terrainContainerRef.nativeElement,
        { width: this.terrainSettings.width, height: this.terrainSettings.height}
        ));
    this.generatedTerrain.emit(tSprite);
  }


}
