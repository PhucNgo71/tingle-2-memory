"use client";
import { useEffect, useState } from "react";
import { cueColors, fruitCards, fruitWords, sketch } from "./gameData";
import styles from "./games.module.css";
import { cueColorLabel, localizeTree, type InterfaceLocale } from "./localization";

export const moreGames = ["Word Pick", "Build & Check", "What Disappeared?", "Sketch Peek", "Color Clue", "Cue & Picture", "Meaning Match", "Sentence Gap", "Word Trail", "My Review Mix"];
const instructions: Record<string, string> = {
  "Word Pick": "Look at the sketch and choose its word.",
  "Build & Check": "Build the pictured word with your wooden blocks, then type its spelling to check. This prototype does not scan or verify physical blocks.",
  "What Disappeared?": "Study three sketches, hide them, then choose the missing one.",
  "Sketch Peek": "Identify the partly revealed sketch. Reveal more whenever you need a hint.",
  "Color Clue": "Study your saved word-and-color associations, then recall the highlighted word. A color may belong to several words; the choices make each question unambiguous.",
  "Cue & Picture": "Study your saved cue alongside each sketch, then choose the picture associated with the highlighted cue.",
  "Meaning Match": "Choose the word that matches the meaning.",
  "Sentence Gap": "Choose the word that fills the gap.",
  "Word Trail": "Recall one word at each stepping stone. Reach the sixth stone to finish.",
  "My Review Mix": "Review all six starter words through picture, meaning, and sentence questions. This free-play round does not certify mastery; use the guided level below for that.",
};

