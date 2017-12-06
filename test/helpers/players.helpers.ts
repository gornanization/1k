
import { Phase, Battle, Game } from '../../src/game.interfaces';
import { noOneParticipatedInBidding } from '../../src/helpers/bid.helpers';
import * as should from 'should';
import { getNextBiddingTurn } from '../../src/helpers/players.helpers';

describe('players helpers', () => {
    beforeEach(() => {
        this.state = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.BIDDING_START,
            players: [{ id: 'adam', battlePoints: [] }, { id: 'pic', battlePoints: [] }, { id: 'alan', battlePoints: [] }],
            deck: [],
            stock: [],
            bid: [],
            cards: {},
            battle: null
        } as Game;
    });

    describe('getNextBiddingTurn', () => {
        it('returns  first registered player, for first bidding ever', () => {
            // assign
            const currentState = this.state;
            // act
            const nextBiddingTurnPlayerId = getNextBiddingTurn(currentState);
            //assert
            console.log(nextBiddingTurnPlayerId)
            should(nextBiddingTurnPlayerId).be.equal('adam');
       });
       it('returns pic, for fifth bidding round', () => {
        // assign
        const currentState = this.state;
        currentState.players[0].battlePoints = [1, 2, 3, 4];
        // act
        const nextBiddingTurnPlayerId = getNextBiddingTurn(currentState);
        //assert
        console.log(nextBiddingTurnPlayerId)
        should(nextBiddingTurnPlayerId).be.equal('pic');
   });
    });
});