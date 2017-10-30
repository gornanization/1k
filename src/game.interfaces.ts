export enum Suit {
    Heart =  '♥',
    Diamond = '♦',
    Club = '♣',
    Spade = '♠'
}

export enum Rank {
    Ace	= 'A',
    King = 'K',
    Queen = 'Q',
    Jack = 'J',
    Ten = '10',
    Nine = '9'
}


export interface Player {
    id: string;
}

export interface Card {
    rank: Rank,
    suit: Suit
}

export interface PlayersCards {
    [key: string]: Card[]
}

export interface PlayersBid {
    player: string,
    bid: number,
    pass: boolean
}

export interface Game {
    players: Player[],
    deck: Card[],
    stock: Card[],
    bid: PlayersBid[],
    cards: PlayersCards
}