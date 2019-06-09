import {
  Component, NgZone, OnInit
} from '@angular/core';

import * as THREE from 'three';

import { AppState } from '../app.service';
import { Title } from './title';
import { XLargeDirective } from './x-large';
import { CalendarConnector } from './home.service';

// import { ComposeRenderer } from './extras/extras.postprocessing.service';

// import { vertexShader, fragmentShaderNoise } from './home.constants';

@Component({
  /**
   * The selector is what angular internally uses
   * for `document.querySelectorAll(selector)` in our index.html
   * where, in this case, selector is the string 'home'.
   */
  selector: 'home',  // <home></home>
  /**
   * We need to tell Angular's Dependency Injection which providers are in our app.
   */
  providers: [
    Title, CalendarConnector, /* ComposeRenderer */
  ],
  /**
   * Our list of styles in our component. We may add more to compose many styles together.
   */
  styleUrls: [ './home.component.scss' ],
  /**
   * Every Angular template is first compiled by the browser before Angular runs it's compiler.
   */
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  /**
   * Set our default values
   */
  public localState = { value: '' };
  /**
   * TypeScript public modifiers
   */

  public lottieConfig: {};
  public sceneFog: THREE.Fog = new THREE.Fog(0x050505, 1, 1000);
  public mainScene: any = {};

  // Animation loop parts
  public clock = new THREE.Clock();
  public locationMovement: any = {
    z: [-10, -5, 0, 5, 10],
    x: [0, 5, 10, 15, 20]
  };

  constructor(
    public appState: AppState,
    public title: Title,
    public ngZone: NgZone,
    public calendar: CalendarConnector,
    // public vertexShader: vertexShader,
    // public fragmentShaderNoise: fragmentShaderNoise,
    // public composeRenderer: ComposeRenderer
) {

    calendar.getEvents().subscribe( (result) => {
      console.log('calendar event', result);
    });

    // console.log('this.composeRenderer', this.composeRenderer);

  }

  public ngOnInit() {
    /**
     * this.title.getData().subscribe(data => this.data = data);
     */

    // this.initialSceneSettings();

    /*this.ngZone.runOutsideAngular(() => {

      this.hookDetector();
      this.hookAnimationFrame();

    });*/
  }

  public initialSceneSettings() {

    // Set Scene Fog
    // TODO: This adds to scene inside the scene directive, make it different
    this.sceneFog = new THREE.Fog( 0x050505, 2000, 4000 );
    this.sceneFog.color.setHSL( 0.102, 0.9, 0.825 );
  }

  // TODO: This is getting the scene, from the scene component, make it different
  public getMainScene(scene) {
    console.log('got the scene, start doing stuff', scene);
    this.mainScene = scene;
    this.addStuffToScene();
    this.animate();
  }

  public getShaderScene(scene) {
    // console.log()
  }

  public getHeightMapScene(scene) {

  }

  public getNormalMapScene(scene) {

  }

  public addStuffToScene() {
    this.addAltTerrain();
    // this.addComplexTerrain();
  }

  public addAltTerrain() {

    // Generate a terrain
    const xS = 63;
    const yS = 63;
    const terrainScene = THREE.Terrain({
      easing: THREE.Terrain.Linear,
      frequency: 2.5,
      heightmap: THREE.Terrain.DiamondSquare,
      material: new THREE.MeshBasicMaterial({color: 0x5566aa}),
      maxHeight: 50,
      minHeight: -50,
      steps: 1,
      useBufferGeometry: false,
      xSegments: xS,
      xSize: 1024,
      ySegments: yS,
      ySize: 1024,
    });
    // Assuming you already have your global scene, add the terrain to it
    this.mainScene.add(terrainScene);

    /*
    // Optional:
    // Get the geometry of the terrain across which you want to scatter meshes
    const geo = terrainScene.children[0].geometry;
    // Add randomly distributed foliage
    const decoScene = THREE.Terrain.ScatterMeshes(geo, {
      mesh: new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6)),
      w: xS,
      h: yS,
      spread: 0.02,
      randomness: Math.random,
    });
    terrainScene.add(decoScene);  */

  }

  public addComplexTerrain() {

    const mlib = [];

    const normalShader = THREE.ShaderExtras[ 'normalmap' ];

    const rx = 256;
    const ry = 256;
    const pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };

    const heightMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
    const normalMap = new THREE.WebGLRenderTarget( rx, ry, pars );

    const uniformsNormal = THREE.UniformsUtils.clone( normalShader.uniforms );

    uniformsNormal.height.value = 0.05;
    uniformsNormal.resolution.value.set( rx, ry );
    uniformsNormal.heightMap.texture = heightMap;

    const specularMap = new THREE.WebGLRenderTarget( 2048, 2048, pars );

    const diffuseTexture1 = THREE.ImageUtils.loadTexture( 'textures/terrain/grasslight-big.jpg', null, function () {

      loadTextures();
      applyShader( THREE.ShaderExtras[ 'luminosity' ], diffuseTexture1, specularMap );

    } );

    const diffuseTexture2 = THREE.ImageUtils.loadTexture( 'textures/terrain/backgrounddetailed6.jpg', null, loadTextures );
    const detailTexture = THREE.ImageUtils.loadTexture( 'textures/terrain/grasslight-big-nm.jpg', null, loadTextures );

    diffuseTexture1.wrapS = diffuseTexture1.wrapT = THREE.RepeatWrapping;
    diffuseTexture2.wrapS = diffuseTexture2.wrapT = THREE.RepeatWrapping;
    detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
    specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;

    const vertexShader = `
      varying vec2 vUv;
			uniform vec2 scale;
			uniform vec2 offset;

			void main( void ) {

				vUv = uv * scale + offset;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			}`;

    const fragmentShaderNoise: string = `
      //
			// Description : Array and textureless GLSL 3D simplex noise function.
			//      Author : Ian McEwan, Ashima Arts.
			//  Maintainer : ijm
			//     Lastmod : 20110409 (stegu)
			//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
			//               Distributed under the MIT License. See LICENSE file.
			//

			uniform float time;
			varying vec2 vUv;

			vec4 permute( vec4 x ) {

				return mod( ( ( x * 34.0 ) + 1.0 ) * x, 289.0 );

			}

			vec4 taylorInvSqrt( vec4 r ) {

				return 1.79284291400159 - 0.85373472095314 * r;

			}

			float snoise( vec3 v ) {

				const vec2 C = vec2( 1.0 / 6.0, 1.0 / 3.0 );
				const vec4 D = vec4( 0.0, 0.5, 1.0, 2.0 );

				// First corner

				vec3 i  = floor( v + dot( v, C.yyy ) );
				vec3 x0 = v - i + dot( i, C.xxx );

				// Other corners

				vec3 g = step( x0.yzx, x0.xyz );
				vec3 l = 1.0 - g;
				vec3 i1 = min( g.xyz, l.zxy );
				vec3 i2 = max( g.xyz, l.zxy );

				vec3 x1 = x0 - i1 + 1.0 * C.xxx;
				vec3 x2 = x0 - i2 + 2.0 * C.xxx;
				vec3 x3 = x0 - 1. + 3.0 * C.xxx;

				// Permutations

				i = mod( i, 289.0 );
				vec4 p = permute( permute( permute(
						 i.z + vec4( 0.0, i1.z, i2.z, 1.0 ) )
					   + i.y + vec4( 0.0, i1.y, i2.y, 1.0 ) )
					   + i.x + vec4( 0.0, i1.x, i2.x, 1.0 ) );

				// Gradients
				// ( N*N points uniformly over a square, mapped onto an octahedron.)

				float n_ = 1.0 / 7.0; // N=7

				vec3 ns = n_ * D.wyz - D.xzx;

				vec4 j = p - 49.0 * floor( p * ns.z *ns.z );  //  mod(p,N*N)

				vec4 x_ = floor( j * ns.z );
				vec4 y_ = floor( j - 7.0 * x_ );    // mod(j,N)

				vec4 x = x_ *ns.x + ns.yyyy;
				vec4 y = y_ *ns.x + ns.yyyy;
				vec4 h = 1.0 - abs( x ) - abs( y );

				vec4 b0 = vec4( x.xy, y.xy );
				vec4 b1 = vec4( x.zw, y.zw );


				vec4 s0 = floor( b0 ) * 2.0 + 1.0;
				vec4 s1 = floor( b1 ) * 2.0 + 1.0;
				vec4 sh = -step( h, vec4( 0.0 ) );

				vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
				vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

				vec3 p0 = vec3( a0.xy, h.x );
				vec3 p1 = vec3( a0.zw, h.y );
				vec3 p2 = vec3( a1.xy, h.z );
				vec3 p3 = vec3( a1.zw, h.w );

				// Normalise gradients

				vec4 norm = taylorInvSqrt( vec4( dot( p0, p0 ), dot( p1, p1 ), dot( p2, p2 ), dot( p3, p3 ) ) );
				p0 *= norm.x;
				p1 *= norm.y;
				p2 *= norm.z;
				p3 *= norm.w;

				// Mix final noise value

				vec4 m = max( 0.6 - vec4( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ), dot( x3, x3 ) ), 0.0 );
				m = m * m;
				return 42.0 * dot( m*m, vec4( dot( p0, x0 ), dot( p1, x1 ),
											  dot( p2, x2 ), dot( p3, x3 ) ) );

			}

			float surface3( vec3 coord ) {

				float n = 0.0;

				n += 1.0 * abs( snoise( coord ) );
				n += 0.5 * abs( snoise( coord * 2.0 ) );
				n += 0.25 * abs( snoise( coord * 4.0 ) );
				n += 0.125 * abs( snoise( coord * 8.0 ) );

				return n;

			}

			void main( void ) {

				vec3 coord = vec3( vUv, -time );
				float n = surface3( coord );

				gl_FragColor = vec4( vec3( n, n, n ), 1.0 );

			}
  `;

    const uniformsNoise = {

      time:   { type: 'f', value: 1.0 },
      scale:  { type: 'v2', value: new THREE.Vector2( 1.5, 1.5 ) },
      offset: { type: 'v2', value: new THREE.Vector2( 0, 0 ) }

    };

    // TERRAIN SHADER

    const terrainShader = THREE.ShaderTerrain[ 'terrain' ];

    const uniformsTerrain = THREE.UniformsUtils.clone( terrainShader.uniforms );

    uniformsTerrain[ 'tNormal' ].texture = normalMap;
    uniformsTerrain[ 'uNormalScale' ].value = 3.5;

    uniformsTerrain[ 'tDisplacement' ].texture = heightMap;

    uniformsTerrain[ 'tDiffuse1' ].texture = diffuseTexture1;
    uniformsTerrain[ 'tDiffuse2' ].texture = diffuseTexture2;
    uniformsTerrain[ 'tSpecular' ].texture = specularMap;
    uniformsTerrain[ 'tDetail' ].texture = detailTexture;

    uniformsTerrain[ 'enableDiffuse1' ].value = true;
    uniformsTerrain[ 'enableDiffuse2' ].value = true;
    uniformsTerrain[ 'enableSpecular' ].value = true;

    uniformsTerrain[ 'uDiffuseColor' ].value.setHex( 0xffffff );
    uniformsTerrain[ 'uSpecularColor' ].value.setHex( 0xffffff );
    uniformsTerrain[ 'uAmbientColor' ].value.setHex( 0x111111 );

    uniformsTerrain[ 'uShininess' ].value = 30;

    uniformsTerrain[ 'uDisplacementScale' ].value = 375;

    uniformsTerrain[ 'uRepeatOverlay' ].value.set( 6, 6 );

    const params = [
      [ 'heightmap', 	document.getElementById( 'fragmentShaderNoise' ).textContent, 	vertexShader, uniformsNoise, false ],
      [ 'normal', 	normalShader.fragmentShader,  normalShader.vertexShader, uniformsNormal, false ],
      [ 'terrain', 	terrainShader.fragmentShader, terrainShader.vertexShader, uniformsTerrain, true ]
    ];

    for( let i = 0; i < params.length; i ++ ) {

      mlib[ params[ i ][ 0 ] ] =  new THREE.ShaderMaterial( {
        uniforms: 		params[ i ][ 3 ],
        vertexShader: 	params[ i ][ 2 ],
        fragmentShader: params[ i ][ 1 ],
        lights: 		params[ i ][ 4 ],
        fog: 			true
      } );
    }

    // Terrain Mesh
    const geometryTerrain = new THREE.PlaneGeometry( 6000, 6000, 256, 256 );
    geometryTerrain.computeFaceNormals();
    geometryTerrain.computeVertexNormals();
    geometryTerrain.computeTangents();

    terrainScene = new THREE.Mesh( geometryTerrain, mlib[ 'terrain' ] );
    terrainScene.rotation.set( -Math.PI / 2, 0, 0 );
    terrainScene.position.set( 0, -125, 0 );
    terrainScene.visible = false;

    this.mainScene.add(terrainScene);
  }

  public animate() {

    const render = () => {

      this.clock.getDelta();

      const delta = clock.getDelta();

      const time = Date.now() * 0.001;

      // controls.update();

      const fLow = 0.4;
      const fHigh = 0.825;

      lightVal = THREE.Math.clamp(lightVal + 0.5 * delta * lightDir, fLow, fHigh);

      var valNorm = ( lightVal - fLow ) / ( fHigh - fLow );

      var sat = THREE.Math.mapLinear(valNorm, 0, 1, 0.95, 0.25);
      scene.fog.color.setHSV(0.1, sat, lightVal);

      renderer.setClearColor(scene.fog.color, 1);

      spotLight.intensity = THREE.Math.mapLinear(valNorm, 0, 1, 0.1, 1.15);
      pointLight.intensity = THREE.Math.mapLinear(valNorm, 0, 1, 0.9, 1.5);

      uniformsTerrain['uNormalScale'].value = THREE.Math.mapLinear(valNorm, 0, 1, 0.6, 3.5);

      const animDelta = THREE.Math.clamp(animDelta + 0.00075 * animDeltaDir, 0, 0.05);
      uniformsNoise['time'].value += delta * animDelta;

      uniformsNoise['offset'].value.x += delta * 0.05;

      uniformsTerrain['uOffset'].value.x = 4 * uniformsNoise['offset'].value.x;

      quadTarget.material = mlib['heightmap'];
      renderer.render(sceneRenderTarget, cameraOrtho, heightMap, true);

      quadTarget.material = mlib['normal'];
      renderer.render(sceneRenderTarget, cameraOrtho, normalMap, true);

    };

    const animate = () => {
      requestAnimationFrame( animate );
      render();
    };

    animate();
  }

}
