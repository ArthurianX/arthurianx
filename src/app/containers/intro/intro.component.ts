import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationControllerService } from '../../services/animation.controller.service';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.sass']
})
export class IntroComponent implements OnInit {

  constructor(public router: Router, public animService: AnimationControllerService) { }

  ngOnInit() {
  }

  public introDone($event: any) {
    this.animService.setCurrentAnimation(1);
    this.router.navigate(['home']);
  }
}
