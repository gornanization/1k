import { Game, Player, Phase } from '../game.interfaces';
import { Bid, Action, BID, REGISTER_PLAYER, SHARE_STOCK, ShareStock, RegisterPlayer, THROW_CARD, throwCard, ThrowCard, DECLARE_BOMB, DeclareBomb } from '../game.actions';
import { canBid } from './bid.validator';
import { canShareStock } from './stock.validator';
import { canRegisterPlayer } from './player.validator';
import { getWinner, getTotalBombsByPlayer, getPlayerTotalPoints, getPlayerById, isOnBarrel } from '../helpers/players.helpers';
import { canThrowCard } from './battle.validator';
import * as _ from 'lodash';
import { isTableEmpty, getTotalWonCards } from '../helpers/battle.helpers';
import { getBidWinner } from '../helpers/bid.helpers';

export function can(state: Game, action: Action): boolean {
    return {
        [REGISTER_PLAYER]: (s, a) => canRegisterPlayer(s, a as RegisterPlayer),
        [BID]:             (s, a) => canBid(s, a as Bid),
        [SHARE_STOCK]:     (s, a) => canShareStock(state, action as ShareStock),
        [THROW_CARD]:      (s, a) => canThrowCard(state, action as ThrowCard),
        [DECLARE_BOMB]:    (s, a) => canDeclareBomb(state, action as DeclareBomb),
    }[action.type](state, action);
}

export function isGameFinished(state: Game): boolean {
    const winner: Player = getWinner(state.players);
    return !!winner;
}

export function canDeclareBomb(state: Game, { player }: DeclareBomb): boolean {
    const { battle } = state;

    const inAllowedPhase = _.includes([
        Phase.SHARE_STOCK,
        Phase.BATTLE_START,
        Phase.TRICK_START,
        Phase.TRICK_IN_PROGRESS
    ], state.phase);

    if(!inAllowedPhase) { return false; }

    const bidWinner = getBidWinner(state.bid).player;

    //only player who won bidding is allowed
    if(bidWinner !== player) { return false; }

    //number of declared bomd must not exceed configuration value
    
    if (getTotalBombsByPlayer(state, player) >= state.settings.maxBombs) { return false; }

    //when in barrel, prevent throwing bomb
    if (state.settings.permitBombOnBarrel && isOnBarrel(state, getPlayerById(state.players, player))) {
        return false;
    }
    
    //when trick in progress
    if(state.phase === Phase.TRICK_IN_PROGRESS) {
        if (state.battle.leadPlayer !== player)  { return false; } //player should be trick leader
        if (!isTableEmpty(battle)) { return false; } //some cards throw on the table
        if (getTotalWonCards(state) > 0) { return false; } //some tricks already finished
    }

    return true;
}