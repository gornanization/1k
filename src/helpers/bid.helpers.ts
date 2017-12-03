import { PlayersBid, Game, Player } from '../game.interfaces';
import * as _ from 'lodash';

export function isMaxBid({ bid }: PlayersBid): boolean {
    return bid === 300;
}

export function isAchievableBid({ bid }: PlayersBid): boolean {
    return bid <= 300;
}

export function isValidBidValue({ bid }: PlayersBid): boolean {
    return parseInt(bid + "") === parseFloat(bid + "") && bid % 10 === 0;
}

export function hasTwoPasses(bids: PlayersBid[]): boolean {
    return _.chain(bids)
        .filter((playerBid: PlayersBid) => playerBid.pass)
        .thru(passedBids => passedBids.length === 2)
        .value();
}

export function getBidWinner(bids: PlayersBid[]): PlayersBid {
    return _.find(bids, player => !player.pass);
}

export function getUniqueBidders(bids: PlayersBid[]): string[] {
    return _.reduce(bids, (bidders, bid) => {
        return bidders.includes(bid.player) ? bidders : [bid.player, ...bidders];
    }, []);
}

export function isBidder(bids: PlayersBid[], player: string): boolean {
    return _.chain(getUniqueBidders(bids))
        .map('player')
        .includes(player)
        .value();
}

export function getHighestBid(bids: PlayersBid[]): PlayersBid {
    return _.max(bids, (pb: PlayersBid) => pb.bid);
}

export function hasPlayerAlreadyPassed(bids: PlayersBid[], playerId: string): boolean {
    return _.some(bids,  {player: playerId, pass: true});
}

export function noOneParticipatedInBidding(bids: PlayersBid[]): boolean {
    return getBidWinner(bids).bid === 100;
}