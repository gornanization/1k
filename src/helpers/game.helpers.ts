import { Game, Phase } from '../game.interfaces';

export function isBomb(pointsValue: number|null): boolean {
    return pointsValue === null;
}