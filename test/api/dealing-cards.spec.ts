import { Thousand, Game, Phase, Player, PlayersBid, CardPattern } from '../../src/game.interfaces';
import { initializeGame } from '../../src/game';
import * as should from 'should';

describe('dealing cards', () => {
    it('sets cards and initializes bidding process', (done) => {

        const history = [];
        const initState: Game = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 18
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
        thousand.setCustomShufflingMethod((cards: CardPattern[], cb) => {
            setTimeout(() => cb(cards));
        });
        
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
                should(state.cards['adam'].length).be.equal(7);
                should(state.cards['alan'].length).be.equal(7);
                should(state.cards['pic'].length).be.equal(7);
                should(state.deck.length).be.equal(0);
                should(state.stock.length).be.equal(3);


                should(state.cards['adam']).deepEqual(['A♥', 'K♥', 'Q♥', 'J♥', '10♥', '9♥', 'A♦']);
                
                //sets default bid
                should(state.bid).be.deepEqual([
                    { player: 'adam', bid: 100, pass: false} as PlayersBid
                ]);

                done();
            }
            next();
        });

        thousand.init();
    });
    
    it('dsds', (done) => {

        const history = [];
        const initState: Game = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 18
            },
            phase: Phase.DEALING_CARDS_FINISHED,
            players: [
                { id: 'adam', battlePoints: [120, null] },
                { id: 'alan', battlePoints: [100, 60] },
                { id: 'pic', battlePoints: [100, 60] }
            ],
            deck: ['10♥', 'A♥', '10♠'],
            stock: [],
            bid: [
                { player: 'alan', bid: 0, pass: true },
                { player: 'adam', bid: 0, pass: true },
                { player: 'pic', bid: 100, pass: false }
            ],
            cards: {
                'adam': ['9♥',  '9♦', '9♣', 'J♥', 'Q♥', 'K♥', '9♠'],
                'alan': ['10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠', 'Q♠'],
                'pic':  ['10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'K♠', 'A♠']
            },
            battle: null
        }

        const thousand: Thousand = initializeGame(initState);
        thousand.setCustomShufflingMethod((cards: CardPattern[], cb) => {
            setTimeout(() => cb(cards));
        });
        
        thousand.events.addListener('phaseUpdated', next => {
            const state: Game = thousand.getState();

            history.push(state.phase);

            if(state.phase === Phase.BIDDING_IN_PROGRESS) {
                should(history).be.deepEqual([
                    Phase.DEALING_CARDS_FINISHED,
                    Phase.NOT_ENOUGHT_CARD_POINTS,
                    Phase.DEALING_CARDS_START,
                    Phase.DEALING_CARDS_FINISHED,
                    Phase.BIDDING_START,
                    Phase.BIDDING_IN_PROGRESS
                ]);
                done();
            }
            next();
        });

        thousand.init();
    });
});
