import { Action, ThrowCard } from '../game.actions';
import { Game, Battle, Suit, Card, Phase, PlayersCards, CardPattern } from '../game.interfaces';
import { getNextTrickTurn, isTrumpAnnounced, getTrumpSuit, isTableEmpty, getLeadCard, getPlayerByTrickCard, getCardSuit } from '../helpers/battle.helpers';
import * as _ from 'lodash';
import { getCardsByColor, getCardWithHighestRank, cardExistsIn } from '../helpers/cards.helpers';

export function canThrowCard(state: Game, { player, card }: ThrowCard) {
    // should be in specific phase
    if (state.phase !== Phase.TRICK_IN_PROGRESS) { return false; }
    
    // should be in player turn
    if (getNextTrickTurn(state) !== player) { return false; }
    
    // should have the card
    if(!cardExistsIn(state.cards[player], card)) { return false; }
    
    const battle: Battle = state.battle;
    const playerCards: CardPattern[] = state.cards[player];
    let cardsAllowedToThrow: CardPattern[] = [];
    if (isTableEmpty(battle)) {
        //it will be first card on table, allow, no matter what it is
        cardsAllowedToThrow = playerCards;
    } else {
        //upcomming cards should be related to lead card
        cardsAllowedToThrow = getCardsByColor(playerCards, getCardSuit(getLeadCard(battle)));
        if(cardsAllowedToThrow.length === 0) {
            cardsAllowedToThrow = playerCards;
        } else {
            if (isTrumpAnnounced(battle)) {                
                cardsAllowedToThrow = [
                    ...cardsAllowedToThrow, 
                    ...getCardsByColor(playerCards, getTrumpSuit(battle))
                ];
            }
        }
    }
    
    return cardExistsIn(cardsAllowedToThrow, card);
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

