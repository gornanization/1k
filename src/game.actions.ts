import { Card } from './game.interfaces';


interface Action {
    type: string;
}
//------------------------------------------------
export const ADD_PLAYER = 'ADD_PLAYER';
export interface AddPlayer extends Action {
    id: string
}
export function addPlayer(id: string): AddPlayer {
    return {
        type: ADD_PLAYER,
        id
    };
}
//------------------------------------------------
export const SET_DECK = 'SET_DECK';
export interface SetDeck extends Action {
    deck: Card[]
}
export function setDeck(deck: Card[]): SetDeck {
    return {
        type: SET_DECK,
        deck
    };
}
//------------------------------------------------
export const DEAL_CARD_TO_PLAYER = 'DEAL_CARD_TO_PLAYER';
export interface DealCardToPlayer extends Action {
    id: string
}
export function dealCardToPlayer(id: string): DealCardToPlayer {
    return {
        type: DEAL_CARD_TO_PLAYER,
        id
    };
}

//------------------------------------------------
export const DEAL_CARD_TO_STOCK = 'DEAL_CARD_TO_STOCK';
export interface DealCardToStock extends Action {}

export function dealCardToStock(): DealCardToStock {
    return {
        type: DEAL_CARD_TO_STOCK
    };
}

//------------------------------------------------
export const BID = 'BID';
export interface Bid extends Action {
    bid: number,
    pass: boolean,
    player: string
}

export function bid(player: string, bid: number, pass: boolean = false): Bid {
    return {
        type: BID,
        bid, player, pass
    };
}