import * as should from 'should';
import { Game, Phase, Card, Player } from '../../src/game.interfaces';
import { createCard, createCards } from '../../src/helpers/cards.helpers';
import { canShareStock, isSharingStockFinished } from '../../src/validators/stock.validator';
import { ShareStock, } from '../../src/game.actions';
import { isGameFinished } from '../../src/validators/game.validators';

describe('game validator', () => {
    beforeEach(() => {
        this.state = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.SHARE_STOCK,
            players: [
                { id: 'adam', battlePoints: [] },
                { id: 'pic', battlePoints: [] },
                { id: 'alan', battlePoints: [] }
            ] as Player[],
            deck: [],
            stock: [],
            bid: [],
            cards: {
                alan: [],
                pic: [],
                adam: []
            },
            battle: null
        } as Game;
    });

    describe('isGameFinished', () => {
        it('returns false for battlePoints less than 1000', () => {
            // assign
            const currentState = this.state;
            currentState.players[0].battlePoints = [];
            currentState.players[1].battlePoints = [100, null, 120];
            currentState.players[1].battlePoints = [990, null];
            // act
            const isFinished = isGameFinished(currentState);
            //assert
            should(isFinished).be.equal(false);
        });

        it('returns true, when result equal 1000', () => {
            // assign
            const currentState = this.state;
            currentState.players[0].battlePoints = [100, 100, 100, 100, 100, 100, 100, 100, 100, null, 100];
            console.log(currentState.players)
            // act
            const isFinished = isGameFinished(currentState);
            //assert
            should(isFinished).be.equal(true);
        });

        it('returns true, when result more than 1000', () => {
            // assign
            const currentState = this.state;
            currentState.players[0].battlePoints = [100, 100, 100, 100, 100, 100, 100, 100, 100, null, 110];
            console.log(currentState.players)
            // act
            const isFinished = isGameFinished(currentState);
            //assert
            should(isFinished).be.equal(true);
        });        
    });
});


