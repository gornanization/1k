import * as should from 'should';
import { can } from '../src/validators/game.validators';
import { bid, REGISTER_PLAYER } from '../src/game.actions';
import { Game, Phase } from '../src/game.interfaces';
import { createCard } from '../src/helpers/cards.helpers';

describe('can', () => {
    beforeEach(() => {
        const state: Game = {
            phase: Phase.BIDDING_IN_PROGRESS,
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
                    createCard('Q♥'),
                    createCard('Q♦')
                ]
            }
        };

        this.state = state;
    });

    describe('bid', () => {
        describe('is not allowed', () => {
            it('for non bid phase', () => {
                this.state.phase = Phase.REGISTERING_PLAYERS;
                should(can(this.state, bid('alan', 100))).be.equal(false);
            })

            it('for bid value less than latest', () => {
                should(can(this.state, bid('alan', 100))).be.equal(false);
            });

            it('for invalid bid value', () => {
                should(can(this.state, bid('alan', 121))).be.equal(false);
                should(can(this.state, bid('alan', 121.5))).be.equal(false);
            });

            it('for unachieveable bid value', () => {
                should(can(this.state, bid('alan', 310))).be.equal(false);
            });            
        });

        describe('is allowed', () => {
            it('to pass', () => {
                should(can(this.state, bid('alan', 0))).be.equal(true);
            });  
        });
    });
});
