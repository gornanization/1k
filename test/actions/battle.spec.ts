import * as should from 'should';
import { Game, Phase, Battle } from '../../src/game.interfaces';
import { createCardPatterns } from '../../src/helpers/cards.helpers';
import { isBiddingFinished, canBid } from '../../src/validators/bid.validator';
import { bid, setPhase, dealCardToStock, dealCardToPlayer, registerPlayer, setDeck, shareStock, assignStock, initializeBattle, throwCard, FinalizeTrick, FINALIZE_TRICK, finalizeTrick, initializeBidding, calculateBattleResult, declareBomb } from '../../src/game.actions';
import { game as gameReducer } from '../../src/game.reducer';

describe('initializeBattle', () => {
    beforeEach(() => {
        this.state = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 18
            },
            phase: Phase.BIDDING_IN_PROGRESS,
            players: [
                { id: 'adam', battlePoints: [] },
                { id: 'pic', battlePoints: [] },
                { id: 'alan', battlePoints: [] }
            ],
            deck: [],
            stock: [],
            bid: [
                { player: 'pic', bid: 0, pass: true },
                { player: 'pic', bid: 0, pass: true },
                { player: 'adam', bid: 100, pass: false }
            ],
            cards: {
                adam: createCardPatterns(8),
                pic: createCardPatterns(8),
                alan: createCardPatterns(8)
            },
            battle: null
        } as Game;
    });

    it('initializes battle object', () => {
        // assign
        const currentState: Game = this.state;
        // act
        const nextState = gameReducer(currentState, initializeBattle());
        //assert
        should(nextState.phase).be.equal(Phase.BATTLE_START);
        should(nextState.battle).be.deepEqual({
            trumpAnnouncements: [],
            leadPlayer: 'adam',
            trickCards: [],
            wonCards: {
                adam: [],
                pic: [],
                alan: []
            }

        } as Battle);
    });
});