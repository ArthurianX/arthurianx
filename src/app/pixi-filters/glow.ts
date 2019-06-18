import { Filter } from 'pixi.js';
import { shaderFragGlow } from '../../assets/PIXIfilters/glow.frag.js';

export class PIXIGlowFilter {
    private uniforms = {
        blur_w: {type: '1i', value: 8},
        dimensions: {type: '4fv', value: [0, 0, 0, 0]}
    };

    get blur(): number {
        return this.uniforms.blur_w.value;
    }
    set blur(blurValue: number) {
        this.uniforms.blur_w.value = blurValue;
    }

    constructor() {
        const vertexShader = `
        attribute vec2 aVertexPosition;

        uniform mat3 projectionMatrix;

        varying vec2 vTextureCoord;

        uniform vec4 inputSize;
        uniform vec4 outputFrame;

        vec4 filterVertexPosition( void )
        {
            vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

            return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
        }

        vec2 filterTextureCoord( void )
        {
            return aVertexPosition * (outputFrame.zw * inputSize.zw);
        }

        void main(void)
        {
            gl_Position = filterVertexPosition();
            vTextureCoord = filterTextureCoord();
        }
        `;
        return new Filter(vertexShader, shaderFragGlow) as any;
    }
}

export default PIXIGlowFilter;
