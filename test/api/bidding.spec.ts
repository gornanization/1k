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

            const expectedFinallBiddingState = [
                { player: 'pic', bid: 0, pass: true } as PlayersBid,
                { player: 'alan', bid: 120, pass: false } as PlayersBid,
                { player: 'adam', bid: 0, pass: true } as PlayersBid,
                { player: 'pic', bid: 100, pass: false } as PlayersBid
            ];

            if (state.phase === Phase.SHARE_STOCK) {
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
                    [Phase.BIDDING_IN_PROGRESS, expectedFinallBiddingState],
                    [Phase.BIDDING_FINISHED, expectedFinallBiddingState],
                    [Phase.FLIP_STOCK, expectedFinallBiddingState],
                    [Phase.ASSIGN_STOCK, expectedFinallBiddingState],
                    [Phase.SHARE_STOCK, expectedFinallBiddingState]
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
    });

    it('skips FLIP_STOCK phase, when all bidders rejected to bid higher than 100', () => {

        const history = [];
        const initState: Game = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.BIDDING_FINISHED,
            players: [
                { id: 'adam', battlePoints: [120, null] },
                { id: 'alan', battlePoints: [0, 60] },
                { id: 'pic', battlePoints: [0, 60] }
            ],
            deck: [],
            stock: [
                ...createCards(3)
            ],
            bid: [
                { player: 'alan', bid: 0, pass: true },
                { player: 'adam', bid: 0, pass: true },
                { player: 'pic', bid: 100, pass: false }
            ] as PlayersBid[],
            cards: {
                'adam': createCards(7),
                'alan': createCards(7),
                'pic': createCards(7)
            },
            battle: null
        }


        const thousand: Thousand = initializeGame(initState);
        
        thousand.events.addListener('phaseUpdated', next => {
            const state: Game = thousand.getState();
           
            
            history.push(state.phase);

            if (state.phase === Phase.SHARE_STOCK) {
                should(history).be.deepEqual([
                    Phase.BIDDING_FINISHED,
                    Phase.ASSIGN_STOCK,
                    Phase.SHARE_STOCK
                ]);
            }

            next();

        });
        
        thousand.init();
    });
});
