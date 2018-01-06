import * as should from 'should';
import { Game, Phase, Card, Player, PlayersBid, Battle } from '../../src/game.interfaces';
import { createCardPatterns } from '../../src/helpers/cards.helpers';
import { canShareStock, isSharingStockFinished } from '../../src/validators/stock.validator';
import { ShareStock, declareBomb, bid } from '../../src/game.actions';
import { isGameFinished, canDeclareBomb } from '../../src/validators/game.validators';
import * as _ from 'lodash';

describe('game validator', () => {
    beforeEach(() => {
        this.state = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.SHARE_STOCK,
            players: [
                { id: 'adam', battlePoints: [] },
                { id: 'pic', battlePoints: [] },
                { id: 'alan', battlePoints: [] }
            ] as Player[],
            deck: [],
            stock: [],
            bid: [] as PlayersBid[],
            cards: {
                alan: [],
                pic: [],
                adam: []
            },
            battle: null
        } as Game;
    });

    describe('isGameFinished', () => {
        it('returns false for battlePoints less than 1000', () => {
            // assign
            const currentState = this.state;
            currentState.players[0].battlePoints = [];
            currentState.players[1].battlePoints = [100, null, 120];
            currentState.players[1].battlePoints = [990, null];
            // act
            const isFinished = isGameFinished(currentState);
            //assert
            should(isFinished).be.equal(false);
        });

        it('returns true, when result equal 1000', () => {
            // assign
            const currentState = this.state;
            currentState.players[0].battlePoints = [100, 100, 100, 100, 100, 100, 100, 100, 100, null, 100];
            // act
            const isFinished = isGameFinished(currentState);
            //assert
            should(isFinished).be.equal(true);
        });

        it('returns true, when result more than 1000', () => {
            // assign
            const currentState = this.state;
            currentState.players[0].battlePoints = [100, 100, 100, 100, 100, 100, 100, 100, 100, null, 110];
            // act
            const isFinished = isGameFinished(currentState);
            //assert
            should(isFinished).be.equal(true);
        });
    });

    describe('canDeclareBomb', () => {
        beforeEach(() => {
            const currentState: Game = this.state;
            currentState.phase = Phase.SHARE_STOCK;
            currentState.bid = [
                { player: 'alan', bid: 0, pass: true },
                { player: 'pic', bid: 0, pass: true },
                { player: 'adam', bid: 100, pass: false }
            ] as PlayersBid[];
        });
        it('not allowed, when in phases', () => {
            // assign
            const notAllowedStates = [
                Phase.REGISTERING_PLAYERS_START, Phase.REGISTERING_PLAYERS_IN_PROGRESS,
                Phase.REGISTERING_PLAYERS_FINISHED, Phase.DEALING_CARDS_START,
                Phase.DEALING_CARDS_IN_PROGRESS, Phase.DEALING_CARDS_FINISHED,
                Phase.BIDDING_START, Phase.BIDDING_IN_PROGRESS, Phase.BIDDING_FINISHED,
                Phase.TRICK_FINISHED, Phase.FLIP_STOCK, Phase.BATTLE_FINISHED,
                Phase.BATTLE_RESULTS_ANNOUNCEMENT, Phase.ASSIGN_TRICK_CARDS,
                Phase.GAME_FINISHED
            ];
            const currentState: Game = this.state;
            _.each(notAllowedStates, (notAllowedPhase) => {
                currentState.phase = notAllowedPhase;
                // act
                const canDeclare = canDeclareBomb(currentState, declareBomb('adam'));
                //assert
                should(canDeclare).be.equal(false);
            });
        });

        it('allowed for TRICK_START', () => {
            const currentState: Game = this.state;
            currentState.phase = Phase.TRICK_START;
            // act
            const canDeclare = canDeclareBomb(currentState, declareBomb('adam'));
            //assert
            should(canDeclare).be.equal(true);
        });

        it('not allowed for TRICK_START, when player is not a bid winner', () => {
            const currentState: Game = this.state;
            currentState.phase = Phase.TRICK_START;
            // act
            const canDeclare = canDeclareBomb(currentState, declareBomb('alan'));
            //assert
            should(canDeclare).be.equal(false);
        });

        it('not allowed for TRICK_START, when player have already declared more bomb that permited', () => {
            const currentState: Game = this.state;
            currentState.phase = Phase.TRICK_START;
            const adam = currentState.players[0];
            adam.battlePoints = [0, 0, 0, null, null, 1];
            // act
            const canDeclare = canDeclareBomb(currentState, declareBomb('adam'));
            //assert
            should(canDeclare).be.equal(false);
        });        

        it('not allowed for TRICK_START when on barrel, when permissionEnabled', () => {
            const currentState: Game = this.state;
            currentState.phase = Phase.TRICK_START;
            const adam = currentState.players[0];
            adam.battlePoints = [880];
            // act
            const canDeclare = canDeclareBomb(currentState, declareBomb('adam'));
            //assert
            should(canDeclare).be.equal(false);
        });

        it('allowed for TRICK_START when on barrel, when permission disabled', () => {
            const currentState: Game = this.state;
            currentState.phase = Phase.TRICK_START;
            const adam = currentState.players[0];
            adam.battlePoints = [880];
            currentState.settings.permitBombOnBarrel = false;
            // act
            const canDeclare = canDeclareBomb(currentState, declareBomb('adam'));
            //assert
            should(canDeclare).be.equal(true);
        });

        it('allowed for TRICK_IN_PROGRESS', () => {
            const currentState: Game = this.state;
            currentState.phase = Phase.TRICK_IN_PROGRESS;
            currentState.battle = {
                trumpAnnouncements: [],
                leadPlayer: 'adam',
                trickCards: [],
                wonCards: {
                    'adam': [],
                    'alan': [],
                    'pic': []
                }
            } as Battle;
            // act
            const canDeclare = canDeclareBomb(currentState, declareBomb('adam'));
            //assert
            should(canDeclare).be.equal(true);
        });

        it('not allowed for TRICK_IN_PROGRESS, when someone else is lead player', () => {
            const currentState: Game = this.state;
            currentState.phase = Phase.TRICK_IN_PROGRESS;
            currentState.battle = {
                trumpAnnouncements: [],
                leadPlayer: 'pic',
                trickCards: [],
                wonCards: {
                    'adam': [],
                    'alan': [],
                    'pic': []
                }
            } as Battle;
            // act
            const canDeclare = canDeclareBomb(currentState, declareBomb('adam'));
            //assert
            should(canDeclare).be.equal(false);
        });
        
        it('not allowed for TRICK_IN_PROGRESS, when cards on table', () => {
            const currentState: Game = this.state;
            currentState.phase = Phase.TRICK_IN_PROGRESS;
            currentState.battle = {
                trumpAnnouncements: [],
                leadPlayer: 'adam',
                trickCards: ['J♠'],
                wonCards: {
                    'adam': [],
                    'alan': [],
                    'pic': []
                }
            } as Battle;
            // act
            const canDeclare = canDeclareBomb(currentState, declareBomb('adam'));
            //assert
            should(canDeclare).be.equal(false);
        });

        it('not allowed for TRICK_IN_PROGRESS, when first trick already finished', () => {
            const currentState: Game = this.state;
            currentState.phase = Phase.TRICK_IN_PROGRESS;
            currentState.battle = {
                trumpAnnouncements: [],
                leadPlayer: 'adam',
                trickCards: [
                ],
                wonCards: {
                    'adam': [
                        ...createCardPatterns(3)
                    ],
                    'alan': [],
                    'pic': []
                }
            } as Battle;
            // act
            const canDeclare = canDeclareBomb(currentState, declareBomb('adam'));
            //assert
            should(canDeclare).be.equal(false);
        });        
    });
});


