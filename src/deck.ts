import { Card, Rank, Suit } from './game.interfaces';

export function createDeck(): Card[] {
    function getDeckBySuit(suit: Suit): Card[] {
        return [
            { rank: Rank.Ace, suit }, { rank: Rank.King, suit },
            { rank: Rank.Queen, suit }, { rank: Rank.Jack, suit },
            { rank: Rank.Ten, suit }, { rank: Rank.Nine, suit }
        ];
    }
    return [
        ...getDeckBySuit(Suit.Heart),
        ...getDeckBySuit(Suit.Diamond),
        ...getDeckBySuit(Suit.Club),
        ...getDeckBySuit(Suit.Spade),
    ];
}
