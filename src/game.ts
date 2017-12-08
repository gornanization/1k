import { createStore } from 'redux';
import * as _ from 'lodash';

import { Game, Card, Suit, Rank, Player, Phase, Thousand } from './../src/game.interfaces';
import { registerPlayer, setDeck, dealCardToPlayer, dealCardToStock, bid, setPhase, ASSIGN_STOCK, assignStock, shareStock, initializeBattle, calculateBattleResult } from './../src/game.actions';
import { game as gameReducer } from './../src/game.reducer';
import { createDeck, createCard, getMarriages, createShuffledDeck } from './../src/helpers/cards.helpers';
import { isRegisteringPlayersPhaseFinished } from './../src/validators/player.validator';
import { isBattleFinished, isTrickFinished } from './../src/validators/battle.validator';
import { getNextTurn, getWinner, getNextBiddingTurn } from './../src/helpers/players.helpers';
import { isBiddingFinished } from './../src/validators/bid.validator';
import { isSharingStockFinished } from './../src/validators/stock.validator';
import { can, isGameFinished } from './../src/validators/game.validators';
import { getBidWinner, noOneParticipatedInBidding } from './helpers/bid.helpers';
import { throwCard, initializeBidding, finalizeTrick, declareBomb } from './game.actions';
import { getTrickWinner } from './helpers/battle.helpers';
var EventEmitter = require('wolfy87-eventemitter');

