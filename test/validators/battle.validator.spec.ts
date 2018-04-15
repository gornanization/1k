import * as should from 'should';
import { createCardPatterns } from '../../src/helpers/cards.helpers';
import { Game, Phase, Battle, TrumpAnnouncement, Suit } from '../../src/game.interfaces';
import { canThrowCard, isTrickFinished, isBattleFinished } from '../../src/validators/battle.validator';
import { throwCard } from '../../src/game.actions';

describe('battle validator', () => {
    beforeEach(() => {
        this.state = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 18
            },
            phase: Phase.TRICK_IN_PROGRESS,
            players: [{ id: 'adam', battlePoints: [] }, { id: 'pic', battlePoints: [] }, { id: 'alan', battlePoints: [] }],
            deck: [],
            stock: [],
            bid: [
                { player: 'pic', bid: 110, pass: false },
                { player: 'adam', bid: 100, pass: false }
            ],
            cards: {
                adam: [],
                alan: ['9♥','K♥','Q♦'],
                pic: ['A♥','J♥']
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
            const currentState: Game = this.state;
            this.state.battle.trickCards = ['9♣','9♣','9♣'];
            // act
            const isTrickFinishedd = isTrickFinished(currentState);
            // assert
            should(isTrickFinishedd).be.equal(true);
        });
        it('returns false, for less than 3 cards on table', () => {
            // assign
            const currentState: Game = this.state;
            this.state.battle.trickCards = [ '9♣', '9♣' ];
            // act
            const isTrickFinishedd = isTrickFinished(currentState);
            // assert
            should(isTrickFinishedd).be.equal(false);
        });        
    });

    describe('canThrowCard', () => {
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

            
        });
        describe('when first card on table', () => {
            beforeEach(() => {
                this.state.battle.trickCards = ['A♠'];
            });
            describe('and no trump suit specified', () => {
                it('player can only select card witch matching color', () => {
                    // assign
                    const currentState: Game = this.state;
                    currentState.cards['alan'] = ['A♥','J♦','9♦','K♣','J♠'];
                    // act
                    const action = throwCard('K♣', 'alan');
                    //assert
                    should(canThrowCard(currentState, action)).be.equal(false);
                });
                it('player can choose whatever, when does not have matching color card', () => {
                    // assign
                    const currentState: Game = this.state;
                    currentState.cards['alan'] = ['A♥','J♦','9♦','K♣'];
                    // act
                    const action = throwCard('K♣', 'alan');
                    //assert
                    should(canThrowCard(currentState, action)).be.equal(true);
                });
            });
            describe('and trump suit specified', () => {
                beforeEach(() => {
                    const currentState: Game = this.state;
                    currentState.battle.trumpAnnouncements = [
                        { player: 'adam', suit: Suit.Heart }
                    ] as TrumpAnnouncement[];
                });
                it('can throw card with suit matching lead card', () => {
                    // assign
                    const currentState: Game = this.state;
                    currentState.cards['alan'] = ['A♥','J♦','9♦','K♣','J♠'];
                    // act
                    const action = throwCard('J♠', 'alan');
                    //assert
                    should(canThrowCard(currentState, action)).be.equal(true);
                });
                it('can throw card with suit matching trump card', () => {
                    // assign
                    const currentState: Game = this.state;
                    currentState.cards['alan'] = ['A♥','J♦','9♦','K♣','J♠'];
                    // act
                    const action = throwCard('A♥', 'alan');
                    //assert
                    should(canThrowCard(currentState, action)).be.equal(true);
                });
                it('can throw anything, when no lead card and trump suit card avaialble', () => {
                    // assign
                    const currentState: Game = this.state;
                    currentState.cards['alan'] = ['J♦','9♦','K♣'];
                    // act
                    const action = throwCard('9♦', 'alan');
                    //assert
                    should(canThrowCard(currentState, action)).be.equal(true);
                });
                it('is not forced to throw trump suit, when no lead card suit card available', () => {
                    // assign
                    const currentState: Game = this.state;
                    currentState.cards['alan'] = ['J♦','9♦','K♣','A♥'];
                    // act
                    const action = throwCard('9♦', 'alan');
                    //assert
                    should(canThrowCard(currentState, action)).be.equal(true);
                });                
            });
        });
    });
    describe('isBattleFinished', () => {
        it('returns true, when all players have 8 cards', () => {
            // assign
            const currentState: Game = this.state;
            currentState.battle.wonCards = {
               'alan': createCardPatterns(8),
               'adam': createCardPatterns(8),
               'pic': createCardPatterns(8)
            };
            // act
            const battleFinished = isBattleFinished(currentState);
            //assert
            should(battleFinished).be.equal(true);
       });
       it('returns true, when one player have 24 cards', () => {
        // assign
        const currentState: Game = this.state;
        currentState.battle.wonCards = {
           'alan': createCardPatterns(24),
           'adam': [],
           'pic': []
        };
        // act
        const battleFinished = isBattleFinished(currentState);
        //assert
        should(battleFinished).be.equal(true);
   });
        it('returns false, when total number of wonCards is less than 24', () => {
            // assign
            const currentState: Game = this.state;
            currentState.battle.wonCards = {
            'alan': createCardPatterns(8),
            'adam': createCardPatterns(5),
            'pic': []
            };
            // act
            const battleFinished = isBattleFinished(currentState);
            //assert
            should(battleFinished).be.equal(false);
        });
    });
});