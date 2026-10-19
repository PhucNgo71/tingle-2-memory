"use client";
import { useEffect, useState } from "react";
import { fruitCards, sketch } from "./gameData";
import { completeLevel, emptyProgress, finishReview, parseProgress, qualifies, type LevelProgress } from "./levelRules";
import styles from "./games.module.css";
import { localizeTree, type InterfaceLocale } from "./localization";
const key = "tingle-fruit-level-v1";
type Mode = "idle" | "practice" | "check" | "review" | "result";

export default function GuidedLevel({ locale = "en" }: { locale?: InterfaceLocale }) {
  const [progress, setProgress] = useState<LevelProgress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<Mode>("idle");
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wins, setWins] = useState<Record<string, string[]>>({});
  const [answered, setAnswered] = useState(false);
  const [missed, setMissed] = useState(false);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(0);
  const [resetRequested, setResetRequested] = useState(false);
  useEffect(() => {
    try { setProgress(parseProgress(localStorage.getItem(key))); } catch { setNote("Storage unavailable. Progress lasts only for this session."); }
    setNow(Date.now()); setReady(true);
    const timer = window.setInterval(() => setNow(Date.now()), 30_000); return () => window.clearInterval(timer);
  }, []);
  const target = fruitCards[round % 6];
  const activity = mode === "practice" ? Math.floor(round / 6) % 2 === 0 ? "picture" : "meaning" : (Math.floor(round / 6) + round) % 2 === 0 ? "picture" : "meaning";
  const learned = fruitCards.filter(card => (wins[card.word] || []).length === 2).length;
  const due = progress.nextReviewAt !== null && now >= progress.nextReviewAt;
  function save(value: LevelProgress) {
    setProgress(value); try { localStorage.setItem(key, JSON.stringify(value)); } catch { setNote("Progress could not be saved. Keep this tab open for this session."); }
  }
  function start(nextMode: Mode) { setMode(nextMode); setRound(0); setCorrect(0); setAnswered(false); setMissed(false); setMessage(""); }
  function answer(word: string) {
    if (answered) return;
    const right = word === target.word;
    if (mode === "practice") {
      if (!right) { setMissed(true); setMessage("Try again. This word will return for an unassisted attempt."); return; }
      if (!missed) setWins(previous => ({ ...previous, [target.word]: [...new Set([...(previous[target.word] || []), activity])] }));
      setMessage(missed ? "You found it. We’ll revisit it later." : "Correct on your first try!");
    } else {
      if (right) setCorrect(value => value + 1);
      setMessage(right ? "Correct." : `The answer was ${target.word}. This counts as a missed question.`);
    }
    setAnswered(true);
  }
  function next() {
    const total = mode === "review" ? 6 : 12;
    if (mode !== "practice" && round === total - 1) {
      const passed = qualifies(correct, total);
      if (mode === "check" && passed) save(completeLevel(Date.now()));
      if (mode === "review") save(finishReview(progress, correct, total, Date.now()));
      setMessage(passed ? mode === "check" ? "Level complete! Stop here and take a break. Your first review is due tomorrow." : "Review passed! Your saved progress is updated." : mode === "review" ? "Not yet. Take a break. Your review is rescheduled for tomorrow." : "Not yet. Take a break, then practice the words again before retrying the check.");
      setMode("result"); return;
    }
    setRound(round + 1); setAnswered(false); setMissed(false); setMessage("");
  }
  return localizeTree(<section className={styles.play} lang={locale} aria-label="Guided fruit level">
    <h2>Your six-word level</h2><p>Free-play games are for practice. This guided level records first-attempt recall in two activities, then checks 12 mixed questions. Pass with at least 11/12 (90% rounded up).</p>
    {!ready ? <p>Loading progress…</p> : <>
      <p><strong>{progress.mastered ? "Mastered · three spaced reviews passed" : progress.completedAt ? "Level complete · review stage" : "Learning · level not yet complete"}</strong></p>
      {progress.nextReviewAt && <p>Next review: {new Date(progress.nextReviewAt).toLocaleString(locale === "ja" ? "ja-JP" : locale === "ko" ? "ko-KR" : "en-US")} {due ? "· Ready now" : "· Not due yet"}</p>}
      {note && <p role="status">{note}</p>}
      {(mode === "idle" || mode === "result") ? <>
        {mode === "result" && <p role="status">{message} Score: {correct}/{round + 1}.</p>}
        {!progress.completedAt && <button onClick={() => start("practice")}>Practice this level</button>}
        {progress.completedAt && !progress.mastered && <button disabled={!due} onClick={() => start("review")}>Start due review</button>}
        <p>Review checkpoints: 1, 3 and 7 days after completion. Late reviews are spaced at least a day apart. These are trial product rules, not a guarantee of permanent memory.</p>
      </> : <>
        <p>{mode === "practice" ? `Practice: ${learned}/6 words recalled first-try in both activities` : `${mode === "check" ? "Mixed check" : "Spaced review"}: ${round + 1}/${mode === "review" ? 6 : 12}`}</p>
        {mode === "practice" && learned === 6 ? <><p>All six words are ready for the mixed check.</p><button onClick={() => start("check")}>Start mixed check</button></> : <>
          {activity === "picture" ? <img style={{ width: 180, height: 180, objectFit: "contain" }} src={sketch(target.word)} alt={target.word} /> : <h3>{target.meaning}</h3>}
          <div className={styles.tabs}>{fruitCards.map(card => <button disabled={answered} key={card.word} onClick={() => answer(card.word)}>{card.word}</button>)}</div>
          <p role="status" aria-live="polite">{message}</p>
          {answered && <button onClick={next}>{mode !== "practice" && round === (mode === "review" ? 5 : 11) ? "Finish" : "Next question →"}</button>}
        </>}
        <button onClick={() => setMode("idle")}>Stop for now</button>
      </>}
      <p>Saved on this browser only; not synced to an account. No progress is sent to a server.</p>
      <button onClick={() => setResetRequested(!resetRequested)}>{resetRequested ? "Cancel reset" : "Reset this level’s progress"}</button>
      {resetRequested && <button onClick={() => { save(emptyProgress()); setWins({}); setMode("idle"); setResetRequested(false); setMessage(""); }}>Confirm reset for this level</button>}
    </>}
  </section>, locale);
}
