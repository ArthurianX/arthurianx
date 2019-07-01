import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './app.animations';
import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { AnimationControllerService } from './services/animation.controller.service';

const slideToRight = [
    query(':enter, :leave', style({position: 'fixed', left: 0, right: 0, top: 0, bottom: 0}), {optional: true}),
    query(':leave', style({transform: 'translateX(0%)'}), {optional: true}),
    query(':enter', style({transform: 'translateX(-100%)'}), {optional: true}),
    group([
        query(':leave', [
            animate('500ms ease-in-out', style({transform: 'translateX(100%)'})),
        ], {optional: true}),
        query(':enter', [
            animate('500ms ease-in-out', style({transform: 'translateX(0%)'})),
        ], {optional: true})
    ])
];

const slideToLeft = [
    query(':enter, :leave', style({position: 'fixed', left: 0, right: 0, top: 0, bottom: 0}), {optional: true}),
    query(':leave', style({transform: 'translateX(0%)'}), {optional: true}),
    query(':enter', style({transform: 'translateX(100%)'}), {optional: true}),
    group([
        query(':leave', [
            animate('500ms ease-in-out', style({transform: 'translateX(-100%)'})),
        ], {optional: true}),
        query(':enter', [
            animate('500ms ease-in-out', style({transform: 'translateX(0%)'})),
        ], {optional: true})
    ])
];

const slideToTop = [
    query(':enter, :leave', style({position: 'fixed', left: 0, right: 0, top: 0, bottom: 0}), {optional: true}),
    query(':leave', style({transform: 'translateY(0%)'}), {optional: true}),
    query(':enter', style({transform: 'translateY(100%)'}), {optional: true}),
    group([
        query(':leave', [
            animate('500ms ease-in-out', style({transform: 'translateY(-100%)'})),
        ], {optional: true}),
        query(':enter', [
            animate('500ms ease-in-out', style({transform: 'translateY(0%)'})),
        ], {optional: true})
    ])
];

const slideToBottom = [
    query(':enter, :leave', style({position: 'fixed', left: 0, right: 0, top: 0, bottom: 0}), {optional: true}),
    query(':leave', style({transform: 'translateY(0%)'}), {optional: true}),
    query(':enter', style({transform: 'translateY(-100%)'}), {optional: true}),
    group([
        query(':leave', [
            animate('500ms ease-in-out', style({transform: 'translateY(100%)'})),
        ], {optional: true}),
        query(':enter', [
            animate('500ms ease-in-out', style({transform: 'translateY(0%)'})),
        ], {optional: true})
    ])
];


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass'],
    animations: [
        trigger('routeTransition', [
            transition('* => slideToLeft', slideToLeft),
            transition('* => slideToRight', slideToRight),
            transition('* => slideToTop', slideToTop),
            transition('* => slideToBottom', slideToBottom),
            transition('* => slideToLeftDuplicate', slideToLeft),
            transition('* => slideToRightDuplicate', slideToRight),
            transition('* => slideToTopDuplicate', slideToTop),
            transition('* => slideToBottomDuplicate', slideToBottom),
        ])
    ]
})
export class AppComponent {
    title = 'ArthurianX';

    constructor(
        private animService: AnimationControllerService
    ) {}

    // public prepareRoute(outlet: RouterOutlet) {
    //     return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
    // }

    public getAnimation(outlet: RouterOutlet) {
        return this.animService.getCurrentAnimation();
    }

    // Now you can easily navigate to any route by simple injecting to your class and setting current animation and then navigate to your route. So simple
    // this.animService.setCurrentAnimation(1);
    // this.router.navigate([navigateToPage]);
}
