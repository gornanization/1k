import * as should from 'should';

import { Game, Phase } from '../../src/game.interfaces';
import { PlayersBid, Battle } from '../../src/game.interfaces';
import { loadStateFromText, saveStateToText } from '../../src/helpers/game.helpers';

describe('game helpers', () => {
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
    });
});