export default function MoreGames({ game, locale = "en" }: { game: string; locale?: InterfaceLocale }) {
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("Ready! Take your time.");
  const [entry, setEntry] = useState("");
  const [hidden, setHidden] = useState(false);
  const [reveal, setReveal] = useState(25);
  const [studied, setStudied] = useState(false);
  const [cues, setCues] = useState<Record<string, string>>({});
  const [storageNote, setStorageNote] = useState("");
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tingle-game-cues-v1") || "{}");
      if (saved && typeof saved === "object") setCues(Object.fromEntries(Object.entries(saved).filter(([word, color]) => fruitWords.includes(word) && typeof color === "string" && color in cueColors)) as Record<string, string>);
    } catch { setStorageNote("Saved cues could not be loaded. You can choose them again."); }
  }, []);
  const colorGame = game === "Color Clue" || game === "Cue & Picture";
  const active = colorGame ? fruitCards.filter(card => cues[card.word]) : fruitCards;
  const target = active[round % Math.max(active.length, 1)];
  const color = target ? cues[target.word] || "" : "";
  const options = target ? colorGame ? [target, ...fruitCards.filter(card => card.word !== target.word && cues[card.word] !== color).slice(0, 3)].sort((a, b) => a.word.localeCompare(b.word)) : fruitCards : [];
  const colorReady = active.length >= 2 && new Set(active.map(card => cues[card.word])).size >= 2;
  const scene = [fruitWords[round % 6], fruitWords[(round + 1) % 6], fruitWords[(round + 2) % 6]];
  function saveCue(word: string, value: string) {
    const next = { ...cues }; if (value) next[word] = value; else delete next[word]; setCues(next); setRound(0); setStudied(false); setSolved(false); setDone(false);
    try { localStorage.setItem("tingle-game-cues-v1", JSON.stringify(next)); setStorageNote("Cues saved on this browser only."); } catch { setStorageNote("Storage unavailable. Cues work for this session only."); }
  }
  function answer(correct: boolean) {
    if (solved || done) return;
    if (!correct) { setMessage("Not quite. Try again, or use a hint."); return; }
    setSolved(true); const last = round === active.length - 1;
    if (last) { setDone(true); setMessage("Round complete! Take a break or play again."); }
    else setMessage("You got it! Choose Next when ready.");
  }
  function next() { setRound(round + 1); setSolved(false); setHidden(false); setReveal(25); setEntry(""); setMessage("Ready for the next word."); }
  function restart() { setRound(0); setSolved(false); setDone(false); setHidden(false); setReveal(25); setStudied(false); setEntry(""); setMessage("Ready! Take your time."); }
  const variant = game === "My Review Mix" ? ["Word Pick", "Meaning Match", "Sentence Gap"][round % 3] : game;
  return localizeTree(<section className={styles.play} lang={locale} aria-label={game}>
    <header><div><h2>{game}</h2><p>{instructions[game]}</p></div><button onClick={restart}>New round ↻</button></header>
    {colorGame && <details open={!studied}><summary>Your personal memory colors</summary><div className={styles.tabs}>{fruitWords.map(word => <label key={word}>{word}{" "}<select aria-label={`Memory color for ${word}`} value={cues[word] || ""} onChange={e => saveCue(word, e.target.value)}><option value="">No cue</option>{Object.keys(cueColors).map(name => <option key={name}>{name}</option>)}</select></label>)}</div><p>{storageNote || "No preset colors. Choose the cues that you like."}</p></details>}
    {colorGame && !colorReady ? <p role="status">Choose cues for at least two words using at least two different colors to start. Shared colors are allowed.</p> : colorGame && !studied ? <><div className={styles.grid}>{active.map(card => <article className={styles.card} key={card.word}><img src={sketch(card.word)} alt={card.word} /><strong>{card.word}</strong><span style={{ color: cueColors[cues[card.word]] }}>● {cueColorLabel(cues[card.word], locale)}</span></article>)}</div><button onClick={() => setStudied(true)}>I’m ready to recall →</button></> : target && <>
      <p>{done ? "Round complete" : `${round + 1} / ${active.length}`}</p><p className={styles.feedback} role="status" aria-live="polite">{message}</p>
      {game === "Word Trail" && <ol className={styles.tabs} aria-label="Trail progress">{fruitWords.map((word, index) => <li key={word} aria-current={index === round ? "step" : undefined}>{index < round || done ? "✓" : index + 1}</li>)}</ol>}
      {game === "What Disappeared?" ? <>
        <div className={styles.grid}>{scene.filter(word => !hidden || word !== target.word).map(word => <article key={word} className={styles.card}><img src={sketch(word)} alt={word} /></article>)}</div>
        {!hidden ? <button onClick={() => setHidden(true)}>Hide one sketch</button> : <div className={styles.tabs}>{scene.map(word => <button key={word} disabled={solved} onClick={() => answer(word === target.word)}>{word}</button>)}</div>}
      </> : <>
        {colorGame ? <p style={{ fontSize: 28, color: cueColors[color] }}>● <span style={{ color: "#292722" }}>{`Which ${game === "Cue & Picture" ? "picture" : "word"} did you pair with ${color}?`}</span></p> : variant === "Meaning Match" ? <h3>{target.meaning}</h3> : variant === "Sentence Gap" ? <h3 lang="en">{target.sentence}</h3> : <div className={styles.prompt}><img style={{ width: 220, height: 220, objectFit: "contain", clipPath: game === "Sketch Peek" ? `inset(0 ${100 - reveal}% 0 0)` : undefined }} src={sketch(target.word)} alt={game === "Sketch Peek" ? "Partly revealed fruit sketch" : target.word} /></div>}
        {game === "Sketch Peek" && <button disabled={reveal === 100 || solved} onClick={() => setReveal(Math.min(100, reveal + 25))}>Reveal more (hint)</button>}
        {game === "Build & Check" ? <form onSubmit={e => { e.preventDefault(); answer(entry.trim().toLowerCase() === target.word); }}><label>Your spelling <input value={entry} onChange={e => setEntry(e.target.value)} autoComplete="off" spellCheck={false} disabled={solved} /></label><button disabled={solved || !entry.trim()}>Check spelling</button></form> : <div className={styles.grid}>{options.map(card => <button className={styles.card} disabled={solved} key={card.word} onClick={() => answer(card.word === target.word)}>{game === "Cue & Picture" ? <img src={sketch(card.word)} alt={card.word} /> : card.word}</button>)}</div>}
      </>}
      {solved && !done && <button onClick={next}>Next →</button>}
    </>}
  </section>, locale);
}
