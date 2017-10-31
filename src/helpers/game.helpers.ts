import { Game, Phase } from '../game.interfaces';

export function isConfigurationPhase(state: Game): boolean {
    return Phase.CONFIGURATION === state.phase;
}

export function isBiddingPhase(state: Game): boolean {
    return Phase.BID === state.phase;
}
