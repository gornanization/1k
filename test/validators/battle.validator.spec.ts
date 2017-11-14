import * as should from 'should';
import { createCard } from '../../src/helpers/cards.helpers';
import { Game, Phase, Battle } from '../../src/game.interfaces';
import { canThrowCard } from '../../src/validators/battle.validator';
import { throwCard } from '../../src/game.actions';

describe('battle validator', () => {
    beforeEach(() => {
        this.state = {
            phase: Phase.BATTLE_IN_PROGRESS,
            players: [{ id: 'adam' }, { id: 'pic' }, { id: 'alan' }],
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
});