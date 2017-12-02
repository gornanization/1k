import * as should from 'should';
import { createCard, createCards } from '../../src/helpers/cards.helpers';
import { Game, Phase, Battle } from '../../src/game.interfaces';
import { canThrowCard, isTrickFinished, isBattleFinished } from '../../src/validators/battle.validator';
import { throwCard } from '../../src/game.actions';

describe('battle validator', () => {
    beforeEach(() => {
        this.state = {
            settings: {
                barrelPointsLimit: 880
            },
            phase: Phase.BATTLE_IN_PROGRESS,
            players: [{ id: 'adam', battlePoints: [] }, { id: 'pic', battlePoints: [] }, { id: 'alan', battlePoints: [] }],
            deck: [],
            stock: [],
            bid: [
                { player: 'pic', bid: 110, pass: false },
                { player: 'adam', bid: 100, pass: false }
            ],
            cards: {
                alan: [
                    createCard('9♥'),
                    createCard('K♥'),
                    createCard('Q♦')
                ],
                pic: [
                    createCard('A♥'),
                    createCard('J♥')
                ]
            },
            battle: {
                trumpAnnouncements: [],
                leadPlayer: 'pic',
                trickCards: [],
                wonCards: {
                    adam: [],
                    alan: [],
                    pic: []
                }
            } as Battle
        } as Game;
    });

    describe('isTrickFinished', () => {
        it('returns true, for 3 cards on table', () => {
            // assign
            const currentState = this.state;
            this.state.battle.trickCards = [
                createCard('9♣'),
                createCard('9♣'),
                createCard('9♣')
            ];
            // act
            const isTrickFinishedd = isTrickFinished(currentState);
            // assert
            should(isTrickFinishedd).be.equal(true);
        });
        it('returns false, for less than 3 cards on table', () => {
            // assign
            const currentState = this.state;
            this.state.battle.trickCards = [
                createCard('9♣'),
                createCard('9♣')
            ];
            // act
            const isTrickFinishedd = isTrickFinished(currentState);
            // assert
            should(isTrickFinishedd).be.equal(false);
        });        
    });

    xdescribe('canThrowCard', () => {
        describe('permits user to throw card', () => {
            it('while in uncorrect game phase', () => {
                // assign
                const currentState: Game = this.state;
                currentState.phase = Phase.BATTLE_FINISHED;
                // act
                const action = throwCard(currentState.cards['pic'][0], 'pic');
                //assert
                should(canThrowCard(currentState, action)).be.equal(false);
            });

            it('while player does not have specific card', () => {
                // assign
                const currentState: Game = this.state;
                // act
                const action = throwCard(currentState.cards['alan'][0], 'pic');
                //assert
                should(canThrowCard(currentState, action)).be.equal(false);
            });

            it('when not in turn', () => {
                // assign
                const currentState: Game = this.state;
                // act
                const action = throwCard(currentState.cards['alan'][0], 'alan');
                //assert
                should(canThrowCard(currentState, action)).be.equal(false);
            });

            it('', () => {
                
            })
        });
    });
    describe('isBattleFinished', () => {
        it('returns true, when all players have 8 cards', () => {
            // assign
            const currentState: Game = this.state;
            currentState.battle.wonCards = {
               'alan': [ ...createCards(8) ],
               'adam': [ ...createCards(8) ],
               'pic': [ ...createCards(8) ]
            };
            // act
            const battleFinished = isBattleFinished(currentState);
            //assert
            should(battleFinished).be.equal(true);
       });

        it('returns false, when all players do not have 8 cards', () => {
            // assign
            const currentState: Game = this.state;
            currentState.battle.wonCards = {
            'alan': [ ...createCards(8) ],
            'adam': [ ...createCards(5) ],
            'pic': [ ]
            };
            // act
            const battleFinished = isBattleFinished(currentState);
            //assert
            should(battleFinished).be.equal(false);
        });
    });
});