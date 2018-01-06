import * as should from 'should';
import { Game, Phase } from '../../src/game.interfaces';
import { createCardPatterns } from '../../src/helpers/cards.helpers';
import { isBiddingFinished, canBid, canIncreaseBid } from '../../src/validators/bid.validator';
import { bid, increaseBid, SHARE_STOCK } from '../../src/game.actions';
import { Battle } from '../../src/index';

describe('bid validator', () => {
    beforeEach(() => {
        this.state = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.BIDDING_IN_PROGRESS,
            players: [{ id: 'adam', battlePoints: [] }, { id: 'pic', battlePoints: [] }, { id: 'alan', battlePoints: [] }],
            deck: [],
            stock: [],
            bid: [
                { player: 'pic', bid: 110, pass: false },
                { player: 'adam', bid: 100, pass: false }
            ],
            cards: {
                alan: ['9♥','K♥','Q♦']
            },
            battle: null
        } as Game;
    });

    describe('canBid', () => {
        describe('is not allowed', () => {
            it('for non bid phase', () => {
                this.state.phase = Phase.REGISTERING_PLAYERS_IN_PROGRESS;
                should(canBid(this.state, bid('alan', 100))).be.equal(false);
            });

            it('for bid value less than latest', () => {
                should(canBid(this.state, bid('alan', 100))).be.equal(false);
            });

            it('for bid value equal than latest', () => {
                should(canBid(this.state, bid('alan', 110))).be.equal(false);
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

            it('to pass, again', () => {
                this.state.bid = [
                    { player: 'pic', bid: 130, pass: false },
                    { player: 'adam', bid: 120, pass: false },
                    { player: 'alan', bid: 0, pass: true }, // alan has passed already
                    { player: 'pic', bid: 110, pass: false },
                    { player: 'adam', bid: 100, pass: false }
                ],

                    should(canBid(this.state, bid('alan', 0))).be.equal(false);
            });
        });

        describe('is allowed', () => {
            it('to pass', () => {
                should(canBid(this.state, bid('alan', 0))).be.equal(true);
            });
            it('to bid more than latest', () => {
                should(canBid(this.state, bid('alan', 120))).be.equal(true);
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

describe('canIncreaseBid', () => {

    beforeEach(() => {
        this.state = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.SHARE_STOCK,
            players: [{ id: 'adam', battlePoints: [] }, { id: 'pic', battlePoints: [] }, { id: 'alan', battlePoints: [] }],
            deck: [],
            stock: [],
            bid: [
                { player: 'adam', bid: 0, pass: true },
                { player: 'alan', bid: 0, pass: true },
                { player: 'pic', bid: 110, pass: false }, // winner
                { player: 'adam', bid: 100, pass: false }
            ],
            cards: {
                pic: ['9♥','K♥','Q♥']
            },
            battle: null
        } as Game;
    });

    it('is not allowed for not winner', () => {
        should(canIncreaseBid(this.state, increaseBid('adam', 120))).be.equal(false);
    });

    it('is allowed for winner', () => {
        should(canIncreaseBid(this.state, increaseBid('pic', 120))).be.equal(true);
    });

    it('is allowed for winner to skip value', () => {
        should(canIncreaseBid(this.state, increaseBid('pic', 180))).be.equal(true);
    });

    it('is not allowed for winner to skip value w/o trump', () => {
        this.state.cards.pic = [];
        should(canIncreaseBid(this.state, increaseBid('pic', 180))).not.be.equal(true);
    });

    it('is not allowed for > 300', () => {
        should(canIncreaseBid(this.state, increaseBid('pic', 310))).be.equal(false);
    });

    it('is not allowed for invalid bid', () => {
        should(canIncreaseBid(this.state, increaseBid('pic', 120.4))).be.equal(false);
    });

    it('is not allowed for pass', () => {
        should(canIncreaseBid(this.state, increaseBid('pic', 0))).be.equal(false);
    });

    it('is not allowed for lower than stated', () => {
        should(canIncreaseBid(this.state, increaseBid('pic', 100))).be.equal(false);
    });

    it('is not allowed for the same as stated', () => {
        should(canIncreaseBid(this.state, increaseBid('pic', 110))).be.equal(false);
    });

    describe('while in progress', () => {
        beforeEach(() => {
            this.state.phase = Phase.TRICK_IN_PROGRESS;
            this.state.battle = {
                trumpAnnouncements: [],
                wonCards: {
                    pic: []
                },
                leadPlayer: 'pic',
                trickCards: []
            } as Battle;
        });

        it('is allowed, when no cards on the table and no cards in won section', () => {
            should(canIncreaseBid(this.state, increaseBid('pic', 120))).be.equal(true);
        });

        it('is not allowed, when first card on the table', () => {
            this.state.battle.trickCards = createCardPatterns(1);
            should(canIncreaseBid(this.state, increaseBid('pic', 120))).be.equal(false);
        });

        it('is not allowed, when some cards in won seciton', () => {
            this.state.battle.wonCards.pic = createCardPatterns(1);
            should(canIncreaseBid(this.state, increaseBid('pic', 120))).be.equal(false);
        });
    });

    it('is not allowed, when bidding in progress', () => {
        this.state.phase = Phase.BIDDING_IN_PROGRESS;
        should(canIncreaseBid(this.state, increaseBid('pic', 120))).be.equal(false);
        this.state.phase = Phase.TRICK_FINISHED;
        should(canIncreaseBid(this.state, increaseBid('pic', 120))).be.equal(false);
    });
});
