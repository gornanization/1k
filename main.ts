import { initializeGame } from './src/game';
import { Thousand, Phase, Game, Battle, PlayersBid } from './src/game.interfaces';
import * as _ from 'lodash';
import { shareStock, throwCard, Bid, Action, THROW_CARD, ThrowCard, REGISTER_PLAYER, RegisterPlayer, BID } from './src/game.actions';
import { createCards, toString } from './src/helpers/cards.helpers';

const defaultState: Game = {
    settings: {
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

const thousand: Thousand = initializeGame();

thousand.events.addListener('action', (action: Action) => {
    switch(action.type) {
        case THROW_CARD:
            const throwAction = action as ThrowCard;
            console.log(`${throwAction.player} has thrown ${toString(throwAction.card)}`);
        break;
        case BID:
            const bidAction = action as Bid;
            if (bidAction.pass) {
                console.log(`${bidAction.player} has passed`);
            } else {
                console.log(`${bidAction.player} has bidded ${bidAction.bid}`);
            }
        break;
        case REGISTER_PLAYER:
            const registerAction = action as RegisterPlayer;
            console.log(`${registerAction.id} joined the table`);
        break;
    }
});

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
            next();
        break;
        case Phase.BATTLE_IN_PROGRESS: 
            console.log('BATTLE_IN_PROGRESS');
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

_.chain([
    () => thousand.registerPlayer('adam'),
    () => thousand.registerPlayer('alan'),
    () => thousand.registerPlayer('pic'),
    () => thousand.bid('alan', 110),
    () => thousand.pass('pic'),
    () => thousand.pass('adam'),
    //alan is winner
    () => thousand.shareStock(getCardsByPlayer('alan')[0], 'adam'),
    () => thousand.shareStock(getCardsByPlayer('alan')[0], 'pic'),
    //battle:
    () => thousand.throwCard(getCardsByPlayer('alan')[0], 'alan'),
]).map(action => action()).value();

function getCardsByPlayer(player) {
    return thousand.getState().cards[player];
}