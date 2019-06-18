import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.sass']
})
export class StoryComponent implements OnInit {
  public globalSpeed: number;

  constructor() { }

  ngOnInit() {
    //  Demo Stuff, turn this off and enable dial when done.
    this.globalSpeed = 3;
  }


  public receiveDialSpeed(speed) {
    /**
     * This will be the global speed multiplier for all the other looped animations.
     * */

    // console.log('dialSpeed', speed);
    this.globalSpeed = speed;
  }

}
