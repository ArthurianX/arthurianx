/*
 * Custom Type Definitions
 * When including 3rd party modules you also need to include the type definition for the module
 * if they don't provide one within the module. You can try to install it with @types

npm install @types/node
npm install @types/lodash

 * If you can't find the type definition in the registry we can make an ambient/global definition in
 * this file for now. For example

declare module 'my-module' {
 export function doesSomething(value: string): string;
}

 * If you are using a CommonJS module that is using module.exports then you will have to write your
 * types using export = yourObjectOrFunction with a namespace above it
 * notice how we have to create a namespace that is equal to the function we're
 * assigning the export to

declare module 'jwt-decode' {
  function jwtDecode(token: string): any;
  namespace jwtDecode {}
  export = jwtDecode;
}

 *
 * If you're prototying and you will fix the types later you can also declare it as type any
 *

declare var assert: any;
declare var _: any;
declare var $: any;

 *
 * If you're importing a module that uses Node.js modules which are CommonJS you need to import as
 * in the files such as main.browser.ts or any file within app/
 *

import * as _ from 'lodash'

 * You can include your type definitions in this file until you create one for the @types
 *
 */

// support NodeJS modules without type definitions
declare module '*';

/*
// for legacy tslint etc to understand rename 'modern-lru' with your package
// then comment out `declare module '*';`. For each new module copy/paste
// this method of creating an `any` module type definition
declare module 'modern-lru' {
  let x: any;
  export = x;
}
*/

// Extra variables that live on Global that will be replaced by webpack DefinePlugin
declare var ENV: string;
declare var HMR: boolean;
declare var passiveSupported: any;

declare var System: SystemJS;

interface SystemJS {
  import: (path?: string) => Promise<any>;
}

interface GlobalEnvironment {
  ENV: string;
  HMR: boolean;
  SystemJS: SystemJS;
  System: SystemJS;
}

interface Es6PromiseLoader {
  (id: string): (exportName?: string) => Promise<any>;
}

type FactoryEs6PromiseLoader = () => Es6PromiseLoader;
type FactoryPromise = () => Promise<any>;

type AsyncRoutes = {
  [component: string]: Es6PromiseLoader |
                               Function |
                FactoryEs6PromiseLoader |
                         FactoryPromise ;
};

type IdleCallbacks = Es6PromiseLoader |
                             Function |
              FactoryEs6PromiseLoader |
                       FactoryPromise ;

interface WebpackModule {
  hot: {
    data?: any,
    idle: any,
    accept(dependencies?: string | string[], callback?: (updatedDependencies?: any) => void): void;
    decline(deps?: any | string | string[]): void;
    dispose(callback?: (data?: any) => void): void;
    addDisposeHandler(callback?: (data?: any) => void): void;
    removeDisposeHandler(callback?: (data?: any) => void): void;
    check(autoApply?: any, callback?: (err?: Error, outdatedModules?: any[]) => void): void;
    apply(options?: any, callback?: (err?: Error, outdatedModules?: any[]) => void): void;
    status(callback?: (status?: string) => void): void | string;
    removeStatusHandler(callback?: (status?: string) => void): void;
  };
}

interface WebpackRequire {
    (id: string): any;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure(ids: string[], callback: (req: WebpackRequire) => void, chunkName?: string): void;
    context(directory: string, useSubDirectories?: boolean, regExp?: RegExp): WebpackContext;
}

interface WebpackContext extends WebpackRequire {
    keys(): string[];
}

interface ErrorStackTraceLimit {
  stackTraceLimit: number;
}

// Extend typings
interface NodeRequire extends WebpackRequire {}
interface ErrorConstructor extends ErrorStackTraceLimit {}
interface NodeRequireFunction extends Es6PromiseLoader  {}
interface NodeModule extends WebpackModule {}
interface Global extends GlobalEnvironment  {}

