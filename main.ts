import { initializeGame, createCards, Rank } from 'muib';

console.log(initializeGame, createCards(8)[0].rank === Rank.Ace);


