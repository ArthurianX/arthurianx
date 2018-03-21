import { Injectable } from '@angular/core';
import * as THREE from 'three';

import './EnableThreeExamples.js';
import 'three/examples/js/postprocessing/EffectComposer';
import 'three/examples/js/postprocessing/BloomPass';
import 'three/examples/js/postprocessing/RenderPass';
import 'three/examples/js/postprocessing/ShaderPass';
import 'three/examples/js/shaders/BleachBypassShader';
import 'three/examples/js/shaders/HorizontalTiltShiftShader';
import 'three/examples/js/shaders/VerticalTiltShiftShader';

@Injectable()
export class ComposeRenderer {

  constructor() {}

  public compose(renderer, scene, camera, SCREEN_WIDTH, SCREEN_HEIGHT) {
    // COMPOSER
    renderer.autoClear = false;

    const renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat, stencilBufer: false };
    const renderTarget = new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters );

    const effectBloom = new THREE.BloomPass( 0.6 );
    const effectBleach = new THREE.ShaderPass( THREE.BleachBypassShader );

    const hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
    const vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );

    const bluriness = 6;

    hblur.uniforms[ 'h' ].value = bluriness / SCREEN_WIDTH;
    vblur.uniforms[ 'v' ].value = bluriness / SCREEN_HEIGHT;

    hblur.uniforms[ 'r' ].value = vblur.uniforms[ 'r' ].value = 0.5;

    effectBleach.uniforms[ 'opacity' ].value = 0.65;

    const composer = new THREE.EffectComposer( renderer, renderTarget );

    const renderModel = new THREE.RenderPass( scene, camera );

    vblur.renderToScreen = true;

    // composer = new THREE.EffectComposer( renderer, renderTarget );

    composer.addPass( renderModel );

    composer.addPass( effectBloom );

    //composer.addPass( effectBleach );

    composer.addPass( hblur );
    composer.addPass( vblur );

    return composer;
  }

}
