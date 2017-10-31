import { createStore } from 'redux';
import * as _ from 'lodash';

import { Game, Card, Suit, Rank } from './src/game.interfaces';
import { registerPlayer, setDeck, dealCardToPlayer, dealCardToStock, bid, beginBiddingPhase } from './src/game.actions';
import { game as gameReducer } from './src/game.reducer';
import { createDeck, createCard, getMarriages } from './src/helpers/cards.helpers';
import { isRegisteringPlayersPhase } from './src/helpers/game.helpers';
import { isRegisteringPlayersPhaseFinished } from './src/validators/player.validator';

const store = createStore(gameReducer);

store.subscribe(() => {
    const state = store.getState();
    
    console.log(state);

    if(isRegisteringPlayersPhase(state)){
        if(isRegisteringPlayersPhaseFinished(state)) {
            store.dispatch(beginBiddingPhase());
        }
    }
});

const shuffledDeck = _.chain(createDeck())
    .shuffle()
    .value();

//REGISTERING_PLAYERS Phase

const players = ['adam', 'alan', 'pic'];
// add player
players.forEach(player => store.dispatch(registerPlayer(player)));



// // set card deck
// store.dispatch(setDeck(shuffledDeck));

// // deal cards
// for(let i = 0; i  < 7; i++) {
//     players.forEach(player => store.dispatch(dealCardToPlayer(player)));
// }


// for(let i = 0; i < 3; i++) {
//     store.dispatch(dealCardToStock());
// }

// store.dispatch(bid('pawel', 100));
// store.dispatch(bid('adam', 110));
// store.dispatch(bid('alan', 110));


// const state = store.getState();
// console.log(state);

// // console.log(getNextTurn(state.players, 'adam'));

// const cards = [
//     createCard('9♥'),
//     createCard('K♥'),
//     createCard('Q♥'),
//     createCard('K♣'),
//     createCard('Q♣'),
// ]

// console.log(getMarriages(cards));