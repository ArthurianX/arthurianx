import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TerrainGenerator } from '../../services/terrain-generator';
import { StreamingTerrainGenerator } from '../../services/streaming-terrain-generator';

@Component({
    selector: 'app-play',
    templateUrl: './play.component.html',
    styleUrls: ['./play.component.sass']
})
export class PlayComponent implements OnInit {
    loader: PIXI.Loader = PIXI.Loader.shared;
    public filesToLoad = [
        ['pixie', 'assets/demo-story/pixie/pixie.json'],
        ['months', 'assets/months/months.png'],
        ['sky1', 'assets/story/sky/sky1.jpg'],
        ['sky2', 'assets/story/sky/sky2.jpg'],
        ['sky3', 'assets/story/sky/sky3.jpg'],
        ['sky4', 'assets/story/sky/sky4.jpg'],
        ['sky5', 'assets/story/sky/sky5.jpg'],
        ['sun', 'assets/story/sky/sun.png'],
        ['sun1', 'assets/story/sky/sun.png'],
        ['displacement_map', 'assets/story/soil/displacement_map_repeat.jpg'],
        ['ground', 'assets/story/soil/soil-tile.png']
    ];
    @ViewChild('noiseBackground', {static: true}) noiseBackgroundRef: ElementRef;
    file: any;
    spriteIndex: any;

    constructor() {
    }

    ngOnInit() {
        //  Demo Stuff, turn this off and enable dial when done.
        // this.noiseBackgroundRef.nativeElement.width = window.innerWidth;
        // this.noiseBackgroundRef.nativeElement.height = window.innerHeight;

        // NOTE: FIRST TERRAIN GENERATOR
        // const terrain = new TerrainGenerator(this.noiseBackgroundRef, window.innerWidth, window.innerHeight);

        // Reverse the draw for the mirror tile.
        // terrain.pos.reverse();
        // setTimeout(() => {
        //   TerrainGenerator.drawLine(terrain, this.noiseBackgroundRef.nativeElement.getContext('2d') , window.innerWidth, window.innerHeight, true);
        // }, 4000);
        // NOTE: STREAMING TERRAIN GENERATOR
        // this.streamingTerrainGenerator();

    }

    public streamingTerrainGenerator() {
        const canvas = this.noiseBackgroundRef.nativeElement;
        const ctx = canvas.getContext('2d');
        const noise = new StreamingTerrainGenerator();

        const h2 = canvas.height / 2;
        const w = canvas.width;
        const vals = Array.from({length: w}, (_, i) => h2 * noise.getValue(i * 0.03));

        ctx.fillStyle = '#ffffff';

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


    loaderDone($event: any[]) {
        console.log('loader done', $event);
    }

    receiveTicker($event) {

    }

    buttonClicked(home: string) {

    }

    receiveSpriteInstance($event) {

    }
}
