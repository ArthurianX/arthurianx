import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TerrainGenerator } from '../../services/terrain-generator';
import { StreamingTerrainGenerator } from '../../services/streaming-terrain-generator';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.sass']
})
export class PlayComponent implements OnInit {
  @ViewChild('noiseBackground', {static: true}) noiseBackgroundRef: ElementRef;
  constructor() { }

  ngOnInit() {
    //  Demo Stuff, turn this off and enable dial when done.
    this.noiseBackgroundRef.nativeElement.width = window.innerWidth;
    this.noiseBackgroundRef.nativeElement.height = window.innerHeight;

    // NOTE: FIRST TERRAIN GENERATOR
    const terrain = new TerrainGenerator(this.noiseBackgroundRef, window.innerWidth, window.innerHeight);

    // Reverse the draw for the mirror tile.
    // terrain.pos.reverse();
    // setTimeout(() => {
    //   TerrainGenerator.drawLine(terrain, this.noiseBackgroundRef.nativeElement.getContext('2d') , window.innerWidth, window.innerHeight, true);
    // }, 4000);
    // NOTE: STREAMING TERRAIN GENERATOR
    // this.streamingTerrainGenerator();

  }

  public streamingTerrainGenerator() {
    const canvas = this.noiseBackgroundRef.nativeElement
    const ctx = canvas.getContext('2d');
    const noise = new StreamingTerrainGenerator();

    const h2 = canvas.height / 2;
    const w = canvas.width;
    const vals = Array.from({ length: w }, (_, i) => h2 * noise.getValue(i * 0.03));

    ctx.fillStyle = "#ffffff";

    let i = vals.length;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      vals.shift();
      vals.push(h2 * noise.getValue(i++ * 0.03));

      for (let i = 0; i < vals.length; i++) {
        ctx.fillRect(i, h2 + vals[i], 1, 1);
      }

      requestAnimationFrame(render);
    };

    render();
  }


}
