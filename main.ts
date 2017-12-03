import { initializeGame } from './src/game';
import { Thousand, Phase, Game } from './src/game.interfaces';

const thousand: Thousand = initializeGame();

thousand.events.addListener('phaseChanged', (phase: Phase) => {
    const state: Game = thousand.getState();

    switch(phase) {
        case Phase.BIDDING_START:
            console.log('show bidding UI');
        break;
        case Phase.BIDDING_IN_PROGRESS:
            console.log('show player bid on UI', state.bid);
        break;
    }
});

thousand.registerPlayer('adam');
thousand.registerPlayer('alan');
thousand.registerPlayer('pic');
