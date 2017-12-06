import { initializeGame } from './src/game';
import { Thousand, Phase, Game, Battle, PlayersBid, TrumpAnnouncement, Suit } from './src/game.interfaces';
import * as _ from 'lodash';
import { shareStock, throwCard, Bid, Action, THROW_CARD, ThrowCard, REGISTER_PLAYER, RegisterPlayer, BID, SHARE_STOCK, ShareStock } from './src/game.actions';
import { createCards, toString } from './src/helpers/cards.helpers';
import { getWinner, getNextTurn } from './src/helpers/players.helpers';
import { getTrickWinner } from './src/helpers/battle.helpers';

const battleFinishedState: Game = {
    settings: {
        permitBombOnBarrel: true,
        maxBombs: 2,
        barrelPointsLimit: 880
    },
    phase: Phase.TRICK_IN_PROGRESS,
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
    cards: {
        'adam': [],
        'alan': [],
        'pic': [],
    },
    battle: {
        trumpAnnouncements: [
            { player: 'pic', suit: Suit.Club }
        ],
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

//action listeners:
thousand.events.addListener('action', (action: Action) => {
    const actionHandlers = {
        [THROW_CARD]: () => {
            const throwAction = action as ThrowCard;
            console.log(`ACTION: ${throwAction.player} has thrown ${toString(throwAction.card)}`);
        },
        [BID]: () => {
            const bidAction = action as Bid;
            if (bidAction.pass) {
                console.log(`ACTION: ${bidAction.player} has passed`);
            } else {
                console.log(`ACTION: ${bidAction.player} has bidded ${bidAction.bid}`);
            }
        },
        [REGISTER_PLAYER]: () => {
            const registerAction = action as RegisterPlayer;
            console.log(`ACTION: ${registerAction.id} joined the table`);
        },
        [SHARE_STOCK]: () => {
            const shareStock = action as ShareStock;
            
            console.log(`ACTION: sharing ${toString(shareStock.card)} with opponent: ${shareStock.player}`);
        }
    };

    const handleAction = actionHandlers[action.type];
    handleAction && handleAction();
});

//phase listeners
thousand.events.addListener('phaseChanged', (next, isFirst) => {
    const state: Game = thousand.getState();
    
    const phaseHandlers = {
        [Phase.REGISTERING_PLAYERS_START]: () => { 
            console.log('show registering player view');        
        },
        [Phase.REGISTERING_PLAYERS_IN_PROGRESS]: () => {
            if(isFirst) {
                console.log('registering progress');
            }
        },
        [Phase.REGISTERING_PLAYERS_FINISHED]: () => {
            const playerList = state.players.map(player => player.id).join(', ');
            console.log('all registered players:', playerList);        
        },
        [Phase.DEALING_CARDS_START]: () => {
            console.log('preparing UI for dealing cards...');        
        },
        [Phase.DEALING_CARDS_FINISHED]: () => {
            const stockCards = _.chain(state.stock)
                .map(toString)
                .join(', ')
                .value();
            console.log('stock cards: ', stockCards);                        
        },
        [Phase.BIDDING_START]: () => {
            console.log('showing bidding table...');        
        },
        [Phase.BIDDING_IN_PROGRESS]: () => {
            if(isFirst) {
                console.log('bidding progress:', state.bid);
            }
        },
        [Phase.BIDDING_FINISHED]: () => {
            console.log('bidding finished', state.bid);
        },
        [Phase.FLIP_STOCK]: () => {
            console.log('flipping stock');
        },
        [Phase.ASSIGN_STOCK]: () => {  
            console.log('assigning stock'); 
        },
        [Phase.SHARE_STOCK]: () => {
            if(isFirst) {
                console.log('sharing stock:', state.bid);
            }
        },
        [Phase.BATTLE_START]: () => {
            console.log('battle start');
        },
        [Phase.TRICK_START]: () => {
                console.log('trick starts:');
        },
        [Phase.TRICK_IN_PROGRESS]: () => {
                if(isFirst) {
                    console.log('trick in progress...');
                }
        },
        [Phase.TRICK_FINISHED]: () => {
            console.log(state);
            console.log('trick won by');
        },
        [Phase.BATTLE_FINISHED]: () => {
            console.log('', state.battle);
        },
        [Phase.GAME_FINISHED]: () => {
            console.log('winner: ', getWinner(state.players).id);
        },
        [Phase.BATTLE_RESULTS_ANNOUNCEMENT]: () => {
            console.log('battle statistics');
            console.log(state.players);
        }
    };
    
    phaseHandlers[state.phase] && phaseHandlers[state.phase]();
    next();

});

thousand.init();

_.chain([
    () => thousand.registerPlayer('adam'),
    () => thousand.registerPlayer('alan'),
   () => thousand.registerPlayer('pic'),
    () => thousand.bid('alan', 110),
    () => thousand.pass('pic'),
    () => thousand.pass('adam'),
    // //alan is winner
    () => thousand.shareStock(getCardsByPlayer('alan'), 'adam'),
    () => thousand.shareStock(getCardsByPlayer('alan'), 'pic'),
    // //battle:
    () => thousand.throwCard(getCardsByPlayer('alan'), 'alan'),
    () => thousand.throwCard(getCardsByPlayer('pic'), 'pic'),
    () => thousand.throwCard(getCardsByPlayer('adam'), 'adam'),
]).map(action => action()).value();

console.log(thousand.getState())

function getCardsByPlayer(player) {
    return thousand.getState().cards[player][0];
}
