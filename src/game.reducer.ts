import { Game } from './game.interfaces';
import { ADD_PLAYER, SET_DECK, DEAL_CARD_TO_PLAYER, DEAL_CARD_TO_STOCK, BID, Bid } from './game.actions';

const defaultState: Game = {
    players: [],
    deck: [],
    stock: [],
    bid: [],
    cards: {}
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
        case ADD_PLAYER:
            return {
                ...state,
                players: [...state.players, { id: action.id }],
                cards: {
                    ...state.cards,
                    [action.id]: []
                }
            };
        default:
            return state
    }
}