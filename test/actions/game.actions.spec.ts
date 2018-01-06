import * as should from 'should';
import { Game, Phase, Battle, TrumpAnnouncement, Suit } from '../../src/game.interfaces';
import { createCardPatterns } from '../../src/helpers/cards.helpers';
import { isBiddingFinished, canBid } from '../../src/validators/bid.validator';
import { bid, setPhase, dealCardToStock, dealCardToPlayer, registerPlayer, setDeck, shareStock, assignStock, initializeBattle, throwCard, FinalizeTrick, FINALIZE_TRICK, finalizeTrick, initializeBidding, calculateBattleResult, declareBomb, increaseBid } from '../../src/game.actions';
import { game as gameReducer } from '../../src/game.reducer';

describe('actions', () => {
    beforeEach(() => {
        this.state = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.BIDDING_IN_PROGRESS,
            players: [
                { id: 'adam', battlePoints: [] },
                { id: 'pic', battlePoints: [] },
                { id: 'alan', battlePoints: [] }],
            deck: [ '10♥', '10♥', 'J♦' ],
            stock: [],
            bid: [
                { player: 'adam', bid: 0, pass: true },
                { player: 'alan', bid: 0, pass: true },
                { player: 'pic', bid: 110, pass: false },
                { player: 'adam', bid: 100, pass: false }
            ],
            cards: {
                alan: [ '9♥', 'K♥', 'Q♦' ]
            },
            battle: null
        } as Game;
    });

    describe('setPhase', () => {
        it('sets phase property', () => {
            const currentState: Game = this.state;
            const nextState: Game = gameReducer(currentState, setPhase(Phase.BIDDING_START));
            currentState.phase = Phase.BIDDING_START;

            should(nextState).be.deepEqual(this.state);
        });
    });


    describe('dealCardToStock', () => {
        it('moves first card from deck to stock', () => {
            const currentState: Game = this.state;
            currentState.deck = ['A♥','9♥','J♦'];
            currentState.stock = ['J♥'];
            const nextState: Game = gameReducer(currentState, dealCardToStock());

            should(nextState.stock[0]).be.deepEqual('A♥', 'J♥');
            should(nextState.deck).be.deepEqual(['9♥', 'J♦']);
        });
    });

    describe('dealCardToPlayer', () => {
        it('moves first card from deck to stock', () => {
            const currentState: Game = this.state;
            currentState.deck = ['A♥','9♥','J♦'];
            currentState.cards['adam'] = ['J♥'];

            const nextState: Game = gameReducer(currentState, dealCardToPlayer('adam'));

            should(nextState.cards['adam']).be.deepEqual(['A♥', 'J♥']);
            should(nextState.deck).be.deepEqual(['9♥', 'J♦']);
        });
    });

    describe('bid', () => {
        it('add bid', () => {
            const currentState: Game = this.state;
            const nextState: Game = gameReducer(currentState, bid('alan', 120));

            should(nextState.bid[0]).be.deepEqual({
                player: 'alan',
                bid: 120,
                pass: false
            });
        });
        it('add pass bid', () => {
            const currentState: Game = this.state;
            const nextState: Game = gameReducer(currentState, bid('alan', 0));

            should(nextState.bid[0]).be.deepEqual({
                player: 'alan',
                bid: 0,
                pass: true
            });
        });
    });

    describe('increaseBid', () => {
        it('add bid', () => {
            const currentState: Game = this.state;
            const nextState: Game = gameReducer(currentState, increaseBid('alan', 150));

            should(nextState.bid[0]).be.deepEqual({
                player: 'alan',
                bid: 150,
                pass: false
            });
        });
    });

    describe('registerPlayer', () => {
        it('add new player to board', () => {
            // assign
            const currentState: Game = this.state;
            const playerId = "dżesika";
            // act
            const nextState: Game = gameReducer(currentState, registerPlayer(playerId));
            //assert
            should(nextState.players.length).be.equal(4);
            should(nextState.players[3].id).be.equal(playerId);

        });
    });

    describe('setDeck', () => {
        it('set game deck', () => {
            // assign
            const currentState: Game = this.state;
            const deck = currentState.deck
            deck.push('J♥')
            // act
            const nextState: Game = gameReducer(currentState, setDeck(deck));
            //assert
            should(nextState.deck).be.deepEqual(deck);
            should(nextState.deck[3]).be.deepEqual('J♥');
        });
    });

    describe('shareStock', () => {
        it('share card', () => {
            // assign
            const currentState: Game = this.state;
            currentState.cards['pic'] = ['10♥', '10♦'];
            currentState.cards['adam'] = [];
            // act
            const nextState: Game = gameReducer(currentState, shareStock('pic', currentState.cards.pic[0], 'adam'));
            //assert
            should(nextState.cards['pic']).be.deepEqual(['10♦']);
            should(nextState.cards['adam']).be.deepEqual(['10♥']);

        });
    });

    describe('assignStock', () => {
        it('assign stock to a bid winner', () => {
            // assign
            const currentState: Game = this.state;
            currentState.cards.pic = [];
            currentState.stock = ['10♥','10♥','J♦'];
            // act
            const nextState: Game = gameReducer(currentState, assignStock());
            //assert
            should(nextState.cards['pic']).be.deepEqual(currentState.stock);
            should(nextState.stock.length).be.equal(0);
        });
    });

    describe('calculateBattleResult', () => {
        it('updates battlePoints for each player', () => {
            // assign
            const currentState: Game = this.state;
            currentState.battle = {
                trumpAnnouncements: [],
                trickCards: [],
                leadPlayer: 'alan',
                wonCards: {
                    adam: ['A♠'],
                    alan: [],
                    pic: []
                }
            } as Battle;
            // act
            const nextState: Game = gameReducer(currentState, calculateBattleResult());
            //assert
            should(nextState.players).be.deepEqual([
                { id: 'adam', battlePoints: [10] },
                { id: 'pic', battlePoints: [-110] },
                { id: 'alan', battlePoints: [0] }
            ]);
        });
    });

    describe('declareBomb', () => {
        it('sets proper battlePoints', () => {
            // assign
            const currentState: Game = this.state;
            currentState.players = [
                { id: 'adam', battlePoints: [ 880 ] },
                { id: 'pic',  battlePoints: [ 100 ] },
                { id: 'alan', battlePoints: [ 0   ] }
            ];
            // act
            const nextState: Game = gameReducer(currentState, declareBomb('alan'));
            //assert
            should(nextState.players).be.deepEqual([
                { id: 'adam', battlePoints: [ 880, 0  ] },
                { id: 'pic',  battlePoints: [ 100, 60 ] },
                { id: 'alan', battlePoints: [ 0, null ] }
            ]);
        });
    });

    describe('battle actions: ', () => {
        beforeEach(() => {
            this.state.battle = {
                trumpAnnouncements: [],
                leadPlayer: 'pic',
                trickCards: [],
                wonCards: {
                    adam: [],
                    alan: [],
                    pic: []
                }
            }
        });
        describe('throwCard', () => {
            it('transfers card from player to battle trick (table)', () => {
                // assign
                const currentState: Game = this.state;
                // act
                const nextState: Game = gameReducer(currentState, throwCard('9♥', 'alan'));
                //assert
                should(nextState.battle.trickCards).be.deepEqual(['9♥']);
                should(nextState.cards['alan']).be.deepEqual(['K♥', 'Q♦']);
            });
            it('registers trump in battle, while K & Q trump announcement', () => {
                // assign
                const currentState: Game = this.state;
                currentState.cards['alan'] = ['K♥', 'Q♥', '10♦'];
                // act
                const nextState: Game = gameReducer(currentState, throwCard('Q♥', 'alan'));
                //assert
                should(nextState.battle.trickCards).be.deepEqual(['Q♥']);
                should(nextState.battle.trumpAnnouncements).be.deepEqual([
                    { player: 'alan', suit: Suit.Heart } as TrumpAnnouncement
                ]);
            });
            
            it('does not register trump in battle, while K & Q trump announcement and not fist card on table', () => {
                // assign
                const currentState: Game = this.state;
                currentState.battle.trickCards = ['9♥'];
                currentState.cards['alan'] = [ 'K♥', 'Q♥', '10♦'];
                // act
                const nextState: Game = gameReducer(currentState, throwCard('Q♥', 'alan'));
                //assert
                should(nextState.battle.trickCards).be.deepEqual(['9♥', 'Q♥']);
                should(nextState.battle.trumpAnnouncements).be.deepEqual([]);
            });
        });
        describe('finalizeTrick', () => {
            it('sets new leadPlayer, moves trickCards to leader wonCards', () => {
                // assign
                const currentState: Game = this.state;
                currentState.battle = {
                    trumpAnnouncements: [],
                    leadPlayer: 'pic',
                    trickCards: [ 'K♥', 'Q♥', '9♥' ],
                    wonCards: {
                        adam: [],
                        alan: ['Q♦'],
                        pic: [],
                    }
                } as Battle;
                // act
                const nextState: Game = gameReducer(currentState, finalizeTrick('alan'));
                //assert
                should(nextState.battle.trickCards).be.deepEqual([]);
                should(nextState.battle.leadPlayer).be.equal('alan');
                should(nextState.battle.wonCards['alan']).be.deepEqual(['K♥','Q♥','9♥','Q♦']);
            });
        });
    })
});