import { Phase, Battle, Game } from '../../src/game.interfaces';
import { noOneParticipatedInBidding } from '../../src/helpers/bid.helpers';
import * as should from 'should';


describe('bid helpers', () => {
    beforeEach(() => {
        this.state = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 18
            },
            phase: Phase.BIDDING_IN_PROGRESS,
            players: [{ id: 'adam', battlePoints: [] }, { id: 'pic', battlePoints: [] }, { id: 'alan', battlePoints: [] }],
            deck: [],
            stock: [],
            bid: [],
            cards: {},
            battle: null
        } as Game;
    });

    describe('noOneParticipatedInBidding', () => {
        it('return true, when two players passed', () => {
            // assign
            const currentState = this.state;
            currentState.bid = [
               { player: 'alan', bid: 0, pass: true },
               { player: 'pic', bid: 0, pass: true },
               { player: 'adam', bid: 100, pass: false }
           ];
            // act
            const noOneParticipatedInBiddingProcess = noOneParticipatedInBidding(currentState.bid);
            //assert
            should(noOneParticipatedInBiddingProcess).be.equal(true);
       });
       it('return false, when bid is more than 100', () => {
            // assign
            const currentState = this.state;
            currentState.bid = [
                { player: 'alan', bid: 0, pass: true },
                { player: 'pic', bid: 110, pass: false },
                { player: 'adam', bid: 100, pass: false }
            ];
            // act
            const noOneParticipatedInBiddingProcess = noOneParticipatedInBidding(currentState.bid);
            //assert
            should(noOneParticipatedInBiddingProcess).be.equal(false);
        });       
    });
});