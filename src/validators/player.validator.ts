import { Game, PlayersBid, Player } from '../game.interfaces';
import { Bid, RegisterPlayer } from '../game.actions';
import { getNextTurn, playerExists, getMaxPlayersCount, maxPlayersCountReached } from '../helpers/players.helpers';
import { hasMarriage } from '../helpers/cards.helpers';
import * as _ from 'lodash';
import { isMaxBid, hasTwoPasses } from '../helpers/bid.helpers';
import { isRegisteringPlayersPhase } from '../helpers/game.helpers';

export function canRegisterPlayer(state: Game, action: RegisterPlayer): boolean {
    return !maxPlayersCountReached(state.players) && 
           isRegisteringPlayersPhase(state) && 
           !playerExists(state.players, action.id);
}

export function isRegisteringPlayersPhaseFinished(state: Game): boolean {
    return maxPlayersCountReached(state.players);
}
