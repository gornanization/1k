import { Game, Phase } from '../game.interfaces';

export function isRegisteringPlayersPhase(state: Game): boolean {
    return Phase.REGISTERING_PLAYERS === state.phase;
}

export function isBiddingPhase(state: Game): boolean {
    return Phase.BID === state.phase;
}
