import { Thousand, Game, Phase, Player, PlayersBid, CardPattern } from '../../src/game.interfaces';
import { initializeGame } from '../../src/game';
import * as should from 'should';

describe.only('dealing cards', () => {
    it('sets cards and initializes bidding process', () => {

        const history = [];
        const initState: Game = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.REGISTERING_PLAYERS_FINISHED,
            players: [
                { id: 'adam', battlePoints: [] },
                { id: 'alan', battlePoints: [] },
                { id: 'pic', battlePoints: [] }
            ],
            deck: [],
            stock: [],
            bid: [],
            cards: {},
            battle: null
        }

        const thousand: Thousand = initializeGame(initState);
        // thousand.setCustomShufflingMethod((cards: CardPattern[], cb) => cb(cards));
        
        thousand.events.addListener('phaseUpdated', next => {
            const state: Game = thousand.getState();

            history.push(state.phase);

            if(state.phase === Phase.BIDDING_IN_PROGRESS) {
                should(history).be.deepEqual([
                    Phase.REGISTERING_PLAYERS_FINISHED,
                    Phase.DEALING_CARDS_START,
                    Phase.DEALING_CARDS_FINISHED,
                    Phase.BIDDING_START,
                    Phase.BIDDING_IN_PROGRESS
                ]);

                //sets cards
                should(state.cards['adam'].length).be.equal(8);
                should(state.cards['alan'].length).be.equal(8);
                should(state.cards['pic'].length).be.equal(8);
                should(state.deck.length).be.equal(0);
                should(state.stock.length).be.equal(3);

                console.log(state.stock);

                //sets default bid
                should(state.bid).be.deepEqual([
                    { player: 'adam', bid: 100, pass: false} as PlayersBid
                ]);
            }
            next();
        });

        thousand.init();
    });
});
