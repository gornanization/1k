import { Action } from '../game.actions';
import { Game, Battle, Suit, Card, Phase } from '../game.interfaces';
import { getNextTrickTurn, isTrumpAnnounced, getTrumpSuit, isTableEmpty, getLeadCard, getPlayerByTrickCard } from '../helpers/battle.helpers';
import * as _ from 'lodash';
import { getCardsByColor, getCardWithHighestRank } from '../helpers/cards.helpers';

export function canThrowCard(state: Game, throwCard: Action) {

    if (state.phase !== Phase.TRICK_IN_PROGRESS) { return false; }
    
    const battle: Battle = state.battle;
    const nextTrickPlayerTurn = getNextTrickTurn(state);

    if (isTableEmpty(battle)) {
        //it will be first card on table
        if(isTrumpAnnounced(battle)) {
            const trumpSuit: Suit = getTrumpSuit(battle);
            //Q&K announced here
        } else {
            //ordinary card throw
        }
    } else {
        const leadCard = getLeadCard(battle);
        //upcomming cards should be related to lead card
    }
    //TODO fill logic
    return true;
}

export function isTrickFinished(state: Game): boolean {
    return state.battle.trickCards.length === 3;
}

export function isBattleFinished(state: Game): boolean {
    return _.chain(state.battle.wonCards)
        .reduce((total: number, playerCards: Card[]) => total + playerCards.length, 0)
        .isEqual(24)
        .value()
}

