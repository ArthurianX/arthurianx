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

    this.initialSceneSettings();

    /*this.ngZone.runOutsideAngular(() => {

      this.hookDetector();
      this.hookAnimationFrame();

    });*/
  }

  public submitState(value: string) {
    console.log('submitState', value);
    this.appState.set('value', value);
    this.localState.value = '';
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
    // this.addStuffToScene();
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
      maxHeight: 100,
      minHeight: -100,
      steps: 1,
      useBufferGeometry: false,
      xSegments: xS,
      xSize: 1024,
      ySegments: yS,
      ySize: 1024,
    });
    // Assuming you already have your global scene, add the terrain to it
    this.mainScene.add(terrainScene);

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
    terrainScene.add(decoScene);

  }

}
