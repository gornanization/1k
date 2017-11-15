import * as should from 'should';
import { Game, Phase, Battle } from '../../src/game.interfaces';
import { createCard } from '../../src/helpers/cards.helpers';
import { isBiddingFinished, canBid } from '../../src/validators/bid.validator';
import { bid } from '../../src/game.actions';
import { getNextTrickTurn } from '../../src/helpers/battle.helpers';

describe('battle helpers', () => {
    beforeEach(() => {
        this.state = {
            phase: Phase.BIDDING_IN_PROGRESS,
            players: [{ id: 'adam', battlePoints: [] }, { id: 'pic', battlePoints: [] }, { id: 'alan', battlePoints: [] }],
            deck: [],
            stock: [],
            bid: [],
            cards: {
            },
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
            this.state.battle.trickCards = [ createCard('A♥') ];
            // assign
            const currentState = this.state;
            // act
            const nextTtrickTurnPlayerId = getNextTrickTurn(currentState);
            //assert
            should(nextTtrickTurnPlayerId).be.equal('adam');
        });

        it('returns third player, when two cards on table', () => {
            this.state.battle.trickCards = [ createCard('A♥'), createCard('10♥') ];
            // assign
            const currentState = this.state;
            // act
            const nextTtrickTurnPlayerId = getNextTrickTurn(currentState);
            //assert
            should(nextTtrickTurnPlayerId).be.equal('pic');
        });        
    });
});
