import { Game } from '../game.interfaces';
import { Bid, Action, BID } from '../game.actions';
import { canBid } from './bid.validator';

export function can(state: Game, action: any): boolean {
    return {
        [BID]: canBid
    }[action.type](state, action);
}