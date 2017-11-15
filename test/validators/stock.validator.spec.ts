import * as should from 'should';
import { Game, Phase, Card } from '../../src/game.interfaces';
import { createCard, createCards } from '../../src/helpers/cards.helpers';
import { canShareStock, isSharingStockFinished } from '../../src/validators/stock.validator';
import { ShareStock, } from '../../src/game.actions';

function createShareStockAction(card: Card, player: string): ShareStock {
    return {
        type: "SHARE_STOCK",
        card,
        player
    } as ShareStock;
}

describe('stock validator', () => {
    beforeEach(() => {
        this.state = {
            phase: Phase.SHARE_STOCK,
            players: [{ id: 'adam', battlePoints: [] }, { id: 'pic', battlePoints: [] }, { id: 'alan', battlePoints: [] }],
            deck: [],
            stock: [],
            bid: [
                { player: 'alan', bid: 300, pass: false },
                { player: 'pic', bid: 110, pass: false },
                { player: 'adam', bid: 100, pass: false }
            ],
            cards: {
                alan: [createCard('9♥')],
                pic: [createCard('K♥')],
                adam: []
            },
            battle: null
        } as Game;
    });

    describe('canShareStock', () => {
        it('non winner cannot share stock', () => {
            // assign
            const currentState = this.state;
            // act
            const action = createShareStockAction(currentState.cards.pic[0], "adam")
            //assert
            should(canShareStock(currentState, action)).be.equal(false);
        });

        it('winner can share stock', () => {
            // assign
            const currentState = this.state;
            // act
            const action = createShareStockAction(currentState.cards.alan[0], "adam")
            //assert
            should(canShareStock(currentState, action)).be.equal(true);
        });

        it('cannot share for non "SHARE_STOCK" phase', () => {
            // assign
            const currentState = this.state;
            currentState.phase = Phase.BATTLE_FINISHED
            // act
            const action = createShareStockAction(currentState.cards.alan[0], "adam")
            //assert
            should(canShareStock(currentState, action)).be.equal(false);
        });

        it('can share for "SHARE_STOCK" phase only', () => {
            // assign
            const currentState = this.state;
            currentState.phase = Phase.SHARE_STOCK
            // act
            const action = createShareStockAction(currentState.cards.alan[0], "adam")
            //assert
            should(canShareStock(currentState, action)).be.equal(true);
        });
    });

    describe('isSharingStockFinished', () => {
        it('returns false, when players do not have 8 cards', () => {
            // assign
            const currentState = this.state;
            currentState.cards['adam'] = createCards(7);
            currentState.cards['pic'] = createCards(7);
            currentState.cards['alan'] = createCards(10);
            // act
            const isFinished = isSharingStockFinished(currentState)
            //assert
            should(isFinished).be.equal(false);
        });

        it('returns true, when players do have 8 cards', () => {
            // assign
            const currentState = this.state;
            currentState.cards['adam'] = createCards(8);
            currentState.cards['pic'] = createCards(8);
            currentState.cards['alan'] = createCards(8);
            // act
            const isFinished = isSharingStockFinished(currentState)
            //assert
            should(isFinished).be.equal(true);
        });
    });
});


