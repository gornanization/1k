import { Thousand, Game, Phase, Player, Battle, PlayersBid, CardPattern } from '../src/game.interfaces';
import { initializeGame } from '../src/game';
import * as should from 'should';
import { getPreferredAction } from '../src/bot';
import { createCardPatterns } from '../src/helpers/cards.helpers';

describe('bot', () => {
    describe('for throwing a card case', () => {
        let initState: Game = null
        beforeEach(() => {
            initState = {
                settings: {
                    permitBombOnBarrel: true,
                    maxBombs: 2,
                    barrelPointsLimit: 880,
                    shuffleAgainIfPointsCountLessThan: 18
                },
                phase: Phase.TRICK_IN_PROGRESS,
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
                    'adam': ['9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', '9♠'],
                    'alan': ['10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠'],
                    'pic': ['9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'A♠'],
                },
                battle: {
                    trumpAnnouncements: [],
                    leadPlayer: 'alan',
                    trickCards: ['9♦'],
                    wonCards: {
                        adam: [],
                        pic: [],
                        alan: ['K♠', 'Q♠', '10♠']
                    }
                } as Battle
            }
        })

        it('retruns preferred throw action', () => {
            should(getPreferredAction('pic', initState))
                .be.deepEqual({type: 'throwCard', args: ['9♣', 'pic']});
        })

        it('retruns null, when no player turn', () => {
            should(getPreferredAction('alan', initState))
                .be.equal(null);
        })
    })

    describe('for bidding case', () => {
        let initState: Game = null
        beforeEach(() => {
            initState = {
                settings: {
                    permitBombOnBarrel: true,
                    maxBombs: 2,
                    barrelPointsLimit: 880,
                    shuffleAgainIfPointsCountLessThan: 18
                },
                phase: Phase.BIDDING_IN_PROGRESS,
                players: [
                    { id: 'adam', battlePoints: [120, null] },
                    { id: 'alan', battlePoints: [0, 60] },
                    { id: 'pic', battlePoints: [0, 60] }
                ],
                deck: [],
                stock: [],
                bid: [
                    { player: 'pic', bid: 100, pass: false }
                ] as PlayersBid[],
                cards: {
                    'adam': ['9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', '9♠'],
                    'alan': ['10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠', '9♠'],
                    'pic': ['9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'A♠'],
                },
                battle: null
            }
        })

        it('retruns pass action', () => {
            should(getPreferredAction('adam', initState))
                .be.deepEqual({type: 'pass', args: ['adam']});
        })

        it('retruns null, when no player turn', () => {
            should(getPreferredAction('alan', initState))
                .be.equal(null);
        })
    })

    describe('for sharing stock case', () => {
        let initState: Game = null
        beforeEach(() => {
            initState = {
                settings: {
                    permitBombOnBarrel: true,
                    maxBombs: 2,
                    barrelPointsLimit: 880,
                    shuffleAgainIfPointsCountLessThan: 18
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
            }
        })

        it('retruns share stock action', () => {
            const alanFirstCard: CardPattern = initState.cards['alan'][0]
            should(getPreferredAction('alan', initState))
                .be.deepEqual({type: 'shareStock', args: ['alan', alanFirstCard, 'adam']});
        })

        it('retruns null, when no player turn', () => {
            should(getPreferredAction('adam', initState))
                .be.equal(null);
        })
    })
})
