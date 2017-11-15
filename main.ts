import { createStore } from 'redux';
import * as _ from 'lodash';

import { Game, Card, Suit, Rank, Player, Phase } from './src/game.interfaces';
import { registerPlayer, setDeck, dealCardToPlayer, dealCardToStock, bid, setPhase, ASSIGN_STOCK, assignStock, shareStock, initializeBattle, calculateBattleResult } from './src/game.actions';
import { game as gameReducer } from './src/game.reducer';
import { createDeck, createCard, getMarriages, createShuffledDeck } from './src/helpers/cards.helpers';
import { isRegisteringPlayersPhaseFinished } from './src/validators/player.validator';
import { isBattleFinished } from './src/validators/battle.validator';
import { getNextTurn } from './src/helpers/players.helpers';
import { isBiddingFinished } from './src/validators/bid.validator';
import { isSharingStockFinished } from './src/validators/stock.validator';
import { can } from './src/validators/game.validators';

const store = createStore(gameReducer);

store.subscribe(() => {
    const state: Game = store.getState();
    console.log(state);

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
                console.log('new bid done: ', state.bid);
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
            if(isBattleFinished(state)) {
                store.dispatch(setPhase(Phase.BATTLE_FINISHED));
            } else {
                console.log('NOT isBattleFinished')
            }
            break;
         case Phase.BATTLE_FINISHED:
            store.dispatch(calculateBattleResult());
            break;            
        default:
            break;
    }
});

function doAction(action: any): boolean {
    if (can(store.getState(), action)) {
        store.dispatch(action);
        return true;
    } else {
        console.log('can\'t do action:', action);
        return false;
    }
}
//REGISTERING_PLAYERS Phase

doAction(registerPlayer('adam'));
doAction(registerPlayer('alan'));
doAction(registerPlayer('pic'));

doAction(bid('alan', 0));
doAction(bid('pic', 0));

doAction(shareStock(store.getState().cards['adam'][0], 'alan'));
doAction(shareStock(store.getState().cards['adam'][0], 'pic'));

console.log('yeep');
