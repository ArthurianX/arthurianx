import { ElementRef } from '@angular/core';

export class TerrainGenerator {
    public pos: number[];

    constructor(canvasRef: ElementRef, width, height, amp = 128, wl = 128, octaves = 4) {
        const canvasContext = canvasRef.nativeElement.getContext('2d');
        canvasRef.nativeElement.width = width;
        canvasRef.nativeElement.height = height;
        const perlinPoints = this.combineNoise(this.generateNoise(amp, wl, octaves, 2, width));
        TerrainGenerator.drawLine(perlinPoints, canvasContext, width, height);

        // The service draws on the canvas, and it also outputs all the perlin points.
        return perlinPoints as any;
    }

    // linear congruential generator parameters
    private M = 4294967296;
    private A = 1664525;
    private C = 1;
    private Z: number;
    // perlin line plotting
    public static drawLine(L, canvasContext, width, height) {
        const drawABitOutOfBounds = (i, points) => {
            if (i === 0) {
                return -1;
            } else if (i === points.pos.length -1) {
                return i + 1;
            } else {
                return i;
            }
        }
        canvasContext.clearRect(0, 0, width, height);
        canvasContext.save();
        // Note: move a bit out of bounds (-1 in each direction) to make the tile perfect
        canvasContext.moveTo(-1, height / 2);
        canvasContext.beginPath();
        for (let i = 0; i < L.pos.length; i++) {
            canvasContext.lineTo(drawABitOutOfBounds(i, L), height / 2 + L.pos[i]);
        }
        canvasContext.lineTo(width + 1, height + 1);
        canvasContext.lineTo(-1, height + 1);
        canvasContext.fillStyle = "#FFFFFF";
        canvasContext.closePath();
        canvasContext.fill();
    }

    // psuedo-random number generator (linear congruential)
    private next() {
        this.Z = (this.A * this.Z + this.C) % this.M;
        return this.Z / this.M - 0.5;
    }

    // cosine interpolation
    private interpolate(pa, pb, px) {
        const ft = px * Math.PI;
        const f = (1 - Math.cos(ft)) * 0.5;
        return pa * (1 - f) + pb * f;
    }

    // 1D perlin line generator
    private perlin(amp, wl, width) {
        let x = 0;
        const fq = 1 / wl;
        // const psng = new this.PSNG();
        // let a = psng.next();
        // let b = psng.next();
        this.Z = Math.floor(Math.random() * this.M);
        let a = this.next();
        let b = this.next();
        const pos = [];
        while (x < width) {
            if (x % wl === 0) {
                a = b;
                b = this.next();
                pos.push(a * amp);
            } else {
                pos.push(this.interpolate(a, b, (x % wl) / wl) * amp);
            }
            x++;
        }
        return pos;
    }

    // octave generator
    private generateNoise(amp, wl, octaves, divisor, width) {
        const result = [];
        for (let i = 0; i < octaves; i++) {
            result.push(this.perlin(amp, wl, width));
            amp /= divisor;
            wl /= divisor;
        }
        return result;
    }

    // combines octaves together
    private combineNoise(pl) {
        const result = {pos: []};
        for (let i = 0, total = 0, j = 0; i < pl[0].length; i++) {
            total = 0;
            for (j = 0; j < pl.length; j++) {
                total += pl[j][i];
            }
            result.pos.push(total);
        }
        return result;
    }

}
