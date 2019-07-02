import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationControllerService } from '../../services/animation.controller.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {
  private showHire = false;

  constructor(public router: Router, public animService: AnimationControllerService) { }

  ngOnInit() {
  }

  navigateTo($event: string) {
    switch ($event) {
      case 'lab':
        this.animService.setCurrentAnimation(4);
        this.router.navigate(['triangle']);
        break;
      case 'me':
        this.animService.setCurrentAnimation(1);
        this.router.navigate(['story']);
        break;
      case 'work':
        this.animService.setCurrentAnimation(3);
        this.router.navigate(['intro']);
        break;
    }
  }

    showCalendar() {
        this.showHire = true;
    }
}
