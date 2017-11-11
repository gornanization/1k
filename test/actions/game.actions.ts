import * as should from 'should';
import { Game, Phase } from '../../src/game.interfaces';
import { createCard } from '../../src/helpers/cards.helpers';
import { isBiddingFinished, canBid } from '../../src/validators/bid.validator';
import { bid, setPhase, dealCardToStock, dealCardToPlayer, registerPlayer, setDeck, shareStock, assignStock } from '../../src/game.actions';
import { game as gameReducer } from '../../src/game.reducer';

describe('actions', () => {
    beforeEach(() => {
        this.state = {
            phase: Phase.BIDDING_IN_PROGRESS,
            players: [{ id: 'adam' }, { id: 'pic' }, { id: 'alan' }],
            deck: [
                createCard('10♥'),
                createCard('10♥'),
                createCard('J♦')
            ],
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
                ]
            }
        } as Game;
    });

    describe('setPhase', () => {
        it('sets phase property', () => {
            const currentState = this.state;
            const nextState = gameReducer(currentState, setPhase(Phase.BIDDING_START));
            currentState.phase = Phase.BIDDING_START;

            should(nextState).be.deepEqual(this.state);
        });
    });


    describe('dealCardToStock', () => {
        it('moves first card from deck to stock', () => {
            const currentState = this.state;
            currentState.deck = [
                createCard('A♥'),
                createCard('9♥'),
                createCard('J♦')
            ];
            currentState.stock = [createCard('J♥')];
            const nextState = gameReducer(currentState, dealCardToStock());

            should(nextState.stock[0]).be.deepEqual(createCard('A♥'), createCard('J♥'));
            should(nextState.deck).be.deepEqual([createCard('9♥'), createCard('J♦')]);
        });
    });

    describe('dealCardToPlayer', () => {
        it('moves first card from deck to stock', () => {
            const currentState = this.state;
            currentState.deck = [
                createCard('A♥'),
                createCard('9♥'),
                createCard('J♦')
            ];
            currentState.cards['adam'] = [createCard('J♥')];

            const nextState = gameReducer(currentState, dealCardToPlayer('adam'));

            should(nextState.cards['adam']).be.deepEqual([createCard('A♥'), createCard('J♥')]);
            should(nextState.deck).be.deepEqual([createCard('9♥'), createCard('J♦')]);
        });
    });



    describe('bid', () => {
        it('add bid', () => {
            const currentState = this.state;
            const nextState = gameReducer(currentState, bid('alan', 120));

            should(nextState.bid[0]).be.deepEqual({
                player: 'alan',
                bid: 120,
                pass: false
            });
        });
        it('add pass bid', () => {
            const currentState = this.state;
            const nextState = gameReducer(currentState, bid('alan', 0));

            should(nextState.bid[0]).be.deepEqual({
                player: 'alan',
                bid: 0,
                pass: true
            });
        });
    });

    describe('registerPlayer', () => {
        it('add new player to board', () => {
            // assign
            const currentState = this.state;
            const playerId = "dżesika";
            // act
            const nextState = gameReducer(currentState, registerPlayer(playerId));
            //assert
            should(nextState.players.length).be.equal(4);
            should(nextState.players[3].id).be.equal(playerId);

        });
    });

    describe('setDeck', () => {
        it('set game deck', () => {
            // assign
            const currentState = this.state;
            const deck = currentState.deck
            deck.push(createCard('J♥'))
            // act
            const nextState = gameReducer(currentState, setDeck(deck));
            //assert
            should(nextState.deck).be.deepEqual(deck);
            should(nextState.deck[3]).be.deepEqual({ rank: 'J', suit: '♥' });
        });
    });

    describe('shareStock', () => {
        it('share card', () => {
            // assign
            const currentState = this.state;
            currentState.cards['pic'] = [createCard('10♥'), createCard('10♦')];
            currentState.cards['adam'] = [];
            // act
            const nextState = gameReducer(currentState, shareStock(currentState.cards.pic[0], 'adam'));
            //assert
            should(nextState.cards['pic']).be.deepEqual([{ rank: '10', suit: '♦' }]);
            should(nextState.cards['adam']).be.deepEqual([{ rank: '10', suit: '♥' }]);

        });
    });

    describe('assignStock', () => {
        it('assign stock to a bid winner', () => {
            // assign
            const currentState = this.state;
            currentState.cards.pic = [];
            currentState.stock = [
                createCard('10♥'),
                createCard('10♥'),
                createCard('J♦')
            ];
            // act
            const nextState = gameReducer(currentState, assignStock());
            //assert
            should(nextState.cards['pic']).be.deepEqual(currentState.stock);
            should(nextState.stock.length).be.equal(0);
        });
    });
});