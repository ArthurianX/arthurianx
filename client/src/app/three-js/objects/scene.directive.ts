import { Directive, AfterViewInit, Input, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from './abstract-object-3d';

@Directive({
  selector: 'three-scene',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => SceneDirective) }]
})
export class SceneDirective extends AbstractObject3D<THREE.Scene> {

  @Input() public fog: THREE.Fog = new THREE.Fog(0x050505, 1, 1000);
  public createdScene: any;

  constructor() {
    super();
    console.log("SceneDirective.constructor");
  }

  protected afterInit(): void {
    console.log("SceneDirective.afterInit");
  }

  protected newObject3DInstance(): THREE.Scene {
    console.log("SceneDirective.newObject3DInstance");
    this.createdScene = new THREE.Scene();
    this.createdScene.fog = this.fog;

    console.info('SCENEEE', this.createdScene);
    return this.createdScene;
  }

}
