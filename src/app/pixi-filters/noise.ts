import { Filter } from 'pixi.js';
import { shaderFragNoise } from '../../assets/PIXIfilters/noise.frag.js';

export class PIXINoiseFilter {
    private uniforms = {
        rand      : {type: '1f', value: 1.5},
        strength  : {type: '1f', value: 0.25},
        dimensions: {type: '4fv', value: [0, 0, 0, 0]}
    };

    get strength(): number {
        return this.uniforms.strength.value;
    }
    set strength(value: number) {
        this.uniforms.strength.value = value;
    }

    get rand(): number {
        return this.uniforms.rand.value;
    }
    set rand(value: number) {
        this.uniforms.rand.value = value;
    }

    constructor() {
        return new Filter('', shaderFragNoise, this.uniforms) as any;
    }
}

export default PIXINoiseFilter;
