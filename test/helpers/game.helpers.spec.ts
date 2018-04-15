import * as should from 'should';

import { Game, Phase } from '../../src/game.interfaces';
import { PlayersBid, Battle } from '../../src/game.interfaces';
import { loadStateFromText, saveStateToText, extendStateWithDefaults } from '../../src/helpers/game.helpers';

describe('game helpers', () => {
    describe('extendStateWithDefaults', () => {
        const state = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 18
            },
            phase: Phase.BATTLE_START,
            players: [
                { id: 'adam' },
                { id: 'alan' },
                { id: 'pic' }
            ],
            deck: [],
            stock: [],
            bid: [
                { player: 'alan', bid: 0, pass: true },
                { player: 'adam', bid: 0, pass: true },
                { player: 'pic', bid: 100, pass: false }
            ] as PlayersBid[],
            battle: {
            } as Battle
        };

        it('sets default state as undefined', () => {
            should(extendStateWithDefaults(null)).be.equal(undefined)
        })

        it('prepares cards object', () => {
            should(extendStateWithDefaults(state).cards).be.deepEqual({
                adam: [],
                alan: [],
                pic: []
            })            
        })

        it('fills battlePoints when not available', () => {
            should(extendStateWithDefaults(state).players).be.deepEqual([
                { id: 'adam', battlePoints: [] },
                { id: 'alan', battlePoints: [] },
                { id: 'pic', battlePoints: [] }
            ])       
        })

        it('sets trickCards when not available', () => {
            should(extendStateWithDefaults(state).battle.trickCards).be.deepEqual([])
        })

        it('sets trumpAnnouncements when not available', () => {
            should(extendStateWithDefaults(state).battle.trumpAnnouncements).be.deepEqual([])
        })

        it('sets wonCards when not available', () => {
            should(extendStateWithDefaults(state).battle.wonCards).be.deepEqual({
                adam: [],
                alan: [],
                pic: []
            })            
        })
    })

    describe('saveStateToText & loadStateFromText', () => {
        it('saves and loads state from text', () => {
            const initState: Game = {
                settings: {
                    permitBombOnBarrel: true,
                    maxBombs: 2,
                    barrelPointsLimit: 880,
                    shuffleAgainIfPointsCountLessThan: 18
                },
                phase: Phase.BATTLE_START,
                players: [
                    { id: 'adam', battlePoints: [120, null] },
                    { id: 'alan', battlePoints: [0, 60] },
                    { id: 'pic', battlePoints: [0, 60] }
                ],
                deck: [],
                stock: [],
                bid: [
                    { player: 'alan', bid: 0, pass: true },
                    { player: 'adam', bid: 0, pass: true },
                    { player: 'pic', bid: 100, pass: false }
                ] as PlayersBid[],
                cards: {
                    'adam': ['9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', '9♠', '10♠'],
                    'alan': ['9♦', '10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠', 'Q♠'],
                    'pic':  ['9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'K♠', 'A♠']
                },
                battle: {
                    trumpAnnouncements: [],
                    leadPlayer: 'pic',
                    trickCards: [],
                    wonCards: {
                        adam: [],
                        pic: [],
                        alan: []
                    }
                } as Battle
            };
            console.log(saveStateToText(initState));
            console.log(saveStateToText(initState).length);
            should(initState).be.deepEqual(loadStateFromText(saveStateToText(initState)));
        });

        it('returns null for loadStateFromText incorrect input', () => {
            should(loadStateFromText('incorrect input')).be.equal(null);
        })
    });
});
