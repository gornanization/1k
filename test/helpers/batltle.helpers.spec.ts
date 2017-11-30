import * as should from 'should';
import { Game, Phase, Battle, Card, TrumpAnnouncement, Suit } from '../../src/game.interfaces';
import { createCard } from '../../src/helpers/cards.helpers';
import { isBiddingFinished, canBid } from '../../src/validators/bid.validator';
import { bid, Bid } from '../../src/game.actions';
import { getNextTrickTurn, calculatePointsByPlayer, getTrickWinner } from '../../src/helpers/battle.helpers';

describe('battle helpers', () => {
    beforeEach(() => {
        this.state = {
            settings: {
                barrelPointsLimit: 880
            },
            phase: Phase.BIDDING_IN_PROGRESS,
            players: [{ id: 'adam', battlePoints: [] }, { id: 'pic', battlePoints: [] }, { id: 'alan', battlePoints: [] }],
            deck: [],
            stock: [],
            bid: [],
            cards: {},
            battle: {
                trumpAnnouncements: [],
                trickCards: [],
                leadPlayer: 'alan',
                wonCards: {}
            } as Battle
        } as Game;
    });

    describe('getNextTrickTurn', () => {
        it('returns lead player, when no cards on table', () => {
            // assign
            const currentState = this.state;
            // act
            const nextTtrickTurnPlayerId = getNextTrickTurn(currentState);
            //assert
            should(nextTtrickTurnPlayerId).be.equal('alan');
        });

        it('returns player next to lead player, when one card on table', () => {
            this.state.battle.trickCards = [createCard('A♥')];
            // assign
            const currentState = this.state;
            // act
            const nextTtrickTurnPlayerId = getNextTrickTurn(currentState);
            //assert
            should(nextTtrickTurnPlayerId).be.equal('adam');
        });

        it('returns third player, when two cards on table', () => {
            this.state.battle.trickCards = [createCard('A♥'), createCard('10♥')];
            // assign
            const currentState = this.state;
            // act
            const nextTtrickTurnPlayerId = getNextTrickTurn(currentState);
            //assert
            should(nextTtrickTurnPlayerId).be.equal('pic');
        });
    });

    describe('calculatePointsByPlayer', () => {
        beforeEach(() => {
            this.state.bid = [
                { player: 'alan', bid: 100, pass: false }
            ] as Bid[];
            this.state.battle = {
                trumpAnnouncements: [
                    { player: 'alan', suit: Suit.Heart },
                    { player: 'pic', suit: Suit.Spade },
                    { player: 'pic', suit: Suit.Club }
                ] as TrumpAnnouncement[],
                trickCards: [],
                leadPlayer: 'alan',
                wonCards: {
                    adam: [
                        createCard('A♥'),
                        createCard('K♥')
                    ],
                    alan: [
                        createCard('A♥')
                    ],
                    pic: [
                        createCard('A♥'),
                        createCard('9♥')
                    ]
                }
            } as Battle;
        })
        it('only card points', () => {
            // assign
            const currentState = this.state;
            // act
            const totalPoints = calculatePointsByPlayer(currentState, 'adam');
            //assert
            should(totalPoints).be.equal(20);
        });
        it('battle lead win with trump', () => {
            // assign
            const currentState = this.state;
            // act
            const totalPoints = calculatePointsByPlayer(currentState, 'alan');
            //assert
            should(totalPoints).be.equal(100);
        });
        it('battle lead failure with trump', () => {
            // assign
            const currentState: Game = this.state;
            currentState.battle.trumpAnnouncements[0].suit = Suit.Diamond;
            // act
            const totalPoints = calculatePointsByPlayer(currentState, 'alan');
            //assert
            should(totalPoints).be.equal(-100);
        });        
        it('cards & two trumps', () => {
            // assign
            const currentState = this.state;
            // act
            const totalPoints = calculatePointsByPlayer(currentState, 'pic');
            //assert
            should(totalPoints).be.equal(110);
        });    

        it('cards & two trumps, for barrel mode enabled', () => {
            // assign
            const currentState: Game = this.state;
            currentState.players[1].battlePoints = [880, 0, 0, null]; //pic os on barrel
            // act
            const totalPoints = calculatePointsByPlayer(currentState, 'pic');
            //assert
            should(totalPoints).be.equal(0);
        });                
    });

    describe('getTrickWinner', () => {
        describe('for non trump announced case', () => {
            it('leader win, when opponents throws card with non-lead suit', () => {
                const currentState: Game = this.state;
                currentState.battle = {
                    trumpAnnouncements: [],
                    trickCards: [
                        createCard('9♥'),
                        createCard('9♦'),
                        createCard('J♦'),
                        
                    ],
                    leadPlayer: 'alan',
                    wonCards: {}
                } as Battle;
                // act
                const winnerPlayer = getTrickWinner(currentState);
                //assert
                should(winnerPlayer).be.equal('alan');
            });
            it('third player win, with higher-ranked suit card', () => {
                const currentState: Game = this.state;
                currentState.battle = {
                    trumpAnnouncements: [],
                    trickCards: [
                        createCard('9♥'),
                        createCard('A♦'),
                        createCard('J♥'),
                    ],
                    leadPlayer: 'alan',
                    wonCards: {}
                } as Battle;
                // act
                const winnerPlayer = getTrickWinner(currentState);
                //assert
                should(winnerPlayer).be.equal('pic');
            });
            it('second player win, with higher-ranked suit card', () => {
                const currentState: Game = this.state;
                currentState.battle = {
                    trumpAnnouncements: [],
                    trickCards: [
                        createCard('9♥'),                
                        createCard('A♥'),
                        createCard('K♥')
                    ],
                    leadPlayer: 'adam',
                    wonCards: {}
                } as Battle;
                // act
                const winnerPlayer = getTrickWinner(currentState);
                //assert
                should(winnerPlayer).be.equal('pic');
            });                        
        });
        describe.only('for trump announced case', () => {
            it('match by lead suit, when no trump suit taking part in the trick', () => {
                const currentState: Game = this.state;
                currentState.battle = {
                    trumpAnnouncements: [
                        { player: 'adam', suit: Suit.Diamond }
                    ],
                    trickCards: [
                        createCard('9♥'),                
                        createCard('K♥'),
                        createCard('A♥'),
                    ],
                    leadPlayer: 'adam',
                    wonCards: {}
                } as Battle;
                // act
                const winnerPlayer = getTrickWinner(currentState);
                //assert
                should(winnerPlayer).be.equal('alan');
            });
            it('match by trump suit, when one trump card thrown', () => {
                const currentState: Game = this.state;
                currentState.battle = {
                    trumpAnnouncements: [
                        { player: 'adam', suit: Suit.Diamond }
                    ],
                    trickCards: [
                        createCard('9♥'),                
                        createCard('K♥'),
                        createCard('9♦'),
                    ],
                    leadPlayer: 'adam',
                    wonCards: {}
                } as Battle;
                // act
                const winnerPlayer = getTrickWinner(currentState);
                //assert
                should(winnerPlayer).be.equal('pic');
            });   
            it('match by trump suit, when two trump cards thrown', () => {
                const currentState: Game = this.state;
                currentState.battle = {
                    trumpAnnouncements: [
                        { player: 'adam', suit: Suit.Diamond }
                    ],
                    trickCards: [
                        createCard('9♦'),
                        createCard('A♥'),
                        createCard('10♦'),
                    ],
                    leadPlayer: 'adam',
                    wonCards: {}
                } as Battle;
                // act
                const winnerPlayer = getTrickWinner(currentState);
                //assert
                should(winnerPlayer).be.equal('alan');
            });                        
        });
    });
});
