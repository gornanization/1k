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
import { throwCard } from './game.actions';
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
    const events: any = new EventEmitter();

    function manageAction(action: any) {
        const result = doAction(action, store);
        if (result) { events.emit('action', action); }
        return result;
    }
    
    const thousand: Thousand = {
        events,
        //actions:
        registerPlayer: player =>                       manageAction(registerPlayer(player)),
        bid: (player: string, value: number) =>         manageAction(bid(player, value)),
        pass: (player: string) =>                       manageAction(bid(player, 0)),
        shareStock: (card: Card, player: string) =>     manageAction(shareStock(card, player)),
        throwCard: (card: Card, player: string) =>      manageAction(throwCard(card, player)),
        //utils:
        getState: () => store.getState(),
        init: () => store.dispatch(setPhase(store.getState().phase))
    };

    store.subscribe(() => {
        const state: Game = store.getState();
    
        switch (state.phase) {
            case Phase.REGISTERING_PLAYERS_START: 
                events.emit(
                    'phaseChanged', 
                    () => store.dispatch(setPhase(Phase.REGISTERING_PLAYERS_IN_PROGRESS))
                );
            break;
            case Phase.REGISTERING_PLAYERS_IN_PROGRESS:
                events.emit('phaseChanged');
                if (isRegisteringPlayersPhaseFinished(state)) {
                    store.dispatch(setPhase(Phase.REGISTERING_PLAYERS_FINISHED));
                }
                break;
            case Phase.REGISTERING_PLAYERS_FINISHED:
                events.emit(
                    'phaseChanged', 
                    () => store.dispatch(setPhase(Phase.DEALING_CARDS_START))
                );
            break;
            case Phase.DEALING_CARDS_START:
                events.emit(
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
                events.emit(
                    'phaseChanged', 
                    () => store.dispatch(setPhase(Phase.BIDDING_START))
                );
            break;
            case Phase.BIDDING_START:
                events.emit(
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
                        events.emit('phaseChanged');
                    }
                }
                break;
            case Phase.BIDDING_FINISHED:
                events.emit(
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
                events.emit(
                    'phaseChanged',
                    () => store.dispatch(setPhase(Phase.ASSIGN_STOCK))
                );
                break;
            case Phase.ASSIGN_STOCK:
                events.emit(
                    'phaseChanged',
                    () => {
                        store.dispatch(setPhase(Phase.SHARE_STOCK));
                        store.dispatch(assignStock());
                    }
                );
                break;
            case Phase.SHARE_STOCK:
                events.emit('phaseChanged');
                if (isSharingStockFinished(state)) {
                    store.dispatch(initializeBattle());
                }
                break;
            case Phase.BATTLE_START:
                events.emit(
                    'phaseChanged',
                    () => store.dispatch(setPhase(Phase.BATTLE_IN_PROGRESS))
                );
                break;
            case Phase.BATTLE_IN_PROGRESS:
                events.emit('phaseChanged');
                if(isTrickFinished(state)) {
                    
                }
                if(isBattleFinished(state)) {
                    store.dispatch(setPhase(Phase.BATTLE_FINISHED));
                }
                break;
             case Phase.BATTLE_FINISHED:
                events.emit(
                    'phaseChanged',
                    () => store.dispatch(calculateBattleResult())
                );
                break;
            case Phase.BATTLE_RESULTS_ANNOUNCEMENT:
                events.emit(
                    'phaseChanged',
                    () => {
                        if (isGameFinished(state)) {
                            store.dispatch(setPhase(Phase.GAME_FINISHED));
                        } else {
                            store.dispatch(setPhase(Phase.DEALING_CARDS_START));
                        }
                    }
                );
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