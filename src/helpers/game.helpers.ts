import { Game, Phase } from '../game.interfaces';
import { Base64 } from 'js-base64';
import * as _ from 'lodash';
import { defaultState } from '../game.reducer'

export function isBomb(pointsValue: number | null): boolean {
    return pointsValue === null;
}

export function loadStateFromText(text: string): Game {
    try {
        return JSON.parse(Base64.decode(text));
    } catch (e) { }
    return null;
}

export function saveStateToText(state: Game): string {
    return Base64.encode(JSON.stringify(state));
}

export function extendStateWithDefaults(game) {
    let loadedState = game ? _.extend({}, defaultState, game) : undefined

    if (!loadedState) return loadedState;

    loadedState.cards = loadedState.cards || {};
    
    if (loadedState.battle) {
        const battle = loadedState.battle;

        battle.trickCards = battle.trickCards || [];
        battle.trumpAnnouncements = battle.trumpAnnouncements || [];
        battle.wonCards = battle.wonCards || {};
    }

    _.each(loadedState.players, (player) => {
        const battle = loadedState.battle;

        loadedState.cards[player.id] = loadedState.cards[player.id] || []

        player.battlePoints = player.battlePoints || [];
        if (battle) {
            battle.wonCards[player.id] = battle.wonCards[player.id] || [];
        }
        
        player.battlePoints = player.battlePoints.map(a => a === 'null' ? null : a)
    });

    return loadedState;
}
