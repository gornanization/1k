import { createStore } from 'redux';
import * as _ from 'lodash';

import { Game, Card, Suit, Rank, Player, Phase } from './src/game.interfaces';
import { registerPlayer, setDeck, dealCardToPlayer, dealCardToStock, bid, setPhase } from './src/game.actions';
import { game as gameReducer } from './src/game.reducer';
import { createDeck, createCard, getMarriages } from './src/helpers/cards.helpers';
import { isRegisteringPlayersPhaseFinished } from './src/validators/player.validator';
import { getNextTurn } from './src/helpers/players.helpers';
import { isBiddingFinished } from './src/validators/bid.validator';


const store = createStore(gameReducer);

store.subscribe(() => {
    const state: Game = store.getState();
    
    console.log(state);

    if (state.phase === Phase.REGISTERING_PLAYERS) {
        if(isRegisteringPlayersPhaseFinished(state)) {
            store.dispatch(setPhase(Phase.DEALING_CARDS_START))
        }
    }

    if (state.phase === Phase.DEALING_CARDS_START) {
        store.dispatch(setPhase(Phase.DEALING_CARDS_IN_PROGRESS))
        
        const shuffledDeck = _.chain(createDeck())
            .shuffle()
            .value();

        store.dispatch(setDeck(shuffledDeck));

        for(let i = 0; i  < 7; i++) {
            _.each(state.players, (player: Player) => store.dispatch(dealCardToPlayer(player.id)))
        }
        for(let i = 0; i < 3; i++) {
            store.dispatch(dealCardToStock());
        }
        store.dispatch(setPhase(Phase.DEALING_CARDS_FINISHED))
    }

    if(state.phase === Phase.DEALING_CARDS_FINISHED) {
        store.dispatch(setPhase(Phase.BIDDING_START));
    }

    if(state.phase === Phase.BIDDING_START) {
        store.dispatch(setPhase(Phase.BIDDING_IN_PROGRESS));
        store.dispatch(bid(_.head(state.players).id, 100));
    }

    if(state.phase === Phase.BIDDING_IN_PROGRESS) {
        if(isBiddingFinished(state)) {
            store.dispatch(setPhase(Phase.BIDDING_FINISHED));
        } else {
            console.log('new bid done: ', state.bid);
        }
    }
    if(state.phase === Phase.BIDDING_FINISHED) {
        console.log('bidding finished');
    }
    
});


//REGISTERING_PLAYERS Phase

['adam', 'alan', 'pic'].forEach(player => store.dispatch(registerPlayer(player)));


store.dispatch(bid('alan', 0));
store.dispatch(bid('pic', 0));

// store.dispatch(bid('adam', 110));
// store.dispatch(bid('alan', 110));

// // console.log(getNextTurn(state.players, 'adam'));

// const cards = [
//     createCard('9♥'),
//     createCard('K♥'),
//     createCard('Q♥'),
//     createCard('K♣'),
//     createCard('Q♣'),
// ]

// console.log(getMarriages(cards));