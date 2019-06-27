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
