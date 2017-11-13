import { Game, Phase, Battle, Player } from './game.interfaces';
import { SET_DECK, DEAL_CARD_TO_PLAYER, DEAL_CARD_TO_STOCK, BID, Bid, REGISTER_PLAYER, SET_PHASE, ASSIGN_STOCK, SHARE_STOCK, INITIALIZE_BATTLE } from './game.actions';
import * as _ from 'lodash';
import { getBidWinner } from './helpers/bid.helpers';
import { getCard } from './helpers/cards.helpers';

const defaultState: Game = {
    phase: Phase.REGISTERING_PLAYERS,
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
                players: [...state.players, { id: action.id }],
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
                battle: {
                    trumpAnnouncements: [],
                    leadPlayer: getBidWinner(state.bid).player,
                    trickCards: [],
                    wonCards: _.reduce(state.players, (wonCards, player: Player) => {
                        wonCards[player.id] = [];
                        return wonCards;
                    }, {})
                } as Battle
            }
        }
        default:
            return state
    }
}