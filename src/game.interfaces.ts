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
    GAME_FINISHED = 'GAME_FINISHED'
}

export interface Player {
    id: string;
    battlePoints: (number|null)[]
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

export interface Settings {
    barrelPointsLimit: number,
    permitBombOnBarrel: boolean,
    maxBombs: number
}

export interface Game {
    settings: Settings,
    phase: Phase,
    players: Player[],
    deck: Card[],
    stock: Card[],
    bid: PlayersBid[],
    battle: Battle | null,
    cards: PlayersCards
}

export interface Thousand {
    events: any,
    init: () => void,
    getState: () => Game,
    registerPlayer: (player: string) => boolean
    bid: (player: string, value: number) => boolean
    pass: (player: string) => boolean,
    shareStock: (card: Card, player: string) => boolean,
    throwCard: (card: Card, player: string) => boolean,
    declareBomb: (player: string) => boolean
}
