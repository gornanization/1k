import { initializeGame } from './src/game';
import { Thousand, Phase, Game } from './src/game.interfaces';
import * as _ from 'lodash';

const thousand: Thousand = initializeGame();

thousand.events.addListener('phaseChanged', (next) => {
    const state: Game = thousand.getState();

    switch(state.phase) {
        case Phase.REGISTERING_PLAYERS_START: 
            console.log('REGISTERING_PLAYERS_START');
            next();
        break;
        case Phase.REGISTERING_PLAYERS_IN_PROGRESS: 
            console.log('REGISTERING_PLAYERS_IN_PROGRESS');
            console.log(state.players);
        break;
        case Phase.REGISTERING_PLAYERS_FINISHED: 
            console.log('REGISTERING_PLAYERS_FINISHED');
            console.log(state.players);
            next();
        break;
        case Phase.DEALING_CARDS_START:
            console.log('DEALING_CARDS_START');
            next();
        break;
        case Phase.DEALING_CARDS_FINISHED:
            console.log('DEALING_CARDS_FINISHED');
            console.log(state.cards, state.stock);
            next();
        break;
        case Phase.BIDDING_START:
            console.log('BIDDING_START');
            next();
        break;
        case Phase.BIDDING_IN_PROGRESS:
            console.log('BIDDING_IN_PROGRESS', state.bid);
        break;
    }
});

thousand.init();

const actions = [
    () => thousand.registerPlayer('adam'),
    () => thousand.registerPlayer('alan'),
    () => thousand.registerPlayer('pic')
];

_.chain(actions)
    .map(action => action())
    .value();