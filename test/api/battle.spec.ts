import { Thousand, Game, Phase, Player, PlayersBid, Battle } from '../../src/game.interfaces';
import { initializeGame } from '../../src/game';
import * as should from 'should';
import { createCards, createCard } from '../../src/helpers/cards.helpers';
import { SHARE_STOCK } from '../../src/game.actions';


describe.only('battle API', () => {
    it('manages first trick in battle', () => {
        const history = [];
        const initState: Game = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
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
                'adam': createCards(['9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', '9♠', '10♠']),
                'alan': createCards(['9♦', '10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠', 'Q♠']),
                'pic':  createCards(['9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'K♠', 'A♠'])
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

        const thousand: Thousand = initializeGame(initState);

        thousand.events.addListener('phaseUpdated', next => {
            const state: Game = thousand.getState();
            history.push(state.phase);
            next();
        });

        thousand.init();

        const actionsResult = [
            thousand.throwCard(createCard('9♣'), 'pic'),
            thousand.throwCard(createCard('9♣'), 'alan'), // invalid action
            thousand.throwCard(createCard('9♥'), 'adam'),
            thousand.throwCard(createCard('9♦'), 'alan'),
        ];
        const state = thousand.getState();
        
        should(actionsResult).be.deepEqual([
            true,
            false,
            true,
            true
        ]);

        should(history).be.deepEqual([
            Phase.BATTLE_START,
            Phase.TRICK_START,
            Phase.TRICK_IN_PROGRESS, // initialization of phase
            Phase.TRICK_IN_PROGRESS, // pic throws card
            Phase.TRICK_IN_PROGRESS, // adam throws card
            Phase.TRICK_IN_PROGRESS, // alan throws card
            Phase.TRICK_FINISHED,
            Phase.ASSIGN_TRICK_CARDS, //cards assigned to pic
            Phase.TRICK_START,
            Phase.TRICK_IN_PROGRESS //waiting for player action
        ]);

        should(state.battle).be.deepEqual({
            trumpAnnouncements: [],
            leadPlayer: 'pic',
            trickCards: [],
            wonCards: {
                adam: [],
                pic: createCards(['9♣', '9♥', '9♦']),
                alan: []
            }
        } as Battle);
    });
    
    it('qqqq', () => {
        const history = [];
        const initState: Game = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
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
                'adam': createCards(['9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', '9♠']), // 7 cards
                'alan': createCards(['10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠']), // 6 cards
                'pic':  createCards(['9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'A♠']), // 7 cards
            },
            battle: {
                trumpAnnouncements: [],
                leadPlayer: 'alan',
                trickCards: [
                    createCard('9♦')
                ],
                wonCards: {
                    adam: [],
                    pic: [], // 3 cards
                    alan: createCards(['K♠','Q♠', '10♠'])
                }
            } as Battle
        };

        const thousand: Thousand = initializeGame(initState);

        thousand.events.addListener('phaseUpdated', next => {
            const state: Game = thousand.getState();
            history.push(state.phase);
            next();
        });

        thousand.init();

        const actionsResult = [
            thousand.throwCard(createCard('A♠'), 'pic'),
        ];
        const state = thousand.getState();
        
        should(actionsResult).be.deepEqual([
            true
        ]);

        should(history).be.deepEqual([
            Phase.TRICK_IN_PROGRESS, // initialization of phase
            Phase.TRICK_IN_PROGRESS, // alan throws card
        ]);
    });    
});
