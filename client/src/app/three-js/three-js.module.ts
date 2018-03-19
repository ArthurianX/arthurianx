import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxesHelperDirective, ColladaLoaderDirective, SceneDirective } from './objects';
import { DegreePipe } from './pipes/degree.pipe';
import { RendererComponent } from './renderer/renderer.component';
import { PerspectiveCameraDirective } from './cameras';
import { OrbitControlsDirective } from './controls/orbit-controls.directive';
import { ObjectLoaderDirective } from './objects/object-loader.directive';
import { GridHelperDirective } from './objects/grid-helper.directive';
import { PointLightDirective } from './objects/point-light.directive';
import { FogDirective } from './objects/fog.directive';
import { SceneService } from './objects/scene.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    RendererComponent,
    SceneDirective,
    AxesHelperDirective,
    GridHelperDirective,
    ColladaLoaderDirective,
    DegreePipe,
    PerspectiveCameraDirective,
    OrbitControlsDirective,
    ObjectLoaderDirective,
    PointLightDirective
  ],
  exports: [
    RendererComponent,
    SceneDirective,
    AxesHelperDirective,
    GridHelperDirective,
    ColladaLoaderDirective,
    DegreePipe,
    PerspectiveCameraDirective,
    OrbitControlsDirective,
    ObjectLoaderDirective,
    PointLightDirective
  ]
})
export class ThreeJsModule { }
