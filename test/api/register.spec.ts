import { Thousand, Game, Phase, Player } from '../../src/game.interfaces';
import { initializeGame } from '../../src/game';
import * as should from 'should';

describe('user registration', () => {
    it('is not allowed, without calling next() on REGISTERING_PLAYERS_START', () => {
        const thousand: Thousand = initializeGame();

        thousand.events.addListener('phaseUpdated', () => {
            const state: Game = thousand.getState();
            should(state.phase).be.equal(Phase.REGISTERING_PLAYERS_START);
        });

        thousand.init();

        const isRegistered = thousand.registerPlayer('adam');
       
        should(isRegistered).be.equal(false);
    });

    it('have regisered players on REGISTERING_PLAYERS_FINISHED phase', () => {
        const thousand: Thousand = initializeGame();
        
        const history = [];

        thousand.events.addListener('phaseUpdated', next => {
            const state: Game = thousand.getState();
            
            history.push([state.phase, state.players]);

            if(state.phase === Phase.REGISTERING_PLAYERS_FINISHED) {
                should(history).be.deepEqual([
                    [Phase.REGISTERING_PLAYERS_START, []],
                    [Phase.REGISTERING_PLAYERS_IN_PROGRESS, []],
                    [Phase.REGISTERING_PLAYERS_IN_PROGRESS, [
                        { id: 'adam', battlePoints: [] }
                    ]],
                    [Phase.REGISTERING_PLAYERS_IN_PROGRESS, [
                        { id: 'adam', battlePoints: [] },
                        { id: 'alan', battlePoints: [] },
                    ]],
                    [Phase.REGISTERING_PLAYERS_IN_PROGRESS, [
                        { id: 'adam', battlePoints: [] },
                        { id: 'alan', battlePoints: [] },
                        { id: 'pic', battlePoints: [] }
                    ]],
                    [Phase.REGISTERING_PLAYERS_FINISHED, [
                        { id: 'adam', battlePoints: [] },
                        { id: 'alan', battlePoints: [] },
                        { id: 'pic', battlePoints: [] }
                    ]]
                ]);
            }

            next();
        });

        thousand.init();

        thousand.registerPlayer('adam');
        thousand.registerPlayer('alan');
        thousand.registerPlayer('pic');
    });
});