import { Game, PlayersBid, Player, Phase } from '../game.interfaces';
import { Bid, RegisterPlayer } from '../game.actions';
import { getNextTurn, playerExists, getMaxPlayersCount, maxPlayersCountReached } from '../helpers/players.helpers';
import { hasMarriage } from '../helpers/cards.helpers';
import * as _ from 'lodash';
import { isMaxBid, hasTwoPasses } from '../helpers/bid.helpers';

export function canRegisterPlayer(state: Game, action: RegisterPlayer): boolean {
    return !isRegisteringPlayersPhaseFinished(state) && 
            state.phase === Phase.REGISTERING_PLAYERS_IN_PROGRESS && 
           !playerExists(state.players, action.id);
}

export function isRegisteringPlayersPhaseFinished(state: Game): boolean {
    return maxPlayersCountReached(state.players);
}
