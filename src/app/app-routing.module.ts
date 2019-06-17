import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IntroComponent} from './containers/intro/intro.component';
import {NoContentComponent} from './components/no-content';
import {StoryComponent} from './containers/story/story.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: IntroComponent, data: {animation: 'Intro'} },
  { path: 'story',  component: StoryComponent, data: {animation: 'Story'} },
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