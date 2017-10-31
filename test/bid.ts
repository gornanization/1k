import * as should from 'should';
import { Game, Phase } from '../src/game.interfaces';
import { createCard } from '../src/helpers/cards.helpers';
import { isBiddingFinished } from '../src/validators/bid.validator';

describe('bid', () => {
    beforeEach(() => {
        const state: Game = {
            phase: Phase.BID,
            players: [{ id: 'adam' }, { id: 'pic' }, { id: 'alan' }],
            deck: [],
            stock: [],
            bid: [],
            cards: {
                alan: [
                    createCard('9♥'),
                    createCard('K♥'),
                    createCard('Q♥'),
                    createCard('Q♦')
                ]
            }
        };

        this.state = state;
    });

    describe('isBiddingFinished', () => {
        describe('equals true for', () => {
            it('two players pass', () => {
                this.state.bid = [
                    { player: 'alan', bid: 0, pass: true },
                    { player: 'pic', bid: 0, pass: true },
                    { player: 'adam', bid: 100, pass: false }
                ];

                should(isBiddingFinished(this.state)).be.equal(true);
            });

            it('for max bid', () => {
                this.state.bid = [
                    { player: 'alan', bid: 300, pass: false },
                    { player: 'pic', bid: 110, pass: false },
                    { player: 'adam', bid: 100, pass: false }
                ];

                should(isBiddingFinished(this.state)).be.equal(true);
            });
        });
        describe('equals false for', () => {
            it('one players pass', () => {
                this.state.bid = [
                    { player: 'alan', bid: 0, pass: true },
                    { player: 'pic', bid: 110, pass: false },
                    { player: 'adam', bid: 100, pass: false }
                ];

                should(isBiddingFinished(this.state)).be.equal(false);
            });

            it('for no players pass', () => {
                this.state.bid = [
                    { player: 'alan', bid: 120, pass: false },
                    { player: 'pic', bid: 110, pass: false },
                    { player: 'adam', bid: 100, pass: false }
                ];

                should(isBiddingFinished(this.state)).be.equal(false);
            });
        });        
    });
});
