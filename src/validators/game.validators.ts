import { Game, Player, Phase } from '../game.interfaces';
import { Bid, Action, BID, REGISTER_PLAYER, SHARE_STOCK, ShareStock, RegisterPlayer, THROW_CARD, throwCard, ThrowCard } from '../game.actions';
import { canBid } from './bid.validator';
import { canShareStock } from './stock.validator';
import { canRegisterPlayer } from './player.validator';
import { getWinner, getTotalRospisatByPlayer, getPlayerTotalPoints, getPlayerById } from '../helpers/players.helpers';
import { canThrowCard } from './battle.validator';
import * as _ from 'lodash';
import { isTableEmpty, getTotalWonCards } from '../helpers/battle.helpers';

export function can(state: Game, action: Action): boolean {
    return {
        [REGISTER_PLAYER]: (s, a) => canRegisterPlayer(s, a as RegisterPlayer),
        [BID]:             (s, a) => canBid(s, a as Bid),
        [SHARE_STOCK]:     (s, a) => canShareStock(state, action as ShareStock),
        [THROW_CARD]:      (s, a) => canThrowCard(state, action as ThrowCard),
    }[action.type](state, action);
}

export function isGameFinished(state: Game): boolean {
    const winner: Player = getWinner(state.players);
    return !!winner;
}

export function canAnnounceRospisat(state: Game, player: string): boolean {
    const { battle } = state;

    const isValidPhase = _.includes([
        Phase.SHARE_STOCK,
        Phase.BATTLE_START,
        Phase.BATTLE_IN_PROGRESS
    ], state.phase);

    if( battle.leadPlayer !== player) { return false; }

    if (getTotalRospisatByPlayer(state, player) === state.settings.maxRospisat) { return false; }

    if(state.settings.permintRospisatOnBarrel) {
        const playerObj = getPlayerById(state.players, player);
        const totalPlayerPoints = getPlayerTotalPoints(playerObj);
        if (totalPlayerPoints >= state.settings.barrelPointsLimit) { return false; }
    }

    if (!isTableEmpty(battle)) { return false; } //some cards throw on the table
    if (getTotalWonCards(state) > 0) { return false; } //some tricks already finished,
    
    return true;
}