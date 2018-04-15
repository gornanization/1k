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

    NOT_ENOUGHT_CARD_POINTS = 'NOT_ENOUGHT_CARD_POINTS',

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

export interface Player {
    id: string;
    battlePoints: (number|null)[]
}

export interface Card {
    rank: Rank,
    suit: Suit
}

export interface PlayersCards {
    [key: string]: CardPattern[]
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
    trickCards: CardPattern[],
    wonCards: PlayersCards
}

export type CardPattern = string;

export interface Settings {
    barrelPointsLimit: number,
    permitBombOnBarrel: boolean,
    maxBombs: number,
    shuffleAgainIfPointsCountLessThan: number
}

export interface Game {
    settings: Settings,
    phase: Phase,
    players: Player[],
    deck: CardPattern[],
    stock: CardPattern[],
    bid: PlayersBid[],
    battle: Battle | null,
    cards: PlayersCards
}

export type SchuffleCardsFunction = (notSchuffledCards: CardPattern[], cb: Function) => void;

export interface Thousand {
    events: any,
    init: () => void,
    getState: () => Game,
    registerPlayer: (player: string) => boolean,
    bid: (player: string, value: number) => boolean,
    increaseBid: (player: string, value: number) => boolean,
    pass: (player: string) => boolean,
    shareStock: (player: string, card: CardPattern, targetPlayer: string,) => boolean,
    throwCard: (card: CardPattern, player: string) => boolean,
    declareBomb: (player: string) => boolean,
    setCustomShufflingMethod: (_customShufflingMethod: SchuffleCardsFunction) => void
}
