import { Injectable } from '@angular/core';
import { trigger, query, transition, style, animate, state, group } from '@angular/animations';

@Injectable()
export class AnimationControllerService {

    currentAnimation: any = null;
    currentAnimationId = -1;
    public animations: any;

    constructor() {

    }

    setCurrentAnimation(animationId) {
        let nextAnimation = '';
        let isDuplicate = false;

        switch (animationId) {
            case 1:
                nextAnimation = 'slideToLeft';
                break;
            case 2:
                nextAnimation = 'slideToRight';
                break;
            case 3:
                nextAnimation = 'slideToTop';
                break;
            case 4:
                nextAnimation = 'slideToBottom';
                break;
        }
        if (this.currentAnimation && (this.currentAnimation.indexOf('Duplicate') > -1)) {
            isDuplicate = true;
        }

        /* add duplicate if previous animation otherwise animation will not work */
        if ((animationId === this.currentAnimationId) && !isDuplicate) {
            nextAnimation = nextAnimation + 'Duplicate';
        }
        this.currentAnimation = nextAnimation;
        this.currentAnimationId = animationId;
    }

    getCurrentAnimation() {
        return this.currentAnimation;
    }
}
