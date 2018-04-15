import { getWinner as getWinnerInternal } from './helpers/players.helpers';
import { Game, Player } from './game.interfaces';

export { getBidWinner } from './helpers/bid.helpers';
export * from './game.interfaces';
export { initializeGame } from './game';
export { createCardPatterns, createDeck, toCard, toCardPattern, getPointsByCard } from './helpers/cards.helpers';
export { getNextTurn } from './helpers/players.helpers';
export { getTrickWinner, getNextTrickTurn } from './helpers/battle.helpers';
export { saveStateToText, loadStateFromText, extendStateWithDefaults } from './helpers/game.helpers';
export { getNextBiddingTurn } from './helpers/players.helpers';

export function getWinner(state: Game): string|null {
    const winner: Player = getWinnerInternal(state.players);
    return winner ? winner.id : null;
}