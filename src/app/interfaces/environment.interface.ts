// TODO: Maybe write a better terrain oriented interface
export interface TerrainGen {
    width: number;
    height: number;
    amplitude: number;
    wavelength: number;
    octaves: number;
}

export interface EnvironmentSwitcher {
    sky: boolean;
    sun: boolean;
    clouds: boolean;
    hills: boolean;
    road: boolean;
    months: boolean;
    year: boolean;
}

export interface GlobalDate {
    direction: 'forward' | 'backward';
    year: number;
    month: 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';
}

export interface LifeEvent {
    type: 'employment' | 'school' | 'life' | 'hobbies' | 'travel' | 'work' | 'food' | 'fullscreen'; // TODO: More research
    name: string; // I'm not sure this helps at anything
    position: 'sky' | 'hills' | 'ground' | 'soil';
    entryAnimation: 'fly' | 'stumble'; // TODO: Add more
    asset: string; // URL of the PNG file used as asset
    assetSize: [number, number]; // The size the PNG should have in the scene
    filter: 'glow' | 'blur' | 'glitch'; // List of filters
    year: number;
    month: 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';
}
