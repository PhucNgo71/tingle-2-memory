"use client";

import { useState } from "react";
import styles from "./games.module.css";
import { localizeTree, type InterfaceLocale } from "./localization";

export const challengeNames = ["Missing Letter", "Letter Scramble", "First Sound", "Topic Basket", "Odd One Out"];
const fruits = ["apple", "banana", "pear", "grape", "lemon", "strawberry"];
const topics: Record<string, string> = Object.fromEntries([...fruits.map(word => [word, "Fruit"]), ["cat", "Animals"], ["dog", "Animals"], ["sun", "Nature"]]);
const topicWords = ["apple", "cat", "banana", "sun", "dog", "pear"];
const oddBoards = [["apple", "cat", "banana"], ["dog", "pear", "cat"], ["lemon", "sun", "grape"], ["strawberry", "banana", "dog"]];
const instructions: Record<string, string> = {
  "Missing Letter": "Look at the sketch and fill in the first letter.",
  "Letter Scramble": "Tap letters in order to spell the pictured word. Each tile can be used once.",
  "First Sound": "Listen to the word, then choose its starting letter. This is a beginning-letter activity, not a full phonics lesson.",
  "Topic Basket": "Choose the topic basket for each pictured word.",
  "Odd One Out": "Two cards share a topic. Choose the one from a different topic.",
};
function image(word: string) {
  return fruits.includes(word) ? `/game-sketches/${word}-pencil-draft-v1.png` : `/archive-images/v1/cards/${word}.webp`;
}

export default function StarterChallenges({ game, locale = "en" }: { game: string; locale?: InterfaceLocale }) {
  const [round, setRound] = useState(0);
  const [used, setUsed] = useState<number[]>([]);
  const [message, setMessage] = useState("Ready! Take your time.");
  const [done, setDone] = useState(false);
  const [solved, setSolved] = useState(false);
  const count = game === "Odd One Out" ? oddBoards.length : fruits.length;
  const word = game === "Topic Basket" ? topicWords[round] : fruits[round];
  const letters = [...word].reverse();
  const spelling = used.map(index => letters[index]).join("");
  const choices = [...new Set([word[0], ...["a", "b", "c", "g", "l", "p", "s"].filter(letter => letter !== word[0]).slice(0, 3)])].sort();
  function restart() { window.speechSynthesis?.cancel(); setRound(0); setUsed([]); setDone(false); setSolved(false); setMessage("Ready! Take your time."); }
  function answer(correct: boolean) {
    if (done || solved) return;
    if (!correct) { setMessage("Not quite. Try again—you have time."); return; }
    setSolved(true);
    if (round === count - 1) { setDone(true); setMessage("You finished! Wonderful recall."); }
    else setMessage("Yes! Choose Next when you’re ready.");
  }
  function next() { setRound(round + 1); setUsed([]); setSolved(false); setMessage("Ready for the next card."); }
  function hear() {
    if (!("speechSynthesis" in window)) { setMessage("Audio is unavailable here. Use the pictured starting-letter clue instead."); return; }
    window.speechSynthesis.cancel(); const audio = new SpeechSynthesisUtterance(word); audio.lang = "en-US"; audio.rate = 0.8;
    audio.onerror = () => setMessage("Audio could not play. You can still use the sketch clue."); window.speechSynthesis.speak(audio);
  }
  function addLetter(index: number) {
    if (used.includes(index) || solved) return;
    const nextUsed = [...used, index]; setUsed(nextUsed);
    const value = nextUsed.map(item => letters[item]).join("");
    if (value.length === word.length) answer(value === word);
  }
  return localizeTree(<section className={styles.play} lang={locale} aria-label={game}>
    <header><div><h2>{game}</h2><p>{instructions[game]}</p></div><button onClick={restart}>New round ↻</button></header>
    <p>{done ? "Round complete" : `${round + 1} / ${count}`}</p>
    <p className={styles.feedback} role="status" aria-live="polite">{message}</p>
    {game === "Odd One Out" ? <div className={styles.grid}>{oddBoards[round].map(item => {
      const board = oddBoards[round]; const unique = board.filter(other => topics[other] === topics[item]).length === 1;
      return <button className={styles.card} key={item} aria-label={item} disabled={solved} onClick={() => answer(unique)}><img style={{ filter: "grayscale(1)" }} src={image(item)} alt="" /><span>{item}</span></button>;
    })}</div> : <>
      <div className={styles.prompt}><img style={{ width: 180, height: 180, objectFit: "contain", filter: "grayscale(1)" }} src={image(word)} alt={word} />
        {game === "Missing Letter" && <h2 aria-label="Word with first letter missing">_{word.slice(1)}</h2>}
        {game === "First Sound" && <button onClick={hear}>▶ Hear the word</button>}
        {game === "Topic Basket" && <h2>{word}</h2>}
      </div>
      {game === "Letter Scramble" ? <>
        <p aria-live="polite">Your word: <strong>{spelling || "…"}</strong></p>
        <div className={styles.tabs}>{letters.map((letter, index) => <button key={index} disabled={used.includes(index) || solved} aria-label={`Letter ${letter}, tile ${index + 1}`} onClick={() => addLetter(index)}>{letter}</button>)}</div>
        <button disabled={solved || used.length === 0} onClick={() => { setUsed(used.slice(0, -1)); setMessage("Try another letter."); }}>Undo</button>{" "}
        <button disabled={solved} onClick={() => { setUsed([]); setMessage("Start the spelling again."); }}>Clear</button>
      </> : <div className={styles.tabs}>{(game === "Topic Basket" ? ["Fruit", "Animals", "Nature"] : choices).map(choice => <button key={choice} disabled={solved} onClick={() => answer(choice === (game === "Topic Basket" ? topics[word] : word[0]))}>{choice}</button>)}</div>}
    </>}
    {solved && !done && <button onClick={next}>Next card →</button>}
    {(game === "Topic Basket" || game === "Odd One Out") && <p>Animal and sun pictures are temporary monochrome archive artwork, awaiting the new simple-pencil versions.</p>}
  </section>, locale);
}
