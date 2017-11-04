import * as should from 'should';
import { Game, Phase } from '../../src/game.interfaces';
import { createCard } from '../../src/helpers/cards.helpers';
import { isBiddingFinished } from '../../src/validators/bid.validator';
import { canRegisterPlayer, isRegisteringPlayersPhaseFinished } from '../../src/validators/player.validator';
import { RegisterPlayer, REGISTER_PLAYER } from '../../src/game.actions';

function createRegisterPlayerAction(name: string): RegisterPlayer {
    return {
        type: REGISTER_PLAYER,
        id: name
    } as RegisterPlayer;
}

describe('player validator', () => {
    beforeEach(() => {
        this.state = {
            phase: Phase.REGISTERING_PLAYERS,
            players: [],
            deck: [],
            stock: [],
            bid: [],
            cards: {}
        } as Game;
    });

    describe('isRegisteringPlayersPhaseFinished', () => {
        it('returns false, for no players', () => {
            this.state.players = [];
            should(isRegisteringPlayersPhaseFinished(this.state)).be.equal(false);
        });

        it('returns false, for two players', () => {
            this.state.players = [{ id: 'adam' }, { id: 'pic' }];
            should(isRegisteringPlayersPhaseFinished(this.state)).be.equal(false);
        });

        it('returns true, for three players', () => {
            this.state.players = [{ id: 'adam' }, { id: 'pic' }, { id: 'alan' }];
            should(isRegisteringPlayersPhaseFinished(this.state)).be.equal(true);
        });
    });

    describe('canRegisterPlayer', () => {
        describe('returns false', () => {
            it('for one player, proper phase and not unique name', () => {
                this.state.players = [{ id: 'adam' }];
                should(canRegisterPlayer(this.state, createRegisterPlayerAction('adam'))).be.equal(false);
            });
            it('for one player, not proper phase and unique name', () => {
                this.state.players = [{ id: 'adam' }];
                this.state.phase = Phase.BIDDING_START;
                should(canRegisterPlayer(this.state, createRegisterPlayerAction('alan'))).be.equal(false);
            });
            it('for three player, proper phase and unique name', () => {
                this.state.players = [{ id: 'adam' }, { id: 'alan' }, { id: 'pic' }];
                should(canRegisterPlayer(this.state, createRegisterPlayerAction('new user'))).be.equal(false);
            });
        });
        describe('returns true', () => {
            it('for one player, proper phase and unique name', () => {
                this.state.players = [{ id: 'adam' }];
                should(canRegisterPlayer(this.state, createRegisterPlayerAction('pic'))).be.equal(true);
            });
        });
    });
});
