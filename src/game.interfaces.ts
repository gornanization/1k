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

export enum Phase {
    REGISTERING_PLAYERS = 'REGISTERING_PLAYERS',
    
    DEALING_CARDS_START = 'DEALING_CARDS_START',
    DEALING_CARDS_IN_PROGRESS = 'DEALING_CARDS_IN_PROGRESS',
    DEALING_CARDS_FINISHED = 'DEALING_CARDS_FINISHED',

    BIDDING_START = 'BIDDING_START',
    BIDDING_IN_PROGRESS = 'BIDDING_IN_PROGRESS',
    BIDDING_FINISHED = 'BIDDING_FINISHED',

    BATTLE_START = 'BATTLE_START',
    FLIP_STOCK = 'FLIP_STOCK',
    ASSIGN_STOCK = 'ASSIGN_STOCK',
    SHARE_STOCK = 'SHARE_STOCK',
    BATTLE_IN_PROGRESS = 'BATTLE_IN_PROGRESS',
    BATTLE_FINISHED = 'BATTLE_FINISHED',

    BATTLE = 'BATTLE'
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

export interface TrumpAnnouncement {
    player: string,
    suit: Suit
}

export interface Battle {
    trumpAnnouncements: TrumpAnnouncement[],
    leadPlayer: string,
    trickCards: Card[],
    wonCards: PlayersCards
}

export interface Game {
    phase: Phase,
    players: Player[],
    deck: Card[],
    stock: Card[],
    bid: PlayersBid[],
    battle: Battle | null,
    cards: PlayersCards
}