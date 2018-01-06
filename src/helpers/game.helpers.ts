import { Game, Phase } from '../game.interfaces';
import { Base64 } from 'js-base64';

export function isBomb(pointsValue: number|null): boolean {
    return pointsValue === null;
}

export function loadStateFromText(text: string): Game {
    try {
        return JSON.parse(Base64.decode(text));
    } catch(e) { }
    return null;
}

export function saveStateToText(state: Game): string {
    return Base64.encode(JSON.stringify(state));
}
