import { Game } from '../game.interfaces';
import { Bid, Action, BID, REGISTER_PLAYER, SHARE_STOCK, ShareStock, RegisterPlayer } from '../game.actions';
import { canBid } from './bid.validator';
import { canShareStock } from './stock.validator';
import { canRegisterPlayer } from './player.validator';

export function can(state: Game, action: Action): boolean {
    return {
        [REGISTER_PLAYER]: (s, a) => canRegisterPlayer(s, a as RegisterPlayer),
        [BID]:             (s, a) => canBid(s, a as Bid),
        [SHARE_STOCK]:     (s, a) => canShareStock(state, action as ShareStock),
    }[action.type](state, action);
}