import { createStore } from 'redux';
import * as _ from 'lodash';

import { Game, Card, Suit, Rank } from './src/game.interfaces';
import { addPlayer, setDeck, dealCardToPlayer, dealCardToStock, bid } from './src/game.actions';
import { game as gameReducer } from './src/game.reducer';
import { createDeck } from './src/deck';
import { getNextTurn, createCard, getMarriages } from './src/game.helpers';

const store = createStore(gameReducer);

store.subscribe(() => {
    const state = store.getState();
});

const shuffledDeck = _.chain(createDeck())
    .shuffle()
    .value();

const players = ['adam', 'alan', 'pic'];

// add player
players.forEach(player => store.dispatch(addPlayer(player)));

// set card deck
store.dispatch(setDeck(shuffledDeck));

// deal cards
for(let i = 0; i  < 7; i++) {
    players.forEach(player => store.dispatch(dealCardToPlayer(player)));
}

for(let i = 0; i < 3; i++) {
    store.dispatch(dealCardToStock());
}


store.dispatch(bid('pawel', 100));
store.dispatch(bid('adam', 110));
store.dispatch(bid('alan', 110));


const state = store.getState();
console.log(state);

// console.log(getNextTurn(state.players, 'adam'));


// expect(Color.getNameByColor(Color.Hearts)).toEqual('♥');
// expect(Color.getNameByColor(Color.Diamonds)).toEqual('♦');
// expect(Color.getNameByColor(Color.Clubs)).toEqual('♣');
// expect(Color.getNameByColor(Color.Spades)).toEqual('♠');

const cards = [
    createCard('9♥'),
    createCard('K♥'),
    createCard('Q♥'),
    createCard('K♣'),
    createCard('Q♣'),
]

console.log(getMarriages(cards));