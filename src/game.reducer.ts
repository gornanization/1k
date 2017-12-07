import { Game, Phase, Battle, Player, PlayersCards, PlayersBid } from './game.interfaces';
import { SET_DECK, DEAL_CARD_TO_PLAYER, DEAL_CARD_TO_STOCK, BID, Bid, REGISTER_PLAYER, SET_PHASE, ASSIGN_STOCK, SHARE_STOCK, INITIALIZE_BATTLE, THROW_CARD, CALCULATE_BATTLE_RESULT, FINALIZE_TRICK, INITIALIZE_BIDDING, bid, DECLARE_BOMB } from './game.actions';
import * as _ from 'lodash';
import { getBidWinner, getUniqueBidders, isBidder } from './helpers/bid.helpers';
import { getCard } from './helpers/cards.helpers';
import { calculatePointsByPlayer } from './helpers/battle.helpers';
import { getNextBiddingTurn } from './helpers/players.helpers';

const defaultState: Game = {
    settings: {
        permitBombOnBarrel: true,
        maxBombs: 2,
        barrelPointsLimit: 880
    },
    phase: Phase.REGISTERING_PLAYERS_START,
    players: [],
    deck: [],
    stock: [],
    bid: [],
    cards: {},
    battle: null
}

export function game(state: Game = defaultState, action) {
    switch (action.type) {
        case BID:
            {
                const { player, bid, pass } = action as Bid;
                return {
                    ...state,
                    bid: [{ player, bid, pass }, ...state.bid]
                };
            }
        case DEAL_CARD_TO_STOCK:
            {
                const [firstDeckCard, ...restDeckCards] = state.deck;
                return {
                    ...state,
                    stock: [firstDeckCard, ...state.stock],
                    deck: restDeckCards
                };
            }
        case DEAL_CARD_TO_PLAYER:
            const [firstDeckCard, ...restDeckCards] = state.deck;
            return {
                ...state,
                cards: {
                    ...state.cards,
                    [action.id]: [firstDeckCard, ...state.cards[action.id]]
                },
                deck: restDeckCards
            };
        case SET_DECK:
            return {
                ...state,
                deck: [...action.deck]
            };
        case REGISTER_PLAYER:
            return {
                ...state,
                players: [...state.players, { id: action.id, battlePoints: [] } as Player],
                cards: {
                    ...state.cards,
                    [action.id]: []
                }
            };
        case SET_PHASE: {
            return {
                ...state,
                phase: action.phase
            }
        }
        case ASSIGN_STOCK: {
            const winnerPlayerId = getBidWinner(state.bid).player;
            return {
                ...state,
                phase: Phase.SHARE_STOCK,
                stock: [],
                cards: {
                    ...state.cards,
                    [winnerPlayerId]: [
                        ...state.cards[winnerPlayerId],
                        ...state.stock
                    ]
                }
            }
        }
        case SHARE_STOCK: {
            const winnerPlayerId = getBidWinner(state.bid).player;
            const targetPlayerId = action.player;

            const winnerPlayerCards = state.cards[winnerPlayerId];
            const targetPlayerCards = state.cards[targetPlayerId]

            const cardToShare = getCard(winnerPlayerCards, action.card);
            
            return {
                ...state,
                stock: [],
                cards: {
                    ...state.cards,
                    [winnerPlayerId]: _.without(winnerPlayerCards, cardToShare),
                    [targetPlayerId]: [{...cardToShare}, ...targetPlayerCards]
                }
            }
        }
        case INITIALIZE_BATTLE: {
            return {
                ...state,
                phase: Phase.BATTLE_START,
                battle: {
                    trumpAnnouncements: [],
                    leadPlayer: getBidWinner(state.bid).player,
                    trickCards: [],
                    wonCards: _.reduce(state.players, (wonCards: PlayersCards, player: Player) => {
                        wonCards[player.id] = [];
                        return wonCards;
                    }, {})
                } as Battle
            }
        }
        case INITIALIZE_BIDDING: {
            return {
                ...state,
                phase: Phase.BIDDING_IN_PROGRESS,
                bid: [
                    {bid: 100, player: getNextBiddingTurn(state), pass: false}
                ] as PlayersBid[]
            };
        }        
        case THROW_CARD: {
            const battle = state.battle;
            const playerCard = getCard(state.cards[action.player], action.card)
            return {
                ...state,
                cards: {
                    ...state.cards,
                    [action.player]: _.without(state.cards[action.player], playerCard)
                },
                battle: {
                    ...battle,
                    trickCards: [...battle.trickCards, { ...playerCard }],
                } as Battle
            }
        }
        case CALCULATE_BATTLE_RESULT: {
            return {
                ...state,
                phase: Phase.BATTLE_RESULTS_ANNOUNCEMENT,
                players: _.chain(state.players)
                    .map(({id, battlePoints}: Player) => {
                        return {
                            id, 
                            battlePoints: [...battlePoints, calculatePointsByPlayer(state, id)]
                        } as Player;
                    })
                    .value()
            }
        }
        case DECLARE_BOMB: {
            return {
                ...state,
                phase: Phase.BOMB_DECLARED,
                deck: [],
                bid: [],
                cards: _.reduce(state.players, (cards, player: Player) => {
                    cards[player.id] = [];
                    return cards;
                }, {}),
                battle: null,
                players: _.reduce(state.players, (players, {id, battlePoints}: Player) => {
                    players.push({
                        id,
                        battlePoints: [...battlePoints, action.player === id ? null : 60]
                    })
                    return players;
                }, [])
            }
        }
        case FINALIZE_TRICK: {
            return {
                ...state,
                phase: Phase.ASSIGN_TRICK_CARDS,
                battle: {
                    ...state.battle,
                    leadPlayer: action.trickWinner,
                    trickCards: [],
                    wonCards: {
                        ...state.battle.wonCards,
                        [action.trickWinner]: [
                            ...state.battle.trickCards,
                            ...state.battle.wonCards[action.trickWinner]
                        ]
                    }
                }
            }
        }
        default:
            return state
    }
}