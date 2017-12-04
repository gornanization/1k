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
import { getBidWinner, noOneParticipatedInBidding } from './helpers/bid.helpers';
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

    const thousand: Thousand = {
        store,
        events: new EventEmitter(),
        //actions:
        registerPlayer: (player: string) => doAction(registerPlayer(player), store),
        bid: (player: string, value: number) => doAction(bid(player, value), store),
        pass: (player: string) => doAction(bid(player, 0), store),
        shareStock: (card: Card, player: string) => doAction(shareStock(card, player), store),
        //utils:
        getState: () => store.getState(),
        init: () => store.dispatch(setPhase(store.getState().phase))
    };

    store.subscribe(() => {
        const state: Game = store.getState();
    
        switch (state.phase) {
            case Phase.REGISTERING_PLAYERS_START: 
                thousand.events.emit(
                    'phaseChanged', 
                    () => store.dispatch(setPhase(Phase.REGISTERING_PLAYERS_IN_PROGRESS))
                );
            break;
            case Phase.REGISTERING_PLAYERS_IN_PROGRESS:
                thousand.events.emit('phaseChanged');
                if (isRegisteringPlayersPhaseFinished(state)) {
                    store.dispatch(setPhase(Phase.REGISTERING_PLAYERS_FINISHED));
                }
                break;
            case Phase.REGISTERING_PLAYERS_FINISHED:
                thousand.events.emit(
                    'phaseChanged', 
                    () => store.dispatch(setPhase(Phase.DEALING_CARDS_START))
                );
            break;
            case Phase.DEALING_CARDS_START:
                thousand.events.emit(
                    'phaseChanged', 
                    () => {
                        store.dispatch(setPhase(Phase.DEALING_CARDS_IN_PROGRESS));
                        
                        store.dispatch(setDeck(createShuffledDeck()));
                        for (let i = 0; i < 7; i++) {
                            _.each(state.players, (player: Player) => store.dispatch(dealCardToPlayer(player.id)))
                        }
                        for (let i = 0; i < 3; i++) {
                            store.dispatch(dealCardToStock());
                        }
                        store.dispatch(setPhase(Phase.DEALING_CARDS_FINISHED));
                    }
                );
                break;
            case Phase.DEALING_CARDS_FINISHED:
                thousand.events.emit(
                    'phaseChanged', 
                    () => store.dispatch(setPhase(Phase.BIDDING_START))
                );
            break;
            case Phase.BIDDING_START:
                thousand.events.emit(
                    'phaseChanged', 
                    () => store.dispatch(setPhase(Phase.BIDDING_IN_PROGRESS))
                );
                break;
            case Phase.BIDDING_IN_PROGRESS:
                if(!getBidWinner(state.bid)) {
                    store.dispatch(bid(_.head(state.players).id, 100));
                } else {
                    if (isBiddingFinished(state)) {
                        store.dispatch(setPhase(Phase.BIDDING_FINISHED));
                    } else {
                        thousand.events.emit('phaseChanged');
                    }
                }
                break;
            case Phase.BIDDING_FINISHED:
                thousand.events.emit(
                    'phaseChanged', 
                    () => {
                        if(noOneParticipatedInBidding(state.bid)) {
                            store.dispatch(setPhase(Phase.ASSIGN_STOCK));
                        } else {
                            store.dispatch(setPhase(Phase.FLIP_STOCK));
                        }
                    }
                );
                break;               
            case Phase.FLIP_STOCK:
                thousand.events.emit(
                    'phaseChanged',
                    () => store.dispatch(setPhase(Phase.ASSIGN_STOCK))
                );
                break;
            case Phase.ASSIGN_STOCK:
                thousand.events.emit(
                    'phaseChanged',
                    () => {
                        store.dispatch(setPhase(Phase.SHARE_STOCK));
                        store.dispatch(assignStock());
                    }
                );
                break;
            case Phase.SHARE_STOCK:
                thousand.events.emit('phaseChanged');
                if(isSharingStockFinished(state)) {
                    store.dispatch(setPhase(Phase.BATTLE_START));
                }
                break;
            case Phase.BATTLE_START:
                thousand.events.emit(
                    'phaseChanged',
                    () => {
                        store.dispatch(initializeBattle());
                    }
                );
                break;
            case Phase.BATTLE_IN_PROGRESS:
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