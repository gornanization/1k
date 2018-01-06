import { Thousand, Game, Phase, Player, PlayersBid, Card, CardPattern } from '../../src/game.interfaces';
import { initializeGame } from '../../src/game';
import * as should from 'should';
import { createCardPatterns } from '../../src/helpers/cards.helpers';
import { SHARE_STOCK, declareBomb, DECLARE_BOMB } from '../../src/game.actions';

describe('share stock cards', () => {
    it('transits to BATTLE_START', () => {
        const history = [];

        const initState: Game = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.SHARE_STOCK,
            players: [
                { id: 'adam', battlePoints: [120, null] },
                { id: 'alan', battlePoints: [0, 60] },
                { id: 'pic', battlePoints: [0, 60] }
            ],
            deck: [],
            stock: [],
            bid: [
                { player: 'pic', bid: 0, pass: true } as PlayersBid,
                { player: 'alan', bid: 120, pass: false } as PlayersBid,
                { player: 'adam', bid: 0, pass: true } as PlayersBid,
                { player: 'pic', bid: 100, pass: false } as PlayersBid
            ],
            cards: {
                'adam': createCardPatterns(7),
                'alan': createCardPatterns(10),
                'pic': createCardPatterns(7),
            },
            battle: null
        };

        const thousand: Thousand = initializeGame(initState);

        thousand.events.addListener('phaseUpdated', next => {
            const state: Game = thousand.getState();

            history.push(state.phase);

            if (state.phase === Phase.BATTLE_START) {
                should(history).be.deepEqual([                  
                    Phase.SHARE_STOCK,
                    Phase.SHARE_STOCK,
                    Phase.SHARE_STOCK,
                    Phase.BATTLE_START
                ]);
            }
            next();
        });

        thousand.init();
        
        const actionsResult = [
            thousand.shareStock('alan', getFirstPlayerCard('alan'), 'adam'),
            thousand.shareStock('adam', getFirstPlayerCard('adam'), 'pic'),
            thousand.shareStock('alan', getFirstPlayerCard('alan'), 'pic')
        ];

        should(actionsResult).be.deepEqual([
            true,
            false,
            true
        ]);

        function getFirstPlayerCard(player): CardPattern {
            return thousand.getState().cards[player][0];
        }
    });

    it('transits to BOMB_DELCARED', () => {
        const history = [];

        const initState: Game = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.SHARE_STOCK,
            players: [
                { id: 'adam', battlePoints: [120, null] },
                { id: 'alan', battlePoints: [0, 60] },
                { id: 'pic', battlePoints: [0, 60] }
            ],
            deck: [],
            stock: [],
            bid: [
                { player: 'pic', bid: 0, pass: true } as PlayersBid,
                { player: 'alan', bid: 120, pass: false } as PlayersBid,
                { player: 'adam', bid: 0, pass: true } as PlayersBid,
                { player: 'pic', bid: 100, pass: false } as PlayersBid
            ],
            cards: {
                'adam': createCardPatterns(7),
                'alan': createCardPatterns(10),
                'pic': createCardPatterns(7),
            },
            battle: null
        };

        const thousand: Thousand = initializeGame(initState);

        thousand.events.addListener('phaseUpdated', next => {
            const state: Game = thousand.getState();
            
            history.push(state.phase);

            if (state.phase === Phase.BOMB_DECLARED) {
                should(history).be.deepEqual([                  
                    Phase.SHARE_STOCK,
                    Phase.BOMB_DECLARED
                ]);
            }
            next();
        });

        thousand.init();
        
        const actionsResult = [
            thousand.declareBomb('pic'),
            thousand.declareBomb('alan'),
        ];

        should(actionsResult).be.deepEqual([
            false,
            true
        ]);
    });    
});
