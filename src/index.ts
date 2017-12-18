import { getWinner as getWinnerInternal } from './helpers/players.helpers';
import { Game, Player } from './game.interfaces';

export * from './game.interfaces';
export { initializeGame } from './game';
export { createCards, createCard } from './helpers/cards.helpers';

export function getWinner(state: Game): string|null {
    const winner: Player = getWinnerInternal(state.players);
    return winner ? winner.id : null;
}

export const a = 2;