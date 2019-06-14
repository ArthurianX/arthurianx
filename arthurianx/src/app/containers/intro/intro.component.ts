import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.sass']
})
export class IntroComponent implements OnInit {

  constructor(public router: Router) { }

  ngOnInit() {
  }

  public introDone($event: any) {
    this.router.navigate(['story']);
  }
}