export function initializeGame(defaultState: Game = undefined): Thousand {
    const store = createStore(gameReducer, defaultState);
    const events: any = new EventEmitter();
    let emitActionEvent = null;
    function manageAction(action: any) {
        let result = false;
        if (can(store.getState(), action)) {
            emitActionEvent = () => events.emit('action', action);
            store.dispatch(action);
            result = true;
        } else {
            console.log('can\'t do action:', action);
            result = false;
        }
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
        declareBomb: (player: string) =>                manageAction(declareBomb(player)),
        //utils:
        getState: () => store.getState(),
        init: () => store.dispatch(setPhase(store.getState().phase))
    };

    
    
    let previousPhase: Phase = null;
    store.subscribe(() => {
        if(emitActionEvent) {
            emitActionEvent();
            emitActionEvent = null;
        }
        const state: Game = store.getState();
        const isNew = (previousPhase !== state.phase);

        function updatePreviousState() {
            previousPhase = state.phase;
        }
        
        const phaseHandler = {
            [Phase.REGISTERING_PLAYERS_START]: (isFirst) => {
                events.emit(
                    'phaseUpdated',
                    () => store.dispatch(setPhase(Phase.REGISTERING_PLAYERS_IN_PROGRESS)),
                    isFirst
                );
            },
            [Phase.REGISTERING_PLAYERS_IN_PROGRESS]: (isFirst) => {
                events.emit('phaseUpdated', () => {}, isFirst);
                if (isRegisteringPlayersPhaseFinished(state)) {
                    store.dispatch(setPhase(Phase.REGISTERING_PLAYERS_FINISHED));
                }
            },
            [Phase.REGISTERING_PLAYERS_FINISHED]: (isFirst) => {
                events.emit(
                    'phaseUpdated', 
                    () => store.dispatch(setPhase(Phase.DEALING_CARDS_START)),
                    isFirst
                );
            },
            [Phase.DEALING_CARDS_START]: (isFirst) => {
                events.emit(
                    'phaseUpdated', 
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
                    },
                    isFirst
                );
            },
            [Phase.DEALING_CARDS_FINISHED]: (isFirst) => {
                events.emit(
                    'phaseUpdated', 
                    () => store.dispatch(setPhase(Phase.BIDDING_START)),
                    isFirst
                );
            },
            [Phase.BIDDING_START]: (isFirst) => {
                events.emit(
                    'phaseUpdated', 
                    () => {                        
                        store.dispatch(initializeBidding());
                    },
                    isFirst
                );
            },
            [Phase.BIDDING_IN_PROGRESS]: (isFirst) => {
                events.emit('phaseUpdated', () => {}, isFirst);
                if (isBiddingFinished(state)) {
                    store.dispatch(setPhase(Phase.BIDDING_FINISHED));
                }
            },
            [Phase.BIDDING_FINISHED]: (isFirst) => {
                events.emit(
                    'phaseUpdated', 
                    () => {
                        if(noOneParticipatedInBidding(state.bid)) {
                            store.dispatch(setPhase(Phase.ASSIGN_STOCK));
                        } else {
                            store.dispatch(setPhase(Phase.FLIP_STOCK));
                        }
                    },
                    isFirst
                );
            },               
            [Phase.FLIP_STOCK]: (isFirst) => {
                events.emit(
                    'phaseUpdated',
                    () => store.dispatch(setPhase(Phase.ASSIGN_STOCK)),
                    isFirst
                );
            },
            [Phase.ASSIGN_STOCK]: (isFirst) => {
                events.emit(
                    'phaseUpdated',
                    () => {
                        store.dispatch(assignStock());
                    },
                    isFirst
                );
            },
            [Phase.SHARE_STOCK]: (isFirst) => {
                events.emit('phaseUpdated', () => {}, isFirst);
                if (isSharingStockFinished(state)) {
                    store.dispatch(initializeBattle());
                }
            },
            [Phase.BOMB_DECLARED]: (isFirst) => {
                events.emit('phaseUpdated', () => {
                    store.dispatch(setPhase(Phase.DEALING_CARDS_START));
                }, isFirst);
            },
            [Phase.BATTLE_START]: (isFirst) => {
                events.emit(
                    'phaseUpdated',
                    () => store.dispatch(setPhase(Phase.TRICK_START)),
                    isFirst
                );
            },
            [Phase.TRICK_START]: (isFirst) => {
                events.emit(
                    'phaseUpdated',
                    () => store.dispatch(setPhase(Phase.TRICK_IN_PROGRESS)),
                    isFirst
                );
            },            
            [Phase.TRICK_IN_PROGRESS]: (isFirst) => {
                events.emit('phaseUpdated', () => {}, isFirst);
                if(isTrickFinished(state)) {
                    store.dispatch(setPhase(Phase.TRICK_FINISHED));
                }
            },
            [Phase.TRICK_FINISHED]: (isFirst) => {
                events.emit(
                    'phaseUpdated',
                    () => {
                        store.dispatch(finalizeTrick(getTrickWinner(state)));
                    },
                    isFirst
                );
            },
            [Phase.ASSIGN_TRICK_CARDS]: (isFirst) => {
                events.emit(
                    'phaseUpdated',
                    () => {
                        if(isBattleFinished(state)) {
                            store.dispatch(setPhase(Phase.BATTLE_FINISHED));
                        } else {
                            store.dispatch(setPhase(Phase.TRICK_START))
                        }
                    },
                    isFirst
                );
            },
             [Phase.BATTLE_FINISHED]: (isFirst) => {
                events.emit(
                    'phaseUpdated',
                    () => store.dispatch(calculateBattleResult()),
                    isFirst
                );
            },
            [Phase.BATTLE_RESULTS_ANNOUNCEMENT]: (isFirst) => {
                events.emit(
                    'phaseUpdated',
                    () => {
                        if (isGameFinished(state)) {
                            store.dispatch(setPhase(Phase.GAME_FINISHED));
                        } else {
                            store.dispatch(setPhase(Phase.DEALING_CARDS_START));
                        }
                    },
                    isFirst
                );
            },
            [Phase.GAME_FINISHED]: (isFirst) => {
                events.emit(
                    'phaseUpdated',
                    () => store.dispatch(calculateBattleResult()),
                    isFirst
                );
            }
        };
        const isFirst = previousPhase !== state.phase;
        updatePreviousState();
        phaseHandler[state.phase] && phaseHandler[state.phase](isFirst);
    });

    return thousand;
}