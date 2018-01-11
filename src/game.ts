import { createStore } from 'redux';
import * as _ from 'lodash';

import { Game, Card, Suit, Rank, Player, Phase, Thousand, CardPattern, SchuffleCardsFunction } from './game.interfaces';
import { registerPlayer, setDeck, dealCardToPlayer, dealCardToStock, bid, setPhase, ASSIGN_STOCK, assignStock, shareStock, initializeBattle, calculateBattleResult, increaseBid } from './game.actions';
import { game as gameReducer } from './game.reducer';
import { createDeck, getMarriages } from './helpers/cards.helpers';
import { isRegisteringPlayersPhaseFinished } from './validators/player.validator';
import { isBattleFinished, isTrickFinished } from './validators/battle.validator';
import { getNextTurn, getWinner, getNextBiddingTurn } from './helpers/players.helpers';
import { isBiddingFinished } from './validators/bid.validator';
import { isSharingStockFinished } from './validators/stock.validator';
import { can, isGameFinished } from './validators/game.validators';
import { getBidWinner, noOneParticipatedInBidding } from './helpers/bid.helpers';
import { throwCard, initializeBidding, finalizeTrick, declareBomb } from './game.actions';
import { getTrickWinner } from './helpers/battle.helpers';
const EventEmitter = require('wolfy87-eventemitter');

export function initializeGame(defaultState: Game = undefined): Thousand {
    const store = createStore(gameReducer, defaultState);
    const events: any = new EventEmitter();
    const defaultShufflingMethod: SchuffleCardsFunction = (notShuffledCards: CardPattern[], cb: Function) => cb(_.shuffle(notShuffledCards));

    let customShufflingMethod: SchuffleCardsFunction = defaultShufflingMethod;
    let emitActionEvent = null;

    function someActionListenersRegistered() {
        return events.getListeners('action').length > 0;
    }

    function manageAction(action: any) {
        let result = false;
        if (can(store.getState(), action)) {
            if(someActionListenersRegistered()) {
                events.emit('action', action, () => {
                    store.dispatch(action);
                });
            } else {
                store.dispatch(action);
            }
            result = true;
        } else {
            result = false;
        }
        return result;
    }   

    

    const thousand: Thousand = {
        events,
        //actions:
        registerPlayer: player =>                                                manageAction(registerPlayer(player)),
        bid: (player: string, value: number) =>                                  manageAction(bid(player, value)),
        pass: (player: string) =>                                                manageAction(bid(player, 0)),
        shareStock: (player: string, card: CardPattern, targetPlayer: string) => manageAction(shareStock(player, card, targetPlayer)),
        throwCard: (card: CardPattern, player: string) =>                        manageAction(throwCard(card, player)),
        declareBomb: (player: string) =>                                         manageAction(declareBomb(player)),
        increaseBid: (player: string, value: number) =>                          manageAction(increaseBid(player, value)),
        //utils:
        setCustomShufflingMethod: function(_customShufflingMethod: SchuffleCardsFunction): void {
            customShufflingMethod = _customShufflingMethod;
        },
        getState: () => store.getState(),
        init: () => store.dispatch(setPhase(store.getState().phase))
    };
    
    let previousPhase: Phase = null;
    store.subscribe(() => {
        onStoreChanged();
    });

    function onStoreChanged() {
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
                        customShufflingMethod(createDeck(), (shuffledDeck: CardPattern[]) => {
                            store.dispatch(setDeck(shuffledDeck));
                            _.each(state.players, (player: Player) => {
                                for (let i = 0; i < 7; i++) {
                                    store.dispatch(dealCardToPlayer(player.id))       
                                }
                            });
                            for (let i = 0; i < 3; i++) {
                                store.dispatch(dealCardToStock());
                            }
                            store.dispatch(setPhase(Phase.DEALING_CARDS_FINISHED));
                        });
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
                    () => {},
                    isFirst
                );
            }
        };
        const isFirst = previousPhase !== state.phase;
        updatePreviousState();
        phaseHandler[state.phase] && phaseHandler[state.phase](isFirst);
    }

    return thousand;
}