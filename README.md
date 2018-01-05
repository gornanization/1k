[![Build Status](https://travis-ci.org/gornanization/1k.svg?branch=master)](https://travis-ci.org/gornanization/1k)
[![Coverage Status](https://coveralls.io/repos/github/gornanization/1k/badge.svg)](https://coveralls.io/github/gornanization/1k)
[![utopian.io payment2](https://utopian-io.herokuapp.com/gornanization/1k-table)](https://utopian-io.herokuapp.com/visit/gornanization/1k-table)
# 1k

♥ ♦ ♣ ♠

Thousand card game logic, written in TypeScript.


## Working example

Visit https://plnkr.co/edit/o73CajJDIuEZWHp1kH0C?p=preview and observe console output


## How to install?

```sh
$ npm install -S 1k
```

## How to use?

### Actions:

```ts

import { initializeGame, createCard, Thousand, Game } from '1k';

const thousand: Thousand = initializeGame();
thousand.init();

let result: boolean; // its a result of action, true - action succeed, false otherwise

// registers player with specific name
result = thousand.registerPlayer('adam');
result = thousand.registerPlayer('pic');

// player makes a bid
result = thousand.bid('adam', 120);
// player passes
result = thousand.pass('adam');

// player (adam) shares card (9♥) with opponent (alan)
result = thousand.shareStock('adam', createCard('9♥'), 'alan');

// player declares a bomb
result = thousand.declareBomb('adam');

// player increases his bid
result = thousand.increaseBid('adam', 130);

// player throws a card
result = thousand.throwCard(createCard('A♥'), 'adam');

// get entire game state object
const state: Game = thousand.getState();
console.log(state);

```

### Phases:

Available phases:

```ts

enum Phase {
    REGISTERING_PLAYERS_START = 'REGISTERING_PLAYERS_START',
    REGISTERING_PLAYERS_IN_PROGRESS = 'REGISTERING_PLAYERS_IN_PROGRESS',
    REGISTERING_PLAYERS_FINISHED = 'REGISTERING_PLAYERS_FINISHED',
    
    DEALING_CARDS_START = 'DEALING_CARDS_START',
    DEALING_CARDS_IN_PROGRESS = 'DEALING_CARDS_IN_PROGRESS',
    DEALING_CARDS_FINISHED = 'DEALING_CARDS_FINISHED',

    BIDDING_START = 'BIDDING_START',
    BIDDING_IN_PROGRESS = 'BIDDING_IN_PROGRESS',
    BIDDING_FINISHED = 'BIDDING_FINISHED',

    BATTLE_START = 'BATTLE_START',
    TRICK_START = 'TRICK_START',
    TRICK_IN_PROGRESS = 'TRICK_IN_PROGRESS',
    TRICK_FINISHED = 'TRICK_FINISHED',
    FLIP_STOCK = 'FLIP_STOCK',
    ASSIGN_STOCK = 'ASSIGN_STOCK',
    SHARE_STOCK = 'SHARE_STOCK',
    BATTLE_FINISHED = 'BATTLE_FINISHED',
    BATTLE_RESULTS_ANNOUNCEMENT = 'BATTLE_RESULTS_ANNOUNCEMENT',
    ASSIGN_TRICK_CARDS = 'ASSIGN_TRICK_CARDS',
    BOMB_DECLARED = 'BOMB_DECLARED',
    GAME_FINISHED = 'GAME_FINISHED'
}
```


### Events:

```ts

import { initializeGame, createCard, Thousand } from '1k';

const thousand: Thousand = initializeGame();

// called whenever game is updated
thousand.events.addListener('phaseUpdated', next => {
    const state: Game = thousand.getState();
    console.log('Current phase', state.phase);
    console.log('Current state', state);
    
    // after managing state, let the game proceed...
    next();
});

// called, when any action made succesfully
thousand.events.addListener('action', action => {
    const state: Game = thousand.getState();
    console.log('action made succesfully: ', action);
});

```


## Putting all together:

See https://plnkr.co/edit/o73CajJDIuEZWHp1kH0C?p=preview 
