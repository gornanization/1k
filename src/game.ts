import { createStore } from 'redux';
import * as _ from 'lodash';

import { Game, Card, Suit, Rank, Player, Phase, Thousand } from './../src/game.interfaces';
import { registerPlayer, setDeck, dealCardToPlayer, dealCardToStock, bid, setPhase, ASSIGN_STOCK, assignStock, shareStock, initializeBattle, calculateBattleResult } from './../src/game.actions';
import { game as gameReducer } from './../src/game.reducer';
import { createDeck, createCard, getMarriages, createShuffledDeck } from './../src/helpers/cards.helpers';
import { isRegisteringPlayersPhaseFinished } from './../src/validators/player.validator';
import { isBattleFinished, isTrickFinished } from './../src/validators/battle.validator';
import { getNextTurn, getWinner } from './../src/helpers/players.helpers';
import { isBiddingFinished } from './../src/validators/bid.validator';
import { isSharingStockFinished } from './../src/validators/stock.validator';
import { can, isGameFinished } from './../src/validators/game.validators';
var EventEmitter = require('wolfy87-eventemitter');


function doAction(action: any, store): boolean {
    if (can(store.getState(), action)) {
        store.dispatch(action);
        return true;
    } else {
        console.log('can\'t do action:', action);
        return false;
    }
}

export function initializeGame(defaultState: Game = undefined): Thousand {
    const store = createStore(gameReducer, defaultState);

    const ee = new EventEmitter();

    const thousand: Thousand = {
        events: ee,
        registerPlayer: (player) => doAction(registerPlayer(player), store),
        getState: () => store.getState()
    };

    store.subscribe(() => {
        const state: Game = store.getState();
    
        switch (state.phase) {
            case Phase.REGISTERING_PLAYERS:
                if (isRegisteringPlayersPhaseFinished(state)) {
                    store.dispatch(setPhase(Phase.DEALING_CARDS_START))
                }
                break;
            case Phase.DEALING_CARDS_START:
                store.dispatch(setPhase(Phase.DEALING_CARDS_IN_PROGRESS))
    
                store.dispatch(setDeck(createShuffledDeck()));
                for (let i = 0; i < 7; i++) {
                    _.each(state.players, (player: Player) => store.dispatch(dealCardToPlayer(player.id)))
                }
                for (let i = 0; i < 3; i++) {
                    store.dispatch(dealCardToStock());
                }
                store.dispatch(setPhase(Phase.DEALING_CARDS_FINISHED));
    
                break;
            case Phase.DEALING_CARDS_FINISHED:
                thousand.events.emit('phaseChanged', Phase.BIDDING_START);
                store.dispatch(setPhase(Phase.BIDDING_START));
                break;
            case Phase.BIDDING_START:
                store.dispatch(setPhase(Phase.BIDDING_IN_PROGRESS));
                store.dispatch(bid(_.head(state.players).id, 100));
                break;
            case Phase.BIDDING_IN_PROGRESS:
                if (isBiddingFinished(state)) {
                    store.dispatch(setPhase(Phase.BIDDING_FINISHED));
                } else {
                    thousand.events.emit('phaseChanged', Phase.BIDDING_IN_PROGRESS);
                }
                break;
            case Phase.BIDDING_FINISHED:
                store.dispatch(setPhase(Phase.FLIP_STOCK));
                break;
            case Phase.FLIP_STOCK:
                store.dispatch(setPhase(Phase.ASSIGN_STOCK));
                break;
            case Phase.ASSIGN_STOCK:
                store.dispatch(setPhase(Phase.SHARE_STOCK));
                store.dispatch(assignStock());
                break;
            case Phase.SHARE_STOCK:
                if(isSharingStockFinished(state)) {
                    store.dispatch(setPhase(Phase.BATTLE_START));
                } else {
                    console.log('NOT isSharingStockFinished')
                }
                break;
            case Phase.BATTLE_START:
                store.dispatch(initializeBattle());
                break;
            case Phase.BATTLE_IN_PROGRESS:
                console.log('battle in progress');
                if(isTrickFinished(state)) {
                    if(isBattleFinished(state)) {
                        store.dispatch(setPhase(Phase.BATTLE_FINISHED));
                    } else {
                        
                    }
                } else {
                    //trick in progress
                }
    
                break;
             case Phase.BATTLE_FINISHED:
                store.dispatch(calculateBattleResult());
                break;
            case Phase.BATTLE_RESULTS_ANNOUNCEMENT:
                console.log(state.players);
                if (isGameFinished(state)) {
                    store.dispatch(setPhase(Phase.GAME_FINISHED));
                } else {
                    store.dispatch(setPhase(Phase.DEALING_CARDS_START));
                }
                break;
            case Phase.GAME_FINISHED:
                const winner = getWinner(state.players);
                console.log('winner: ', winner.id);
                break;
            default:
                break;
        }
    });


    return thousand;
}