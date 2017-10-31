import { PlayersBid, Game } from '../game.interfaces';
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