import { Game } from '../game.interfaces';
import { Bid, Action, BID, REGISTER_PLAYER, SHARE_STOCK, ShareStock } from '../game.actions';
import { canBid } from './bid.validator';
import { canShareStock } from './stock.validator';

export function can(state: Game, action: Action): boolean {
    return {
        [REGISTER_PLAYER]: (state, action) => true,
        [BID]: canBid,
        [SHARE_STOCK]: canShareStock
    }[action.type](state, action);
}