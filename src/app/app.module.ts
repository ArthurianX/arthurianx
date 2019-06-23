import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LottieAnimationViewModule } from 'ng-lottie';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PixiModule } from 'ngxpixi';
// import {RotatingDialComponent} from "./rotating-dial";
import { StoryComponent } from './containers/story/story.component';
import { IntroComponent } from './containers/intro/intro.component';
import { NoContentComponent } from './components/no-content';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingAnimationComponent } from './components/logo-animation';
import { DialAnimationComponent } from './components/dial-animation';
import { EnvironmentComponent } from './components/environment/environment.component';
import { DialSceneComponent } from './components/rotating-dial/dial-scene.component';
import { RotatingDialComponent } from './components/rotating-dial/rotating-dial.component';
import { PlayComponent } from './containers/play/play.component';
import { TerrainCreatorComponent } from './components/terrain-creator/terrain-creator.component';
import { AtftModule } from 'atft';

@NgModule({
  declarations: [
    TerrainCreatorComponent,
    PlayComponent,
    DialSceneComponent,
    RotatingDialComponent,
    DialAnimationComponent,
    LoadingAnimationComponent,
    NoContentComponent,
    AppComponent,
    StoryComponent,
    IntroComponent,
    EnvironmentComponent
  ],
  imports: [
    PixiModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    LottieAnimationViewModule,
    FlexLayoutModule,
    AtftModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
