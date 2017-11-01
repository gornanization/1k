import { Game } from '../game.interfaces';
import { getUniqueBidders } from '../helpers/bid.helpers';
import * as _ from 'lodash';
import { ShareStock } from '../game.actions';
import { hasEightCards } from '../helpers/cards.helpers';

export function canShareStock(state: Game, action: ShareStock): boolean {
    return true;
}

export function isSharingStockFinished(state: Game): boolean {
    return _.chain(getUniqueBidders(state.bid))
        .every(playerId => hasEightCards(state.cards[playerId]))
        .value();
}