export const fruitCards = [
  { word: "apple", meaning: "A round fruit that grows on a tree.", sentence: "I bite into a crunchy ___." },
  { word: "banana", meaning: "A long curved fruit with a peel.", sentence: "I peel a long curved ___." },
  { word: "pear", meaning: "A fruit that is narrow at the top and wider at the bottom.", sentence: "This fruit is narrow at the top: a ___." },
  { word: "grape", meaning: "A small round fruit that grows in bunches.", sentence: "I pick one small ___ from the bunch." },
  { word: "lemon", meaning: "A sour citrus fruit with pointed ends.", sentence: "I squeeze a sour ___ into water." },
  { word: "strawberry", meaning: "A fruit with tiny seeds on its outside and a leafy top.", sentence: "The ___ has tiny seeds on its outside." },
];
export const fruitWords = fruitCards.map(card => card.word);
export const cueColors: Record<string, string> = { orange: "#ff7a00", yellow: "#e5bd24", green: "#279e72", blue: "#2585d2", purple: "#9458bd", pink: "#ef69a4", red: "#e84949" };
export const sketch = (word: string) => `/game-sketches/${word}-pencil-draft-v1.png`;