/// <reference types="pixi.js" />
declare namespace PIXI.sound {
  // SoundLibrary
  const context: IMediaContext;
  const supported: boolean;
  let useLegacy: boolean;
  let volumeAll: number;
  let speedAll: number;
  let filtersAll: Filter[];
  function add(alias: string, options: Options | string | ArrayBuffer | HTMLAudioElement | Sound): Sound;
  function add(map: SoundMap, globalOptions?: Options): {
    [id: string]: Sound;
  };
  function remove(alias: string): typeof PIXI.sound;
  function togglePauseAll(): boolean;
  function pauseAll(): typeof PIXI.sound;
  function resumeAll(): typeof PIXI.sound;
  function toggleMuteAll(): boolean;
  function muteAll(): typeof PIXI.sound;
  function unmuteAll(): typeof PIXI.sound;
  function removeAll(): typeof PIXI.sound;
  function stopAll(): typeof PIXI.sound;
  function exists(alias: string, assert?: boolean): boolean;
  function find(alias: string): Sound;
  function play(alias: string,
                options?: PlayOptions | CompleteCallback | string): IMediaInstance | Promise<IMediaInstance>;
  function stop(alias: string): Sound;
  function pause(alias: string): Sound;
  function resume(alias: string): Sound;
  function volume(alias: string, volume?: number): number;
  function speed(alias: string, speed?: number): number;
  function duration(alias: string): number;
  function init(): typeof PIXI.sound;
  function close(): typeof PIXI.sound;
  // end: SoundLibrary
  class Filter {
    destination: AudioNode;
    source: AudioNode;
    constructor(destination: AudioNode, source?: AudioNode);
    connect(destination: AudioNode): void;
    disconnect(): void;
    destroy(): void;
  }
  class Filterable {
    constructor(input: AudioNode, output: AudioNode);
    readonly destination: AudioNode;
    filters: Filter[];
    destroy(): void;
  }
  interface Options {
    autoPlay?: boolean;
    preaload?: boolean;
    singleInstance?: boolean;
    volume?: number;
    speed?: number;
    complete?: CompleteCallback;
    loaded?: LoadedCallback;
    preload?: boolean;
    loop?: boolean;
    url?: string;
    source?: ArrayBuffer | HTMLAudioElement;
    sprites?: {
      [id: string]: SoundSpriteData;
    };
  }
  interface PlayOptions {
    start?: number;
    end?: number;
    speed?: number;
    loop?: boolean;
    volume?: number;
    sprite?: string;
    muted?: boolean;
    complete?: CompleteCallback;
    loaded?: LoadedCallback;
  }
  type LoadedCallback = (err: Error, sound?: Sound, instance?: IMediaInstance) => void;
  type CompleteCallback = (sound: Sound) => void;
  class Sound {
    isLoaded: boolean;
    isPlaying: boolean;
    autoPlay: boolean;
    singleInstance: boolean;
    preload: boolean;
    url: string;
    options: Options;
    media: IMedia;
    static from(source: string | Options | ArrayBuffer | HTMLAudioElement): Sound;
    constructor(media: IMedia, options: Options);
    readonly context: IMediaContext;
    pause(): Sound;
    resume(): Sound;
    paused: boolean;
    speed: number;
    filters: Filter[];
    addSprites(alias: string, data: SoundSpriteData): SoundSprite;
    addSprites(sprites: {
      [id: string]: SoundSpriteData;
    }): SoundSprites;
    destroy(): void;
    removeSprites(alias?: string): Sound;
    readonly isPlayable: boolean;
    stop(): Sound;
    play(alias: string, callback?: CompleteCallback): IMediaInstance | Promise<IMediaInstance>;
    play(source?: string | PlayOptions | CompleteCallback,
         callback?: CompleteCallback): IMediaInstance | Promise<IMediaInstance>;
    refresh(): void;
    refreshPaused(): void;
    volume: number;
    muted: boolean;
    loop: boolean;
    readonly instances: IMediaInstance[];
    readonly sprites: SoundSprites;
    readonly duration: number;
    autoPlayStart(): IMediaInstance;
  }
  type SoundMap = {
    [id: string]: Options | string | ArrayBuffer | HTMLAudioElement;
  };
  interface IMedia {
    filters: Filter[];
    readonly context: IMediaContext;
    readonly duration: number;
    readonly isPlayable: boolean;
    create(): IMediaInstance;
    init(sound: Sound): void;
    load(callback?: LoadedCallback): void;
    destroy(): void;
  }
  interface IMediaContext {
    muted: boolean;
    volume: number;
    speed: number;
    paused: boolean;
    filters: Filter[];
    toggleMute(): boolean;
    togglePause(): boolean;
    refresh(): void;
    destroy(): void;
    audioContext: AudioContext;
  }
  interface IMediaInstance {
    id: number;
    progress: number;
    paused: boolean;
    volume: number;
    speed: number;
    loop: boolean;
    muted: boolean;
    stop(): void;
    refresh(): void;
    refreshPaused(): void;
    init(parent: IMedia): void;
    play(options: PlayOptions): void;
    destroy(): void;
    toString(): string;
    once(event: string, fn: () => void, context?: any): this;
    on(event: string, fn: Function, context?: any): this;
    off(event: string, fn: Function, context?: any, once?: boolean): this;
  }
  interface SoundSpriteData {
    start: number;
    end: number;
    speed?: number;
  }
  type SoundSprites = {
    [id: string]: SoundSprite;
  };
  class SoundSprite {
    parent: Sound;
    start: number;
    end: number;
    speed: number;
    duration: number;
    constructor(parent: Sound, options: SoundSpriteData);
    play(complete?: CompleteCallback): IMediaInstance | Promise<IMediaInstance>;
    destroy(): void;
  }
  interface RenderOptions {
    width?: number;
    height?: number;
    fill?: string | CanvasPattern | CanvasGradient;
  }
  type ExtensionMap = {
    [key: string]: boolean;
  };
  class SoundUtils {
    static extensions: string[];
    static supported: ExtensionMap;
    static resolveUrl(source: string | PIXI.loaders.Resource): string;
    static sineTone(hertz?: number, seconds?: number): Sound;
    static render(sound: Sound, options?: RenderOptions): PIXI.BaseTexture;
    static playOnce(url: string, callback?: (err?: Error) => void): string;
  }
  const utils: typeof SoundUtils;
  namespace filters {
    class DistortionFilter extends Filter {
      constructor(amount?: number);
      amount: number;
      destroy(): void;
    }
    class EqualizerFilter extends Filter {
      static F32: number;
      static F64: number;
      static F125: number;
      static F250: number;
      static F500: number;
      static F1K: number;
      static F2K: number;
      static F4K: number;
      static F8K: number;
      static F16K: number;
      bands: BiquadFilterNode[];
      bandsMap: {
        [id: number]: BiquadFilterNode;
      };
      constructor(f32?: number, f64?: number, f125?: number, f250?: number, f500?: number,
                  f1k?: number, f2k?: number, f4k?: number, f8k?: number, f16k?: number);
      setGain(frequency: number, gain?: number): void;
      getGain(frequency: number): number;
      f32: number;
      f64: number;
      f125: number;
      f250: number;
      f500: number;
      f1k: number;
      f2k: number;
      f4k: number;
      f8k: number;
      f16k: number;
      reset(): void;
      destroy(): void;
    }
    class MonoFilter extends Filter {
      constructor();
      destroy(): void;
    }
    class ReverbFilter extends Filter {
      constructor(seconds?: number, decay?: number, reverse?: boolean);
      seconds: number;
      decay: number;
      reverse: boolean;
      destroy(): void;
    }
    class StereoFilter extends Filter {
      constructor(pan?: number);
      pan: number;
      destroy(): void;
    }
    class TelephoneFilter extends Filter {
      constructor();
    }
  }
  namespace htmlaudio {
    class HTMLAudioInstance extends PIXI.utils.EventEmitter implements IMediaInstance {
      static PADDING: number;
      id: number;
      constructor(parent: HTMLAudioMedia);
      readonly progress: number;
      paused: boolean;
      init(media: HTMLAudioMedia): void;
      stop(): void;
      speed: number;
      volume: number;
      loop: boolean;
      muted: boolean;
      refresh(): void;
      refreshPaused(): void;
      play(options: PlayOptions): void;
      destroy(): void;
      toString(): string;
    }
    class HTMLAudioContext extends PIXI.utils.EventEmitter implements IMediaContext {
      speed: number;
      muted: boolean;
      volume: number;
      paused: boolean;
      constructor();
      refresh(): void;
      refreshPaused(): void;
      filters: Filter[];
      readonly audioContext: AudioContext;
      toggleMute(): boolean;
      togglePause(): boolean;
      destroy(): void;
    }
    class HTMLAudioMedia extends PIXI.utils.EventEmitter implements IMedia {
      parent: Sound;
      init(parent: Sound): void;
      create(): HTMLAudioInstance;
      readonly isPlayable: boolean;
      readonly duration: number;
      readonly context: HTMLAudioContext;
      filters: Filter[];
      destroy(): void;
      readonly source: HTMLAudioElement;
      load(callback?: LoadedCallback): void;
    }
  }
  namespace webaudio {
    class WebAudioContext extends Filterable implements IMediaContext {
      compressor: DynamicsCompressorNode;
      analyser: AnalyserNode;
      speed: number;
      muted: boolean;
      volume: number;
      events: PIXI.utils.EventEmitter;
      constructor();
      playEmptySound(): void;
      static readonly AudioContext: typeof AudioContext;
      static readonly OfflineAudioContext: typeof OfflineAudioContext;
      destroy(): void;
      readonly audioContext: AudioContext;
      readonly offlineContext: OfflineAudioContext;
      paused: boolean;
      refresh(): void;
      refreshPaused(): void;
      toggleMute(): boolean;
      togglePause(): boolean;
      decode(arrayBuffer: ArrayBuffer, callback: (err?: Error, buffer?: AudioBuffer) => void): void;
    }
    class WebAudioInstance extends PIXI.utils.EventEmitter implements IMediaInstance {
      id: number;
      constructor(media: WebAudioMedia);
      stop(): void;
      speed: number;
      volume: number;
      muted: boolean;
      loop: boolean;
      refresh(): void;
      refreshPaused(): void;
      play(options: PlayOptions): void;
      readonly progress: number;
      paused: boolean;
      destroy(): void;
      toString(): string;
      init(media: WebAudioMedia): void;
    }
    class WebAudioMedia implements IMedia {
      parent: Sound;
      source: ArrayBuffer;
      init(parent: Sound): void;
      destroy(): void;
      create(): WebAudioInstance;
      readonly context: WebAudioContext;
      readonly isPlayable: boolean;
      filters: Filter[];
      readonly duration: number;
      buffer: AudioBuffer;
      readonly nodes: WebAudioNodes;
      load(callback?: LoadedCallback): void;
    }
    interface SourceClone {
      source: AudioBufferSourceNode;
      gain: GainNode;
    }
    class WebAudioNodes extends Filterable {
      static BUFFER_SIZE: number;
      bufferSource: AudioBufferSourceNode;
      script: ScriptProcessorNode;
      gain: GainNode;
      analyser: AnalyserNode;
      context: WebAudioContext;
      constructor(context: WebAudioContext);
      destroy(): void;
      cloneBufferSource(): SourceClone;
    }
  }
}

declare module "pixi-sound" {
  export = PIXI.sound;
}

