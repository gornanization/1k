import { Thousand, Game, Phase, Player, PlayersBid } from '../../src/game.interfaces';
import { initializeGame } from '../../src/game';
import * as should from 'should';
import { createCards } from '../../src/helpers/cards.helpers';
import { SHARE_STOCK } from '../../src/game.actions';

describe('bidding', () => {
    it('sets cards and initializes bidding process', () => {

        const history = [];
        const initState: Game = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.BIDDING_START,
            players: [
                { id: 'adam', battlePoints: [120, null] },
                { id: 'alan', battlePoints: [0, 60] },
                { id: 'pic', battlePoints: [0, 60] }
            ],
            deck: [],
            stock: [
                ...createCards(3)
            ],
            bid: [],
            cards: {
                'adam': createCards(7),
                'alan': createCards(7),
                'pic': createCards(7),
            },
            battle: null
        }

        const thousand: Thousand = initializeGame(initState);
        
        thousand.events.addListener('phaseUpdated', next => {
            const state: Game = thousand.getState();

            history.push([state.phase, state.bid]);

            if(state.phase === Phase.BIDDING_FINISHED) {
                should(history).be.deepEqual([
                    [Phase.BIDDING_START, []],
                    // this is set by default:
                    [Phase.BIDDING_IN_PROGRESS, [
                        { player: 'pic', bid: 100, pass: false } as PlayersBid,
                    ]],
                    // thousand.pass('adam'):
                    [Phase.BIDDING_IN_PROGRESS, [                        
                        { player: 'adam', bid: 0, pass: true } as PlayersBid,
                        { player: 'pic', bid: 100, pass: false } as PlayersBid,
                    ]],
                    // thousand.bid('alan', 120):
                    [Phase.BIDDING_IN_PROGRESS, [
                        { player: 'alan', bid: 120, pass: false } as PlayersBid,
                        { player: 'adam', bid: 0, pass: true } as PlayersBid,
                        { player: 'pic', bid: 100, pass: false } as PlayersBid
                    ]],
                    // thousand.bid('adam', 130):
                    // no event propagated, as it's not allowed
                    // thousand.pass('pic'):
                    [Phase.BIDDING_IN_PROGRESS, [
                        { player: 'pic', bid: 0, pass: true } as PlayersBid,
                        { player: 'alan', bid: 120, pass: false } as PlayersBid,
                        { player: 'adam', bid: 0, pass: true } as PlayersBid,
                        { player: 'pic', bid: 100, pass: false } as PlayersBid
                    ]],
                    [Phase.BIDDING_FINISHED, [
                        { player: 'pic', bid: 0, pass: true } as PlayersBid,
                        { player: 'alan', bid: 120, pass: false } as PlayersBid,
                        { player: 'adam', bid: 0, pass: true } as PlayersBid,
                        { player: 'pic', bid: 100, pass: false } as PlayersBid
                    ]]
                ]);
            }
            next();
        });

        thousand.init();

        const actionsResult = [
            thousand.pass('adam'),
            thousand.bid('alan', 120),
            thousand.bid('adam', 130),
            thousand.pass('pic')
        ];
        
        should(actionsResult).be.deepEqual([
            true,
            true,
            false, // adam can't bid 130, as it's not his turn!
            true
        ]);

        // the next step after all is sharing stock phase
        should(thousand.getState().phase).be.equal(Phase.SHARE_STOCK);
    });
});
