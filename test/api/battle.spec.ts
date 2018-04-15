import { Thousand, Game, Phase, Player, PlayersBid, Battle } from '../../src/game.interfaces';
import { initializeGame } from '../../src/game';
import * as should from 'should';
import { createCardPatterns } from '../../src/helpers/cards.helpers';
import { SHARE_STOCK } from '../../src/game.actions';
import { getWinner } from '../../src/helpers/players.helpers';

describe('battle API', () => {
    it('manages first trick in battle', () => {
        const history = [];
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

        const thousand: Thousand = initializeGame(initState);

        thousand.events.addListener('phaseUpdated', next => {
            const state: Game = thousand.getState();
            history.push(state.phase);
            next();
        });

        thousand.init();

        const actionsResult = [
            thousand.throwCard('9♣', 'pic'),
            thousand.throwCard('9♣', 'alan'), // invalid action
            thousand.throwCard('9♥', 'adam'),
            thousand.throwCard('9♦', 'alan'),
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
                pic: ['9♣', '9♥', '9♦'],
                alan: []
            }
        } as Battle);
    });
    
    it('manages case in the middle of a trick', () => {
        const history = [];
        const initState: Game = {
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
                'adam': ['9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', '9♠'], // 7 cards
                'alan': ['10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠'], // 6 cards
                'pic':  ['9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'A♠'], // 7 cards
            },
            battle: {
                trumpAnnouncements: [],
                leadPlayer: 'alan',
                trickCards: [ '9♦' ],
                wonCards: {
                    adam: [],
                    pic: [], 
                    alan: ['K♠','Q♠', '10♠'] // 3 cards
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
            thousand.throwCard('A♠', 'pic'),
        ];
        const state = thousand.getState();
        
        should(actionsResult).be.deepEqual([
            true
        ]);

        should(history).be.deepEqual([
            Phase.TRICK_IN_PROGRESS, // initialization of phase
            Phase.TRICK_IN_PROGRESS // alan throws card
        ]);
    });

    it('manages case for finished battle', () => {
        const history = [];
        const initState: Game = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 0
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
                'adam': [],
                'alan': ['10♦'],
                'pic':  [],
            },
            battle: {
                trumpAnnouncements: [],
                leadPlayer: 'pic',
                trickCards: [ 'A♦', '9♦' ],
                wonCards: {
                    adam: [],
                    pic: [
                        '9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', 
                        '9♠', '10♠', 'J♠', 'Q♠', 'K♠', 'A♠',
                                     'J♦', 'Q♦', 'K♦',  
                        '9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣'
                    ]
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
            thousand.throwCard('10♦', 'alan'),
        ];
        const state = thousand.getState();
        
        should(actionsResult).be.deepEqual([
            true
        ]);
        should(history).be.deepEqual([
            Phase.TRICK_IN_PROGRESS, // initialization of phase
            Phase.TRICK_IN_PROGRESS, // alan throws 10♦ card
            Phase.TRICK_FINISHED,
            Phase.ASSIGN_TRICK_CARDS,
            Phase.BATTLE_FINISHED,
            Phase.BATTLE_RESULTS_ANNOUNCEMENT,
            Phase.DEALING_CARDS_START,
            Phase.DEALING_CARDS_FINISHED,
            Phase.BIDDING_START,
            Phase.BIDDING_IN_PROGRESS
        ]);
        should(state.players).be.deepEqual([
            { id: 'adam', battlePoints: [120, null, 0] },
            { id: 'alan', battlePoints: [0, 60, 0] },
            { id: 'pic', battlePoints: [0, 60, 100] }
        ]);
    });

    it('manages case for finished game', () => {
        const history = [];
        const initState: Game = {
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
                { id: 'pic', battlePoints: [0, 900] }
            ],
            deck: [],
            stock: [],
            bid: [
                { player: 'alan', bid: 0, pass: true },
                { player: 'adam', bid: 0, pass: true },
                { player: 'pic', bid: 100, pass: false }
            ] as PlayersBid[],
            cards: {
                'adam': [],
                'alan': ['10♦'],
                'pic':  []
            },
            battle: {
                trumpAnnouncements: [],
                leadPlayer: 'pic',
                trickCards: [ 'A♦', '9♦' ],
                wonCards: {
                    adam: [],
                    pic: [
                        '9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', 
                        '9♠', '10♠', 'J♠', 'Q♠', 'K♠', 'A♠',
                                     'J♦', 'Q♦', 'K♦',
                        '9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣'
                    ]
                }
            } as Battle
        };

        const thousand: Thousand = initializeGame(initState);

        thousand.events.addListener('phaseUpdated', next => {
            const state: Game = thousand.getState();
            history.push(state.phase);
            next();
        });

        thousand.events.addListener('action', (action, next) => {
            //perform an action animation
            next();
        });

        thousand.init();

        const actionsResult = [
            thousand.throwCard('10♦', 'alan'),
        ];
        const state = thousand.getState();
        
        should(actionsResult).be.deepEqual([
            true
        ]);
        should(history).be.deepEqual([
            Phase.TRICK_IN_PROGRESS, // initialization of phase
            Phase.TRICK_IN_PROGRESS, // alan throws 10♦ card
            Phase.TRICK_FINISHED,
            Phase.ASSIGN_TRICK_CARDS,
            Phase.BATTLE_FINISHED,
            Phase.BATTLE_RESULTS_ANNOUNCEMENT,
            Phase.GAME_FINISHED
        ]);
        should(state.players).be.deepEqual([
            { id: 'adam', battlePoints: [120, null, 0] },
            { id: 'alan', battlePoints: [0, 60, 0] },
            { id: 'pic', battlePoints: [0, 900, 100] }
        ]);

        should(getWinner(state.players).id).be.equal('pic');
    });        
});
