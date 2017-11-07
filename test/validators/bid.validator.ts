import * as should from 'should';
import { Game, Phase } from '../../src/game.interfaces';
import { createCard } from '../../src/helpers/cards.helpers';
import { isBiddingFinished, canBid } from '../../src/validators/bid.validator';
import { bid } from '../../src/game.actions';

describe('bid validator', () => {
    beforeEach(() => {
        this.state = {
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
                    createCard('Q♦')
                ]
            }
        } as Game;
    });

    describe('canBid', () => {
        describe('is not allowed', () => {
            it('for non bid phase', () => {
                this.state.phase = Phase.REGISTERING_PLAYERS;
                should(canBid(this.state, bid('alan', 100))).be.equal(false);
            })

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

            it('for non-mariage card set, and value greater than 120', () => {
                should(canBid(this.state, bid('alan', 130))).be.equal(false);
            });

            it('for player not in next turn', () => {
                should(canBid(this.state, bid('adam', 120))).be.equal(false);
            });
        });

        describe('is allowed', () => {
            it('to pass', () => {
                should(canBid(this.state, bid('alan', 0))).be.equal(true);
            });
        });
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
