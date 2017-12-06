import { initializeGame } from './src/game';
import { Thousand, Phase, Game, Battle, PlayersBid } from './src/game.interfaces';
import * as _ from 'lodash';
import { shareStock, throwCard, Bid } from './src/game.actions';
import { createCards } from './src/helpers/cards.helpers';

const defaultState: Game = {
    settings: {
        permitBombOnBarrel: true,
        maxBombs: 2,
        barrelPointsLimit: 880
    },
    phase: Phase.BATTLE_IN_PROGRESS,
    players: [
        {id: 'adam', battlePoints: []},
        {id: 'alan', battlePoints: []},
        {id: 'pic', battlePoints: []}
    ],
    deck: [],
    stock: [],
    bid: [
        { player: 'adam', bid: 0, pass: true },
        { player: 'pic', bid: 0, pass: true },
        { player: 'alan', bid: 110, pass: false },
        { player: 'adam', bid: 100, pass: false }
    ] as PlayersBid[],
    cards: {},
    battle: {
        trumpAnnouncements: [],
        leadPlayer: 'alan',
        trickCards: [],
        wonCards: {
            'adam': [ ...createCards(8) ],
            'alan': [ ...createCards(8) ],
            'pic': [ ...createCards(8) ]
        }
    } as Battle
};

const thousand: Thousand = initializeGame(defaultState);

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
        case Phase.BIDDING_FINISHED:
            console.log('BIDDING_FINISHED', state.bid);
            next();
        break;    
        case Phase.FLIP_STOCK: 
            console.log('FLIP_STOCK', state.stock);
            next();
        break;    
        case Phase.ASSIGN_STOCK: 
            console.log('ASSIGN_STOCK', state.stock);
            next();
        break;       
        case Phase.SHARE_STOCK:
            console.log('SHARE_STOCK');
        break;
        case Phase.BATTLE_START: 
            console.log('BATTLE_START');
            console.log(state.battle);
            next();
        break;
        case Phase.BATTLE_IN_PROGRESS: 
            console.log('BATTLE_IN_PROGRESS');
            console.log(state.battle);
        break;
        case Phase.BATTLE_FINISHED:
            console.log('BATTLE_FINISHED');
            console.log(state.battle);
            next();
        break;
        case Phase.BATTLE_RESULTS_ANNOUNCEMENT:
            console.log('BATTLE_RESULTS_ANNOUNCEMENT');
            console.log(state.players);
        break;
    }
});

thousand.init();

// _.chain([
//     () => thousand.registerPlayer('adam'),
//     () => thousand.registerPlayer('alan'),
//     () => thousand.registerPlayer('pic'),
//     () => thousand.bid('alan', 110),
//     () => thousand.pass('pic'),
//     () => thousand.pass('adam'),
//     //alan is winner
//     () => thousand.shareStock(getCardsByPlayer('alan')[0], 'adam'),
//     () => thousand.shareStock(getCardsByPlayer('alan')[0], 'pic'),
//     //battle:
//     () => thousand.throwCard(getCardsByPlayer('alan')[0], 'alan'),
// ]).map(action => action()).value();

// function getCardsByPlayer(player) {
//     return thousand.getState().cards[player];
// }