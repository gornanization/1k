import * as should from 'should';
import { createCardPatterns } from '../../src/helpers/cards.helpers';
import { isBiddingFinished, canBid } from '../../src/validators/bid.validator';
import { bid, setPhase, dealCardToStock, dealCardToPlayer, registerPlayer, setDeck, shareStock, assignStock, initializeBattle, throwCard, FinalizeTrick, FINALIZE_TRICK, finalizeTrick, initializeBidding, calculateBattleResult, declareBomb } from '../../src/game.actions';
import { game as gameReducer } from '../../src/game.reducer';
import { PlayersBid, Phase, Game } from '../../src/game.interfaces';

describe('initializeBidding', () => {
    beforeEach(() => {
        this.state = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.BIDDING_START,
            players: [
                { id: 'adam', battlePoints: [] },
                { id: 'pic', battlePoints: [] },
                { id: 'alan', battlePoints: [] }],
            deck: [],
            stock: createCardPatterns(3),
            bid: [],
            cards: {
                adam: createCardPatterns(7),
                alan: createCardPatterns(7),
                pic: createCardPatterns(7)
            },
            battle: null
        } as Game;
    });

    it('set default bid for first registered user, when it\'s first bidding ever', () => {
        // assign
        const currentState = this.state;
        // act
        const nextState = gameReducer(currentState, initializeBidding());
        //assert
        should(nextState.phase).be.deepEqual(Phase.BIDDING_IN_PROGRESS);
        should(nextState.bid).be.deepEqual([
            { player: 'adam', bid: 100, pass: false }
        ] as PlayersBid[])
    });

    it('set next useer, when in the middel of the game', () => {
        // assign
        const currentState = this.state;
        currentState.players = [
            { id: 'adam', battlePoints: [120] },
            { id: 'pic', battlePoints: [0] },
            { id: 'alan', battlePoints: [0] }
        ];
        // act
        const nextState = gameReducer(currentState, initializeBidding());
        //assert
        should(nextState.phase).be.deepEqual(Phase.BIDDING_IN_PROGRESS);
        should(nextState.bid).be.deepEqual([
            { player: 'pic', bid: 100, pass: false }
        ] as PlayersBid[])
    });
});