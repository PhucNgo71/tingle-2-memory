"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./games.module.css";
import StarterChallenges, { challengeNames } from "./StarterChallenges";
import MoreGames, { moreGames } from "./MoreGames";
import GuidedLevel from "./GuidedLevel";
import { localizeTree, type InterfaceLocale } from "./localization";

const words = ["apple", "banana", "pear", "grape", "lemon", "strawberry"];
const games = ["Picture Pick", "Listen & Find", "Pair Match", "Memory Flip", "Dot Bingo", ...challengeNames, ...moreGames];
const shuffle = <T,>(values: T[]) => {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
};
const deck = words.flatMap(word => [{ id: word + "-word", word, picture: false }, { id: word + "-picture", word, picture: true }]);

export default function GamesPage() {
  const [locale, setLocale] = useState<InterfaceLocale>("en");
  useEffect(() => { try { const saved = localStorage.getItem("tingle-game-interface-v1"); if (saved === "ja" || saved === "ko") setLocale(saved); } catch { /* Session-only language selection remains available. */ } }, []);
  function changeLocale(value: string) { const next = value === "ja" || value === "ko" ? value : "en"; setLocale(next); try { localStorage.setItem("tingle-game-interface-v1", next); } catch { /* No persistence in restricted browsers. */ } }
  const [game, setGame] = useState(games[0]);
  const [order, setOrder] = useState(words);
  const [board, setBoard] = useState(words);
  const [cards, setCards] = useState(deck);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState("Choose a game. No timer—take your time.");
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [marks, setMarks] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const audioRequest = useRef(0);
  const target = order[round % order.length];
  function restart(name = game) {
    audioRequest.current++;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setGame(name); setOrder(shuffle(words)); setBoard(shuffle(words)); setCards(shuffle(deck)); setRound(0); setSelected([]); setMatched([]); setMarks([]); setDone(false); setFeedback("Ready! Give it a try.");
  }
  function speak() {
    if (!("speechSynthesis" in window)) { setFeedback(`Audio unavailable. Text clue (hint): ${target}`); return; }
    const request = ++audioRequest.current;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(target); utterance.lang = "en-US"; utterance.rate = 0.8;
    utterance.onerror = event => { if (request === audioRequest.current && !["canceled", "interrupted"].includes(event.error)) setFeedback(`Audio unavailable. Text clue (hint): ${target}`); };
    window.speechSynthesis.speak(utterance);
  }
  function choose(word: string) {
    if (done) return;
    if (word !== target) { setFeedback("Not quite. Look or listen again—you can retry."); return; }
    audioRequest.current++;
    window.speechSynthesis?.cancel();
    if (game === "Dot Bingo") {
      const next = [...marks, word]; setMarks(next);
      if ([board.slice(0, 3), board.slice(3)].some(row => row.every(item => next.includes(item)))) { setDone(true); setFeedback("Bingo! You completed a line!"); return; }
    }
    if (round === words.length - 1) { setDone(true); setFeedback("Wonderful! You recalled all six words."); }
    else { setRound(round + 1); setFeedback("Yes! Ready for the next word."); }
  }
  function flip(id: string) {
    const card = cards.find(item => item.id === id)!;
    if (matched.includes(card.word) || selected.includes(id) || done) return;
    const previous = selected.length === 2 ? [] : selected;
    const next = [...previous, id]; setSelected(next);
    if (next.length === 2) {
      const first = cards.find(item => item.id === next[0])!;
      if (first.word === card.word && first.picture !== card.picture) {
        const complete = [...matched, card.word]; setMatched(complete); setSelected([]);
        setFeedback(complete.length === words.length ? "All six pairs found! Wonderful work." : "A matching pair! Keep going.");
        if (complete.length === words.length) setDone(true);
      } else setFeedback("Different cards. Choose another card to try again.");
    }
  }
  const pairing = game === "Pair Match" || game === "Memory Flip";
  return localizeTree(<main className={styles.main} lang={locale}>
    <label>Language <select aria-label="Language" value={locale} onChange={event => changeLocale(event.target.value)}><option value="en">English</option><option value="ja">日本語</option><option value="ko">한국어</option></select></label>
    <a href="/learn">← Back to learning</a><p className={styles.eyebrow}>TINGLE PLAY · FRUIT STARTER</p>
    <h1>Small games. Happy recall.</h1><p>Simple pencil sketches, familiar words, and room to try again.</p>
    <nav aria-label="Choose a game" className={styles.tabs}>{games.map(name => <button key={name} aria-pressed={game === name} onClick={() => restart(name)}>{name}</button>)}</nav>
    {moreGames.includes(game) ? <MoreGames key={game} game={game} locale={locale} /> : challengeNames.includes(game) ? <StarterChallenges key={game} game={game} locale={locale} /> : <section className={styles.play} aria-label={game}>
      <header><div><h2>{game}</h2><p>{pairing ? "Match each sketch with its word. Different pairs stay visible until your next choice." : game === "Picture Pick" ? "Choose the sketch for this word." : game === "Dot Bingo" ? "Listen, then mark the correct word. Complete a row of three." : "Listen, then choose the matching sketch."}</p></div><button onClick={() => restart()}>New round ↻</button></header>
      {!pairing && <div className={styles.prompt}>{game === "Picture Pick" ? <h2>{done ? "Well done!" : target}</h2> : <button disabled={done} onClick={speak}>▶ Hear the word</button>}<span>{done ? "Round complete" : `${round + 1} / ${words.length}`}</span></div>}
      <p role="status" aria-live="polite" className={styles.feedback}>{feedback}</p>
      <div className={`${styles.grid} ${game === "Dot Bingo" ? styles.bingo : ""}`}>{pairing ? cards.map(card => {
        const visible = game === "Pair Match" || selected.includes(card.id) || matched.includes(card.word);
        return <button className={styles.card} key={card.id} disabled={matched.includes(card.word) || done} aria-label={visible ? `${card.picture ? "Sketch" : "Word"}: ${card.word}` : "Turn over a hidden card"} onClick={() => flip(card.id)} aria-pressed={selected.includes(card.id)}>{visible ? card.picture ? <img src={`/game-sketches/${card.word}-pencil-draft-v1.png`} alt={card.word} /> : card.word : "?"}{matched.includes(card.word) && <span>✓</span>}</button>;
      }) : (game === "Dot Bingo" ? board : order).map(word => <button className={styles.card} key={word} disabled={done || marks.includes(word)} onClick={() => choose(word)} aria-label={word}>{game === "Dot Bingo" ? <>{word}<span className={styles.dot}>{marks.includes(word) ? "●" : "○"}</span></> : <img src={`/game-sketches/${word}-pencil-draft-v1.png`} alt={word} />}</button>)}</div>
    </section>}<GuidedLevel locale={locale} />
    <p>20 starter-game prototypes. Artwork is still under review. Browser pronunciation depends on available voices. No microphone, camera, or account is required. Cue choices and guided-level progress are stored locally on this browser only.</p>
  </main>, locale);
}
