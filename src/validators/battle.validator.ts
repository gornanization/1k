import { Action } from '../game.actions';
import { Game, Battle, Suit } from '../game.interfaces';
import { getNextTrickTurn, isTrumpAnnounced, getTrumpSuit } from '../helpers/battle.helpers';

export function canThrowCard(state: Game, throwCard: Action) {
    const battle: Battle = state.battle;

    const nextTrickPlayerTurn = getNextTrickTurn(state);

    if(isTrumpAnnounced(battle)) {
        const trumpSuit: Suit = getTrumpSuit(battle);
        //Q&K announced here
    }

    return true;
}