"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./games.module.css";
import StarterChallenges, { challengeNames } from "./StarterChallenges";
import MoreGames, { moreGames } from "./MoreGames";
import GuidedLevel from "./GuidedLevel";
import { localizeTree, type InterfaceLocale } from "./localization";

const words = ["apple", "banana", "pear", "grape", "lemon", "strawberry"];
const games = ["Picture Pick", "Listen & Find", "Pair Match", "Memory Flip", "Dot Bingo", ...challengeNames, ...moreGames];
const adventureKey = "tingle-adventure-stage-v1";
const adventureChapters = ["The Orchard Gate", "The Hidden Grove", "The Color Caves", "The Memory Summit"];
const chapterIcons = ["❧", "♣", "◆", "▲"];
const relics = ["Orchard Key", "Grove Compass", "Prism Stone", "Memory Crown"];
const quests = [
  "The orchard gate has lost its words. Match sketches, sounds and words to open it.",
  "Find your way through the grove by solving spelling, sound and sorting puzzles.",
  "The cave lanterns have gone out. Recover words from sketches, spelling and color clues.",
  "Use everything you remember to reach the summit and restore the Word Atlas.",
];
const roles = ["Word Explorer", "Sketch Scout", "Cue Keeper"] as const;
type Role = typeof roles[number];
const characters = {
  "Word Explorer": { name: "Ember", color: "#b54708", tint: "#ffdfb7", label: "Orange", symbol: "✦" },
  "Sketch Scout": { name: "Sprout", color: "#17664a", tint: "#d5f3df", label: "Green", symbol: "❋" },
  "Cue Keeper": { name: "Luna", color: "#6840a3", tint: "#eadcff", label: "Purple", symbol: "☾" },
} satisfies Record<Role, { name: string; color: string; tint: string; label: string; symbol: string }>;
function characterColors(role: Role) {
  return { "--player-color": characters[role].color, "--player-tint": characters[role].tint } as CSSProperties;
}
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
  const [adventure, setAdventure] = useState(false);
  const [checkpoint, setCheckpoint] = useState(0);
  const [adventureReady, setAdventureReady] = useState(false);
  const [role, setRole] = useState<Role>(roles[0]);
  const player = characters[role];
  const stage = games.indexOf(game);
  const chapter = Math.min(3, Math.floor((checkpoint === games.length ? games.length - 1 : stage) / 5));
  useEffect(() => {
    try {
      const value = Number(localStorage.getItem(adventureKey));
      if (Number.isInteger(value) && value >= 0 && value <= games.length) setCheckpoint(value);
      const savedRole = roles.find(item => item === localStorage.getItem("tingle-adventure-role-v1"));
      if (savedRole) setRole(savedRole);
    } catch { /* The adventure still works for this visit. */ }
    setAdventureReady(true);
  }, []);
  function finishStage() {
    if (!adventure || stage !== checkpoint) return;
    const next = stage + 1;
    setCheckpoint(next);
    try { localStorage.setItem(adventureKey, String(next)); } catch { /* Keep progress in memory. */ }
  }
  function enterAdventure() {
    setAdventure(true);
    try { localStorage.setItem("tingle-adventure-role-v1", role); } catch { /* The role still works for this visit. */ }
    if (checkpoint < games.length) restart(games[checkpoint]);
  }
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
      if ([board.slice(0, 3), board.slice(3)].some(row => row.every(item => next.includes(item)))) { setDone(true); finishStage(); setFeedback("Bingo! You completed a line!"); return; }
    }
    if (round === words.length - 1) { setDone(true); finishStage(); setFeedback("Wonderful! You recalled all six words."); }
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
        if (complete.length === words.length) { setDone(true); finishStage(); }
      } else setFeedback("Different cards. Choose another card to try again.");
    }
  }
  const pairing = game === "Pair Match" || game === "Memory Flip";
  return localizeTree(<main className={styles.main} lang={locale}>
    <label>Language <select aria-label="Language" value={locale} onChange={event => changeLocale(event.target.value)}><option value="en">English</option><option value="ja">日本語</option><option value="ko">한국어</option></select></label>
    <a href="/learn">← Back to learning</a><p className={styles.eyebrow}>TINGLE PLAY · FRUIT STARTER</p>
    <section className={`${styles.play} ${styles.questHall}`} style={characterColors(role)} aria-label="Tingle Adventure">
      <header className={styles.atlasHero}>
        <div><p className={styles.eyebrow}>TINGLE ADVENTURE · FRUIT STARTER</p><h1>{adventure ? adventureChapters[chapter] : "The Word Atlas"}</h1>
          <p>The Word Atlas is missing its words. Join Tingle Friend and bring them back, one quest at a time.</p>
          {adventure ? <button onClick={() => { setAdventure(false); restart(games[0]); }}>Free play</button> : <button disabled={!adventureReady} onClick={enterAdventure}>{checkpoint === 0 ? "Start adventure" : checkpoint === games.length ? "See adventure results" : "Continue adventure"} <span aria-hidden="true">→</span></button>}
        </div>
        <div className={styles.heroPortrait}><img src="/tingle-adventure-friend.webp" alt="Tingle Friend" width={280} height={280} /></div>
      </header>
      {!adventure && <fieldset className={styles.roleChoices}>
        <legend>Choose your character</legend>
        {roles.map(item => <label key={item} style={characterColors(item)}>
          <input type="radio" name="adventure-role" checked={role === item} onChange={() => setRole(item)} />
          <span className={styles.playerAvatar} aria-hidden="true">{characters[item].symbol}</span>
          <span><strong>{characters[item].name}</strong><small>{item} · {characters[item].label}</small></span>
        </label>)}
      </fieldset>}
      <ol className={styles.worldMap} aria-label="Adventure map">
        {adventureChapters.map((name, index) => {
          const complete = checkpoint >= (index + 1) * 5;
          const current = !complete && checkpoint >= index * 5;
          return <li key={name} data-region={index} data-current={current} aria-current={current ? "step" : undefined}>
            <span className={styles.regionIcon} aria-hidden="true">{chapterIcons[index]}</span>
            <small>CHAPTER {index + 1}</small><strong>{name}</strong>
            <span>{complete ? "✓ Complete" : current ? "Ready to explore" : "Locked"}</span>
            <ol className={styles.questPips} aria-label={`${name} quests`}>
              {games.slice(index * 5, index * 5 + 5).map((quest, step) => {
                const questIndex = index * 5 + step;
                return <li key={quest} title={quest} aria-current={adventure && questIndex === checkpoint ? "step" : undefined} data-earned={questIndex < checkpoint} className={styles.mapStop}><span aria-label={`${questIndex + 1}: ${quest}`}>{questIndex < checkpoint ? "✓" : questIndex + 1}</span></li>;
              })}
            </ol>
          </li>;
        })}
      </ol>
      {adventure && <>
        <div className={styles.questBrief}>
          <img src="/tingle-adventure-friend.webp" alt="" width={88} height={88} />
          <div><strong>Tingle Friend</strong><p>{checkpoint === games.length ? "The Word Atlas is whole again. You brought every chapter back to life!" : quests[chapter]}</p>
          {checkpoint < games.length && <p><strong>Quest {stage + 1}:</strong> {game}</p>}</div>
        </div>
        <p className={styles.playerIdentity}><span className={styles.playerAvatar} aria-hidden="true">{player.symbol}</span> <strong>{player.name}</strong> · {role} · {player.label}</p>
        <progress aria-label="Adventure progress" value={checkpoint} max={games.length} className={`mt-4 w-full ${styles.playerProgress}`} />
        <p role="status">{checkpoint} of {games.length} stages complete</p>
        <ul className={styles.relics} aria-label="Adventure inventory">
          {relics.map((item, index) => <li key={item} data-earned={checkpoint >= (index + 1) * 5}>{checkpoint >= (index + 1) * 5 ? "✓" : "◇"} {item}<small>{checkpoint >= (index + 1) * 5 ? "Collected" : `Unlock at quest ${(index + 1) * 5}`}</small></li>)}
        </ul>
        {checkpoint === games.length && <h3>Adventure complete! You finished all {games.length} games.</h3>}
      </>}
    </section>
    {!adventure && <nav aria-label="Choose a game" className={`${styles.tabs} ${styles.gameMenu}`}>{games.map((name, index) => <button key={name} style={{ "--game-delay": `${index * 18}ms` } as CSSProperties} aria-pressed={game === name} onClick={() => restart(name)}><span>{name}</span></button>)}</nav>}
    <div key={game} className={styles.gameEntrance}>
    {adventure && checkpoint === games.length ? null : moreGames.includes(game) ? <MoreGames key={game} game={game} locale={locale} onComplete={finishStage} /> : challengeNames.includes(game) ? <StarterChallenges key={game} game={game} locale={locale} onComplete={finishStage} /> : <section className={styles.play} aria-label={game}>
      <header><div><h2>{game}</h2><p>{pairing ? "Match each sketch with its word. Different pairs stay visible until your next choice." : game === "Picture Pick" ? "Choose the sketch for this word." : game === "Dot Bingo" ? "Listen, then mark the correct word. Complete a row of three." : "Listen, then choose the matching sketch."}</p></div><button onClick={() => restart()}>New round ↻</button></header>
      {!pairing && <div className={styles.prompt}>{game === "Picture Pick" ? <h2>{done ? "Well done!" : target}</h2> : <button disabled={done} onClick={speak}>▶ Hear the word</button>}<span>{done ? "Round complete" : `${round + 1} / ${words.length}`}</span></div>}
      <p role="status" aria-live="polite" className={styles.feedback}>{feedback}</p>
      <div className={`${styles.grid} ${game === "Dot Bingo" ? styles.bingo : ""}`}>{pairing ? cards.map(card => {
        const visible = game === "Pair Match" || selected.includes(card.id) || matched.includes(card.word);
        return <button className={styles.card} key={card.id} disabled={matched.includes(card.word) || done} aria-label={visible ? `${card.picture ? "Sketch" : "Word"}: ${card.word}` : "Turn over a hidden card"} onClick={() => flip(card.id)} aria-pressed={selected.includes(card.id)}>{visible ? card.picture ? <img src={`/game-sketches/${card.word}-pencil-draft-v1.png`} alt={card.word} /> : card.word : "?"}{matched.includes(card.word) && <span>✓</span>}</button>;
      }) : (game === "Dot Bingo" ? board : order).map(word => <button className={styles.card} key={word} disabled={done || marks.includes(word)} onClick={() => choose(word)} aria-label={word}>{game === "Dot Bingo" ? <>{word}<span className={styles.dot}>{marks.includes(word) ? "●" : "○"}</span></> : <img src={`/game-sketches/${word}-pencil-draft-v1.png`} alt={word} />}</button>)}</div>
    </section>}
    </div>
    {adventure && checkpoint > stage && checkpoint < games.length && <div className={styles.tabs}><button onClick={() => restart(games[checkpoint])}>Next stage →</button></div>}
    {!adventure && <GuidedLevel locale={locale} />}
    <p>20 learning quests in the Fruit Starter adventure. English pronunciation uses your browser’s voices. Adventure checkpoints are saved on this browser.</p>
  </main>, locale);
}
