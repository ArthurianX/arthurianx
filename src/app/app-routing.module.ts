import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IntroComponent} from './containers/intro/intro.component';
import {NoContentComponent} from './components/no-content';
import {StoryComponent} from './containers/story/story.component';
import { PlayComponent } from './containers/play/play.component';
import { TriangleComponent } from './containers/triangle/triangle.component';
import { HomeComponent } from './containers/home/home.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent, data: {animation: 'Intro'} },
  // { path: 'home',  component: HomeComponent, data: {animation: 'Story'} },
  { path: 'story',  component: StoryComponent, data: {animation: 'Story'} },
  { path: 'play',  component: PlayComponent },
  { path: 'triangle',  component: TriangleComponent },
  // { path: 'about', component: AboutComponent },
  // { path: 'detail', loadChildren: './+detail#DetailModule'},
  // { path: 'barrel', loadChildren: './+barrel#BarrelModule'},
  { path: '**',    component: NoContentComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
