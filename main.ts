import { initializeGame, createCards, Rank, Phase } from 'muib';

console.log(initializeGame, createCards(8)[0].rank === Rank.Ace);
console.log(Phase);


