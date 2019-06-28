import {Subject} from 'rxjs';
import { LifeEvent } from '../../interfaces/environment.interface';

export class LifeStreamService {

    public getEvents: Subject<LifeEvent[]> = new Subject();

    constructor() {
        setTimeout(() => {
            this.getEvents.next(this.events);
        }, 700);
    }

    public events: LifeEvent[] = [
        {
            type: 'life',
            name: 'Birth',
            position: 'sky',
            entryAnimation: 'fly',
            asset: 'https://www.freepik.com/free-vector/cute-stork-with-baby_785784.htm',
            assetSize: [200, 100],
            filter: 'glow',
            year: 1985,
            month: 'Feb'
        },
        {
            type: 'life',
            name: 'Trip to Sibiu',
            position: 'ground',
            entryAnimation: 'stumble',
            asset: 'https://www.freepik.com/free-vector/cute-stork-with-baby_785784.htm',
            assetSize: [200, 100],
            filter: 'glow',
            year: 1985,
            month: 'Feb'
        },
    ];
    // type: 'employment' | 'school' | 'life' | 'hobbies' | 'travel' | 'work' | 'food' | 'fullscreen';
    // name: string;
    // position: 'sky' | 'hills' | 'ground' | 'soil';
    // entryAnimation: 'fly' | 'stumble';
    // asset: string;
    // assetSize: [number, number];
    // filter: 'glow' | 'blur' | 'glitch'; // List of filters
    // year: number;
    // month: 'Jan' | 'Feb' | 'Mar'

}
