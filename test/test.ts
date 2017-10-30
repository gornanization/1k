import * as should from 'should';
import { canBid } from '../src/validators/game.validators';
import { bid } from '../src/game.actions';
import { Game } from '../src/game.interfaces';
import { createCard } from '../src/game.helpers';

describe('can', () => {
    beforeEach(() => {
        const state: Game = {
            players: [{ id: 'adam' }, { id: 'pic' }, { id: 'alan' }],
            deck: [],
            stock: [],
            bid: [
                { player: 'pic', bid: 110, pass: false },
                { player: 'adam', bid: 100, pass: true }
            ],
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

    describe('bid', () => {
        describe('is not allowed', () => {
            it('for bid value less than latest', () => {
                should(canBid(this.state, bid('alan', 100))).be.equal(false);
            });

            it('for invalid bid value', () => {
                should(canBid(this.state, bid('alan', 121))).be.equal(false);
                should(canBid(this.state, bid('alan', 121.5))).be.equal(false);
            });

            it('for unachieveable bid value', () => {
                should(canBid(this.state, bid('alan', 310))).be.equal(false);
            });            
        });
        
    });
});
