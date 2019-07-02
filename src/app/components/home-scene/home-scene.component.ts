import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { throttleTime } from 'rxjs/operators';
import { TweenLite, TweenMax, TimelineLite, Power2 } from 'gsap/all';
import { BloomFilter, AdjustmentFilter, AdjustmentOptions, AsciiFilter, CRTOptions, CRTFilter, GlitchFilter } from 'pixi-filters';
import 'pixi-sound';


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'home-scene',
    templateUrl: './home-scene.component.html',
    styleUrls: ['./home-scene.component.sass']
})
export class HomeSceneComponent implements AfterViewInit, OnDestroy {
    @Output() public navigation: EventEmitter<string> = new EventEmitter();
    loader: PIXI.Loader = new PIXI.Loader();
    @ViewChild('homeScene', {static: true}) homeSceneRef: ElementRef;
    @ViewChild('homeVideo', {static: true}) homeVideoRef: ElementRef;
    public videoTexture: PIXI.Texture;
    public mousePositionStream: EventEmitter<any> = new EventEmitter();
    public tickerStream: EventEmitter<any> = new EventEmitter();
    public soundPlaying = false;

    public globalCursorPosition: {
        x: number;
        y: number;
    } = {
        x: 0,
        y: 0
    };
    private isMouseMoving: boolean;

    private app: PIXI.Application;
    private tickerValue: number;
    private backgroundVideoRef: any;
    private backgroundSprite: PIXI.Sprite;
    private backgroundSound: PIXI.sound.Sound;
    private brokenSound: PIXI.sound.Sound;
    private lab: { r: PIXI.Sprite; b: PIXI.Sprite; g: PIXI.Sprite };
    private me: { r: PIXI.Sprite; b: PIXI.Sprite; g: PIXI.Sprite };
    private work: { r: PIXI.Sprite; b: PIXI.Sprite; g: PIXI.Sprite };
    private containers: { work: PIXI.Container; me: PIXI.Container; lab: PIXI.Container };
    private anchors: { work: { x: number; y: number }; me: { x: number; y: number }; lab: { x: number; y: number } };
    private videoCont: PIXI.Container;
    private videoGlitch: any;


    constructor() {
        const streamInterval = 100;
        this.mousePositionStream
            .pipe(throttleTime(streamInterval))
            .subscribe((res) => {
                // Set the global cursor position (used for drawing atm)
                this.isMouseMoving = true;
                this.globalCursorPosition = res;
            });
        this.tickerStream
            .pipe(throttleTime(500))
            .subscribe((time) => {
                this.menusMouseMovement(this.globalCursorPosition, streamInterval);
                this.isMouseMoving = false;
            });
    }

    public PIXIticker(time) {
        this.tickerValue = time;
        this.tickerStream.next(time);
    }

    public loaderComplete(loader, res) {
        this.addVideoBackground(res);
        this.makeMenu(res);
        this.startMouseEventStream(this.app);
        this.app.start();

        // TODO: Might change this
        // Start the ticker with a little delay to the users can see the buttons
        setTimeout(() => {
            this.app.ticker.add(this.PIXIticker.bind(this));
        }, 1500);
    }

