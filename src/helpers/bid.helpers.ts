import { PlayersBid, Game, Player } from '../game.interfaces';
import * as _ from 'lodash';

export function isMaxBid({bid}: PlayersBid): boolean {
    return bid === 300;
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
