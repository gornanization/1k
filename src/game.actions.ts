import { Card, Phase } from './game.interfaces';


export interface Action {
    type: string;
}
//------------------------------------------------
export const REGISTER_PLAYER = 'REGISTER_PLAYER';
export interface RegisterPlayer extends Action {
    id: string
}
export function registerPlayer(id: string): RegisterPlayer {
    return {
        type: REGISTER_PLAYER,
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
export function bid(player: string, bid: number): Bid {
    const pass = bid === 0;
    return {
        type: BID,
        bid, player, pass
    };
}
//------------------------------------------------
export const SET_PHASE = 'SET_PHASE';
export interface SetPhase extends Action {
    phase: Phase
}
export function setPhase(phase: Phase): SetPhase {
    return {
        type: SET_PHASE,
        phase
    };
}
//------------------------------------------------
export const SHARE_STOCK = 'SHARE_STOCK';
export interface ShareStock extends Action {
    card: Card,
    player: string
}
export function shareStock(card: Card, player: string): ShareStock {
    return {
        type: SHARE_STOCK,
        card, player
    };
}
//------------------------------------------------
export const ASSIGN_STOCK = 'ASSIGN_STOCK';
export interface AssignStock extends Action {}
export function assignStock(): AssignStock {
    return {
        type: ASSIGN_STOCK
    };
}
//------------------------------------------------
export const INITIALIZE_BATTLE = 'INITIALIZE_BATTLE';
export function initializeBattle(): Action {
    return {
        type: INITIALIZE_BATTLE
    };
}
