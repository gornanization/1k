import * as _ from 'lodash'

import { initializeGame } from './game'
import { Thousand, Game, Battle, Phase, PlayersBid, PreferredAction } from './game.interfaces'
import { canThrowCard } from './validators/battle.validator'
import { getNextTrickTurn } from './helpers/battle.helpers'
import { throwCard, bid, shareStock } from './game.actions'
import { canBid } from './validators/bid.validator'
import { createCardPatterns } from './helpers/cards.helpers'
import { canShareStock } from './validators/stock.validator'
import { getPlayerOpponents } from './helpers/players.helpers'

function createPreferredAction(type: string, args: string[]): PreferredAction {
    return { type, args }
}

export function getPreferredAction(player: string, inputState: Game): PreferredAction | null {
    const thousand: Thousand = initializeGame(inputState)
    thousand.init()

    const state = thousand.getState()

    const phaseHandlers = {
        [Phase.TRICK_IN_PROGRESS]() {
            const cardToThrow = _.chain(state.cards[player])
                .find(card => canThrowCard(state, throwCard(card, player)))
                .value()
                
            return cardToThrow ? createPreferredAction('throwCard',  [cardToThrow, player]) : null
        },
        [Phase.BIDDING_IN_PROGRESS]() {
            const canPlayerPass = canBid(state, bid(player, 0))
            return canPlayerPass ? createPreferredAction('pass', [player]) : null
        },
        [Phase.SHARE_STOCK]() {
            const cardToShare = state.cards[player][0]

            const opponent = _.chain(getPlayerOpponents(state, player))
                .find((opponent: string) => canShareStock(state, shareStock(player, cardToShare, opponent)))
                .value()
                
            return opponent ? createPreferredAction('shareStock', [player, cardToShare, opponent]) : null
        }
    }

    const phaseHandler = phaseHandlers[state.phase]
    return phaseHandler ? phaseHandler() : null
}