    ngAfterViewInit(): void {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            view: this.homeSceneRef.nativeElement,
            transparent: true,
            antialias: true,
            resizeTo: window
        });

        this.app.stage.interactive = true;

        // const renderer = this.app.renderer;
        // renderer.resolution = window.devicePixelRatio;
        // renderer.resize(window.innerWidth - 1, window.innerHeight);
        // renderer.resize(window.innerWidth, window.innerHeight );
        // renderer.plugins.interaction.resolution = window.devicePixelRatio;

        this.app.stop();

        this.loader
            .add('nature', 'assets/home-scene/nature.jpg')
            .add('sound', 'assets/home-scene/spring-meadow.wav')
            .add('broken_sound', 'assets/home-scene/loop_neonlight_buzz_03.ogg')
            .add('video', 'assets/home-scene/grass.mp4')
            .add('lab_r', 'assets/home-scene/lab-r.png')
            .add('lab_g', 'assets/home-scene/lab-g.png')
            .add('lab_b', 'assets/home-scene/lab-b.png')
            .add('me_r', 'assets/home-scene/me-r.png')
            .add('me_g', 'assets/home-scene/me-g.png')
            .add('me_b', 'assets/home-scene/me-b.png')
            .add('work_r', 'assets/home-scene/work-r.png')
            .add('work_g', 'assets/home-scene/work-g.png')
            .add('work_b', 'assets/home-scene/work-b.png')
            .load(this.loaderComplete.bind(this));
    }

    ngOnDestroy(): void {
        setTimeout(() => {
            this.loader.reset();
            this.app.stop();
            this.app.destroy(true, {children: true, texture: true});
            this.containers.lab.destroy({children: true, texture: true, baseTexture: true});
            this.containers.me.destroy({children: true, texture: true, baseTexture: true});
            this.containers.work.destroy({children: true, texture: true, baseTexture: true});
            this.videoTexture.destroy(true);
            this.videoCont.destroy({children: true, texture: true, baseTexture: true});
            // ^ videoCont destroys this this.backgroundSprite.destroy({children: true, texture: true, baseTexture: true});
            // Sound is being destroyed in its own emit navigation loop
        }, 700);
    }

    private startMouseEventStream(app) {
        app.renderer﻿.plugins.interaction.on('mousemove', this.onMouseOverStage.bind(this));
    }

    private onMouseOverStage(event: any) {
        this.mousePositionStream.emit(event.data.global);
    }

    private makeMenu(res: any) {
        const ratio = 4.04;
        let menuContainerSize = [0, 0];
        const setBlendingMode = (obj: { r: PIXI.Sprite; b: PIXI.Sprite; g: PIXI.Sprite }) => {
            obj.r.blendMode = PIXI.BLEND_MODES.ADD;
            obj.g.blendMode = PIXI.BLEND_MODES.ADD;
            obj.b.blendMode = PIXI.BLEND_MODES.ADD;
        };

        const calculateMenuWidth = (size) => {
            // if (size[0] * 3 > window.innerWidth - size[0]) {
            //   // Resize the menus
            //   size[0] = window.innerWidth / 4;
            //   size[1] = size[0] / ratio;
            //   return size;
            // } else {
            //   return size;
            // }

            size[0] = window.innerWidth / 6;
            size[1] = size[0] / ratio;
            return size;
        };

        function resize(obj: { r: PIXI.Sprite; b: PIXI.Sprite; g: PIXI.Sprite }, mcs: number[]) {
            obj.r.width = mcs[0];
            obj.r.height = mcs[1];
            obj.g.width = mcs[0];
            obj.g.height = mcs[1];
            obj.b.width = mcs[0];
            obj.b.height = mcs[1];
        }

        function position(obj: { r: PIXI.Sprite; b: PIXI.Sprite; g: PIXI.Sprite }, pos: number) {
            const x = window.innerWidth / 4 * pos;
            const y = window.innerHeight / 3;
            obj.r.position.x = x;
            obj.r.position.y = y;
            obj.g.position.x = x;
            obj.g.position.y = y;
            obj.b.position.x = x;
            obj.b.position.y = y;
        }

        this.lab = {
            r: PIXI.Sprite.from(res.lab_r.url),
            g: PIXI.Sprite.from(res.lab_g.url),
            b: PIXI.Sprite.from(res.lab_b.url)
        };
        this.me = {
            r: PIXI.Sprite.from(res.me_r.url),
            g: PIXI.Sprite.from(res.me_g.url),
            b: PIXI.Sprite.from(res.me_b.url)
        };
        this.work = {
            r: PIXI.Sprite.from(res.work_r.url),
            g: PIXI.Sprite.from(res.work_g.url),
            b: PIXI.Sprite.from(res.work_b.url)
        };

        this.lab.r.anchor.set(0.5);
        this.lab.g.anchor.set(0.5);
        this.lab.b.anchor.set(0.5);
        this.me.r.anchor.set(0.5);
        this.me.g.anchor.set(0.5);
        this.me.b.anchor.set(0.5);
        this.work.r.anchor.set(0.5);
        this.work.g.anchor.set(0.5);
        this.work.b.anchor.set(0.5);

        setBlendingMode(this.lab);
        setBlendingMode(this.me);
        setBlendingMode(this.work);

        this.containers = {
            lab: new PIXI.Container(),
            me: new PIXI.Container(),
            work: new PIXI.Container(),
        };
        this.containers.lab.addChild(this.lab.r, this.lab.g, this.lab.b);
        this.containers.me.addChild(this.me.r, this.me.g, this.me.b);
        this.containers.work.addChild(this.work.r, this.work.g, this.work.b);

        menuContainerSize = calculateMenuWidth([this.containers.lab.width, this.containers.lab.height]);
        resize(this.lab, menuContainerSize);
        resize(this.me, menuContainerSize);
        resize(this.work, menuContainerSize);

        position(this.lab, 1);
        position(this.me, 2);
        position(this.work, 3);

        this.anchors = {
            lab: {x: this.lab.r.position.x, y: this.lab.r.position.y},
            me: {x: this.me.r.position.x, y: this.me.r.position.y},
            work: {x: this.work.r.position.x, y: this.work.r.position.y},
        };

        this.app.stage.addChild(this.containers.lab, this.containers.me, this.containers.work);

        // this.containers.me.filters = [
        //   new CRTFilter({curvature: 1, lineWidth: 0.2, lineContrast: 0.2, verticalLine: 0, noise: 0.1, noiseSize: 0.2, vignetting: 0, vignettingAlpha: 0, vignettingBlur: 0, time: 6} as CRTOptions)
        //   new OutlineFilter()
        // ];
        this.makeContainersInteractive(this.containers.lab);
        this.makeContainersInteractive(this.containers.me);
        this.makeContainersInteractive(this.containers.work);
    }

    private menusMouseMovement(cursor: { x: number; y: number }, streamInterval: number) {
        let multiplier = 1;
        if (this.isMouseMoving) {
            multiplier = 2;
        }
        const aniMenu = (obj, anchor) => {
            let posX1 = anchor.x - 3 * multiplier;
            let posX2 = anchor.x + 3 * multiplier;
            let posY1 = anchor.y + 3 * multiplier;
            let posY2 = anchor.y - 3 * multiplier;
            if (cursor.x > anchor.x) {
                posX2 = anchor.x; // Means the mouse is on the right, the layers should move to left
            } else {
                posX1 = anchor.x; // Means the mouse is on the left, the layers should move to right
            }

            if (cursor.y > anchor.y) {
                posY1 = anchor.y; // Means the mouse is on the right, the layers should move to left
            } else {
                posY2 = anchor.y; // Means the mouse is on the left, the layers should move to right
            }

            const x = () => this.randint(posX1, posX2);
            const y = () => this.randint(posY1, posY2);
            // streamInterval is in miliseconds
            // NOTE: Not all the layers must move
            TweenLite.to(obj.r.position, 1 / (streamInterval / 100), {x: x(), y: y()});
            TweenLite.to(obj.g.position, 1 / (streamInterval / 100), {x: x(), y: y()});
            TweenLite.to(obj.b.position, 1 / (streamInterval / 100), {x: x(), y: y()});
        };

        aniMenu(this.lab, this.anchors.lab);
        aniMenu(this.me, this.anchors.me);
        aniMenu(this.work, this.anchors.work);
    }

    private randint(min, max): number {
        return Math.ceil(Math.random() * (max - min) + min);
    }

    private onMouseOverContainer(event) {
        if (event.target == this.containers.work) {
            event.target.filters = [new GlitchFilter()];
            this.videoGlitch.refresh();
            this.videoCont.filters.push(this.videoGlitch);
            this.soundPlaying ? this.brokenSound.play() : this.brokenSound.stop();
            return false;
        }
        const bF = new BloomFilter();
        bF.blur = 0.4;
        event.target.filters = [bF];
    }

    private onMouseOutContainer(event) {
        this.containers.lab.filters = [];
        this.containers.me.filters = [];
        this.containers.work.filters = [];
        this.videoCont.filters.map( (ele, idx) => {
            if (ele == this.videoGlitch) {
                this.videoCont.filters.splice(idx, 1);
                this.brokenSound.stop();
            }
        });
        // Event Target is not immediately received, so we break it in async.
        // setTimeout(() => {
        //   if (event.target == this.containers.lab) {
        //     this.containers.lab.filters = [];
        //   } else if (event.target == this.containers.me) {
        //     this.containers.me.filters = [];
        //   } else if (event.target == this.containers.work) {
        //     this.containers.work.filters = [];
        //   }
        // }, 150);
    }

    private onMouseDown(event) {
        if (event.target == this.containers.lab) {
            this.startNavigation('lab');
        } else if (event.target == this.containers.me) {
            this.startNavigation('me');
        } else if (event.target == this.containers.work) {
            // this.startNavigation('work');
            //  NOTE: Nothing for work yet.
        }
    }

    private makeContainersInteractive(container: PIXI.Container) {
        container.interactive = true;
        container.buttonMode = true;
        container
            .on('pointerover', this.onMouseOverContainer.bind(this))
            .on('pointerout', this.onMouseOutContainer.bind(this))
            .on('pointerdown', this.onMouseDown.bind(this));
    }

    private startNavigation(place: 'lab' | 'me' | 'work') {
        console.log('Navigate to ', place);
        this.navigation.emit(place);
        TweenLite.to(this.backgroundSound, 2, {
            volume: 0, onComplete: () => {
                this.backgroundSound.stop();
                this.backgroundSound.destroy();
            }
        });
    }

    private addVideoBackground(res: any) {
        console.log(res);
        // this.backgroundSprite = PIXI.Sprite.from(res.nature.url);
        this.videoCont = new PIXI.Container();
        /* Load video from document tag */
        this.homeVideoRef.nativeElement.preload = 'auto';
        this.homeVideoRef.nativeElement.loop = true;              // enable looping
        this.homeVideoRef.nativeElement.src = res.video.url;
        this.videoTexture = PIXI.Texture.from(this.homeVideoRef.nativeElement, {
            resourceOptions: {
                autoLoad: true,
                autoPlay: true,
                updateFPS: 24
            }
        });
        /* Load video from document tag */

        /* Load video directly from resource */
        // const videoTexture = PIXI.Texture.from(res.video.url);
        console.log('videotex', this.videoTexture);
        /* Load video directly from resource */
        this.videoGlitch = new GlitchFilter();

        this.backgroundSprite = new PIXI.Sprite(this.videoTexture);
        this.backgroundSprite.width = this.app.screen.width;
        this.backgroundSprite.height = this.app.screen.height;
        const asciiF = new AsciiFilter(6);
        const crtF = new CRTFilter(
            {
                curvature: 1,
                lineWidth: 3,
                lineContrast: 0.3,
                verticalLine: 0,
                noise: 0.2,
                noiseSize: 1,
                vignetting: 0.3,
                vignettingAlpha: 0.7,
                vignettingBlur: 0.3,
                time: 0.5
            } as CRTOptions
        );
        this.videoCont.addChild(this.backgroundSprite);
        this.videoCont.filters = [
            new AdjustmentFilter({gamma: 0.8, contrast: 1, saturation: 1, brightness: 1, red: 1, green: 1, blue: 1, alpha: 1} as AdjustmentOptions),
            crtF,
            // asciiF
        ];

        // console.log(asciiF)
        /* SOUND */
        this.backgroundSound = PIXI.sound.Sound.from({
            url: res.sound.url,
            autoPlay: this.soundPlaying,
            complete: () => {
                console.log('Sound finished');
                // Loop
                this.backgroundSound.play();
            }
        });

        this.brokenSound = PIXI.sound.Sound.from({
            url: res.broken_sound.url,
            autoPlay: false,
            complete: () => {
                this.brokenSound.play();
            }
        });

        this.app.stage.addChild(this.videoCont);
    }

    volumeToggle(b: boolean) {
        if (!b) {
            this.backgroundSound.stop();
            this.soundPlaying = false;
        } else {
            this.backgroundSound.play();
            this.soundPlaying = true;
        }
    }
}
