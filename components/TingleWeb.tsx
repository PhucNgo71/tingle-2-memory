"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./TingleWeb.module.css";

export interface TingleWord {
  wordId: string;
  headword: string;
  normalized: string;
  rank: number;
  band: number;
  pack: number;
  definition: string;
  imagePath: string | null;
  thumbnailPath: string | null;
  imageAlt: string | null;
  imageStatus: string;
}

export interface ArchiveCard {
  archiveId: string;
  label: string;
  sourceName: string;
  imagePath: string;
  wordId: string | null;
}

type Cue = { name: string; color: string; soft: string };
type Progress = Record<string, { cue: string; remembered: boolean }>;
type View = "learn" | "library" | "games";
type PairCard = { key: string; wordId: string; kind: "picture" | "word" };

const cues: Cue[] = [
  { name: "Orange", color: "#ff7a00", soft: "#fff0df" },
  { name: "Green", color: "#2e9d71", soft: "#e7f5ee" },
  { name: "Yellow", color: "#d6a900", soft: "#fff7ce" },
  { name: "Blue", color: "#3977d1", soft: "#e8f1ff" },
  { name: "Red", color: "#d95a4e", soft: "#fbeae7" },
  { name: "Purple", color: "#8b63c7", soft: "#f1ebfa" },
  { name: "Pink", color: "#d86f9b", soft: "#fbeaf1" },
];

const STORAGE_KEY = "tingle-web-progress-v1";

function getCue(name: string | undefined) {
  return cues.find((cue) => cue.name === name) ?? cues[0];
}

function letterTokens(word: TingleWord) {
  const tokens = Array.from(word.normalized).map((letter, id) => ({ id, letter }));
  if (tokens.length < 2) return tokens;
  return [...tokens.slice(1), tokens[0]].reverse();
}

function shuffleWithSeed<T>(items: T[], seed: number) {
  const shuffled = [...items];
  let state = seed + 17;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (state * 9301 + 49297) % 233280;
    const target = Math.floor((state / 233280) * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

export default function TingleWeb({ words, archiveCards }: { words: TingleWord[]; archiveCards: ArchiveCard[] }) {
  const initialWord = words.find((word) => word.headword === "sun") ?? words[0];
  const [view, setView] = useState<View>("learn");
  const [selectedId, setSelectedId] = useState(initialWord.wordId);
  const [query, setQuery] = useState("");
  const [archiveQuery, setArchiveQuery] = useState("");
  const [archiveLimit, setArchiveLimit] = useState(48);
  const [pack, setPack] = useState<number | "all">("all");
  const [progress, setProgress] = useState<Progress>({});
  const [cardFlipped, setCardFlipped] = useState(false);
  const [builtIds, setBuiltIds] = useState<number[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [bingoSeed, setBingoSeed] = useState(0);
  const [bingoMarks, setBingoMarks] = useState<number[]>([]);
  const [pairSeed, setPairSeed] = useState(0);
  const [openPairCards, setOpenPairCards] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [pairAttempts, setPairAttempts] = useState(0);

  const selected = words.find((word) => word.wordId === selectedId) ?? initialWord;
  const selectedProgress = progress[selected.wordId];
  const cue = getCue(selectedProgress?.cue);
  const letters = useMemo(() => letterTokens(selected), [selected]);
  const builtWord = builtIds.map((id) => letters.find((token) => token.id === id)?.letter ?? "").join("");
  const wordComplete = builtWord === selected.normalized;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setProgress(JSON.parse(saved) as Progress);
    } catch {
      // The experience still works when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    setCardFlipped(false);
    setBuiltIds([]);
    setAnswer(null);
  }, [selectedId]);

  function saveProgress(next: Progress) {
    setProgress(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Keep the current session usable without persistence.
    }
  }

  function chooseCue(nextCue: Cue) {
    saveProgress({
      ...progress,
      [selected.wordId]: {
        cue: nextCue.name,
        remembered: selectedProgress?.remembered ?? false,
      },
    });
  }

  function toggleRemembered() {
    saveProgress({
      ...progress,
      [selected.wordId]: {
        cue: cue.name,
        remembered: !selectedProgress?.remembered,
      },
    });
  }

  function speakWord() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selected.headword);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }

  function selectWord(word: TingleWord) {
    setSelectedId(word.wordId);
    setView("learn");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filteredWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return words
      .filter((word) => pack === "all" || word.pack === pack)
      .filter(
        (word) =>
          !normalizedQuery ||
          word.headword.includes(normalizedQuery) ||
          word.definition.toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 80);
  }, [pack, query, words]);

  const illustratedWords = useMemo(
    () => words.filter((word) => word.imageStatus === "approved" && word.thumbnailPath),
    [words],
  );

  const wordsById = useMemo(
    () => new Map(words.map((word) => [word.wordId, word])),
    [words],
  );

  const filteredArchiveCards = useMemo(() => {
    const normalizedQuery = archiveQuery.trim().toLowerCase();
    if (!normalizedQuery) return archiveCards;
    return archiveCards.filter((card) => card.label.toLowerCase().includes(normalizedQuery));
  }, [archiveCards, archiveQuery]);

  const visibleArchiveCards = filteredArchiveCards.slice(0, archiveLimit);

  const pairWords = useMemo(() => {
    if (!illustratedWords.length) return [];
    const start = (pairSeed * 3) % illustratedWords.length;
    return Array.from({ length: Math.min(4, illustratedWords.length) }, (_, index) => illustratedWords[(start + index) % illustratedWords.length]);
  }, [illustratedWords, pairSeed]);

  const pairCards = useMemo<PairCard[]>(() => {
    const cards = pairWords.flatMap((word) => [
      { key: `picture-${word.wordId}`, wordId: word.wordId, kind: "picture" as const },
      { key: `word-${word.wordId}`, wordId: word.wordId, kind: "word" as const },
    ]);
    return shuffleWithSeed(cards, pairSeed + 101);
  }, [pairSeed, pairWords]);

  const pairComplete = pairWords.length > 0 && matchedPairIds.length === pairWords.length;

  useEffect(() => {
    if (openPairCards.length !== 2) return;
    const [first, second] = openPairCards.map((key) => pairCards.find((card) => card.key === key));
    const isMatch = Boolean(first && second && first.wordId === second.wordId && first.kind !== second.kind);
    const timer = window.setTimeout(() => {
      if (isMatch && first) {
        setMatchedPairIds((current) => current.includes(first.wordId) ? current : [...current, first.wordId]);
      }
      setOpenPairCards([]);
    }, isMatch ? 420 : 850);
    return () => window.clearTimeout(timer);
  }, [openPairCards, pairCards]);

  function choosePairCard(card: PairCard) {
    if (openPairCards.length >= 2 || openPairCards.includes(card.key) || matchedPairIds.includes(card.wordId)) return;
    const next = [...openPairCards, card.key];
    setOpenPairCards(next);
    if (next.length === 2) setPairAttempts((current) => current + 1);
  }

  function newPairRound() {
    setPairSeed((current) => current + 1);
    setOpenPairCards([]);
    setMatchedPairIds([]);
    setPairAttempts(0);
  }

  const recallOptions = useMemo(() => {
    const currentIndex = Math.max(0, words.findIndex((word) => word.wordId === selected.wordId));
    const optionIndexes = [currentIndex, (currentIndex + 41) % words.length, (currentIndex + 97) % words.length, (currentIndex + 173) % words.length];
    return optionIndexes
      .map((index) => words[index])
      .sort((a, b) => a.wordId.localeCompare(b.wordId));
  }, [selected, words]);

  const bingoWords = useMemo(() => {
    const start = (bingoSeed * 9 * 17) % Math.max(1, words.length - 9);
    return words.slice(start, start + 9);
  }, [bingoSeed, words]);

  const bingo = useMemo(() => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    return lines.some((line) => line.every((index) => bingoMarks.includes(index)));
  }, [bingoMarks]);

  const rememberedCount = Object.values(progress).filter((item) => item.remembered).length;
  const cueCount = Object.keys(progress).length;

  return (
    <main className={styles.shell} style={{ "--cue": cue.color, "--cue-soft": cue.soft } as React.CSSProperties}>
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink} aria-label="Tingle landing page">
          <Image src="/tingle-wordmark-spark-v3.png" alt="Tingle" width={1774} height={887} priority />
        </Link>
        <nav className={styles.nav} aria-label="Tingle Web sections">
          {(["learn", "library", "games"] as View[]).map((item) => (
            <button key={item} type="button" className={view === item ? styles.activeNav : ""} onClick={() => setView(item)}>
              {item === "learn" ? "Learn" : item === "library" ? "Cards collection" : "Recall games"}
            </button>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <span><b>{rememberedCount}</b> remembered</span>
          <Link href="/">About Tingle ↗</Link>
        </div>
      </header>

      {view === "learn" && (
        <div className={styles.learnLayout}>
          <aside className={styles.sidebar}>
            <div>
              <p className={styles.kicker}>TODAY&apos;S WORD</p>
              <h1>{selected.headword}</h1>
              <p className={styles.definition}>{selected.definition}</p>
            </div>
            <button type="button" className={styles.speakButton} onClick={speakWord}>
              <span aria-hidden="true">◖</span> Hear pronunciation
            </button>
            <div className={styles.metaGrid}>
              <div><span>Library rank</span><strong>#{selected.rank}</strong></div>
              <div><span>Learning pack</span><strong>{String(selected.pack).padStart(2, "0")}</strong></div>
            </div>
            <div className={styles.sideSearch}>
              <label htmlFor="quick-word">Find another word</label>
              <input id="quick-word" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “memory”" />
              {query && (
                <div className={styles.quickResults}>
                  {filteredWords.slice(0, 5).map((word) => (
                    <button type="button" key={word.wordId} onClick={() => { setSelectedId(word.wordId); setQuery(""); }}>
                      <span>{word.headword}</span><small>#{word.rank}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <section className={styles.learningStage}>
            <div className={styles.cardHeader}>
              <div><p className={styles.kicker}>DEMO FLASHCARD / {selected.wordId}</p><p>Picture first. Answer second. Recall before you flip.</p></div>
              <div className={styles.cardActions}>
                <span className={styles.demoPill}>Interactive demo</span>
                <button type="button" className={selectedProgress?.remembered ? styles.remembered : styles.rememberButton} onClick={toggleRemembered}>
                  {selectedProgress?.remembered ? "✓ Remembered" : "+ Mark remembered"}
                </button>
              </div>
            </div>

            <article className={`${styles.memoryCard} ${selected.imagePath ? styles.hasArtwork : ""}`}>
              <div className={styles.memorySparks} aria-hidden="true">
                {cues.map((spark, index) => (
                  <i key={spark.name} style={{ "--spark": spark.color, "--spark-index": index } as React.CSSProperties} />
                ))}
              </div>
              <span className={styles.cueBadge}>{cue.name} cue</span>
              {!cardFlipped ? (
                <div className={styles.flashcardPanel} key={`front-${selected.wordId}`} aria-live="polite">
                  {selected.imagePath ? (
                    <div className={styles.sketchImageWrap}>
                      <Image
                        src={selected.imagePath}
                        alt={selected.imageAlt ?? `Tingle memory sketch for ${selected.headword}`}
                        width={1600}
                        height={1200}
                        sizes="(max-width: 900px) 90vw, 720px"
                        className={styles.sketchImage}
                        priority={selected.wordId === initialWord.wordId}
                      />
                    </div>
                  ) : (
                    <div className={styles.sketchPlaceholder} aria-label={`Sketch space for ${selected.headword}`}>
                      <span>{selected.headword.slice(0, 1).toUpperCase()}</span>
                      <i aria-hidden="true" />
                    </div>
                  )}
                  <div className={styles.flashcardPrompt}>
                    <div><span>LOOK &amp; RECALL</span><strong>What word is this?</strong></div>
                    <button type="button" onClick={() => setCardFlipped(true)}>Reveal answer <span aria-hidden="true">↻</span></button>
                  </div>
                </div>
              ) : (
                <div className={styles.flashcardPanel} key={`back-${selected.wordId}`} aria-live="polite">
                  <div className={styles.flashcardAnswer}>
                    <p className={styles.kicker}>ANSWER</p>
                    <h2>{selected.headword}</h2>
                    <p>{selected.definition}</p>
                    <button type="button" onClick={speakWord} aria-label={`Hear the pronunciation of ${selected.headword}`}><span aria-hidden="true">▶</span> Hear pronunciation</button>
                    <small><i style={{ backgroundColor: cue.color }} /> Your saved cue is {cue.name.toLowerCase()}.</small>
                  </div>
                  <div className={styles.flashcardPrompt}>
                    <div><span>ANSWER SIDE</span><strong>Did you remember it?</strong></div>
                    <button type="button" onClick={() => setCardFlipped(false)}>Show picture <span aria-hidden="true">↻</span></button>
                  </div>
                </div>
              )}
            </article>

            <div className={styles.cuePicker}>
              <div><p className={styles.kicker}>CHOOSE YOUR MEMORY CUE</p><span>Use the same color when this word returns.</span></div>
              <div className={styles.cueDots}>
                {cues.map((option) => (
                  <button
                    type="button"
                    key={option.name}
                    className={cue.name === option.name ? styles.activeCue : ""}
                    style={{ backgroundColor: option.color }}
                    onClick={() => chooseCue(option)}
                    aria-label={`Choose ${option.name}`}
                    aria-pressed={cue.name === option.name}
                  />
                ))}
              </div>
            </div>

            <div className={styles.practiceGrid}>
              <article className={styles.practiceCard}>
                <p className={styles.kicker}>BUILD THE WORD</p>
                <h3>Put the letters in order.</h3>
                <div className={`${styles.buildRail} ${wordComplete ? styles.completeRail : ""}`}>
                  {selected.normalized.split("").map((_, index) => (
                    <span key={index} className={builtWord[index] ? styles.filledSlot : ""}>{builtWord[index] ?? ""}</span>
                  ))}
                </div>
                <div className={styles.letterTray}>
                  {letters.map((token) => (
                    <button
                      type="button"
                      key={token.id}
                      disabled={builtIds.includes(token.id)}
                      onClick={() => setBuiltIds([...builtIds, token.id])}
                      style={{ "--letter-accent": cues[token.id % cues.length].color } as React.CSSProperties}
                    >
                      {token.letter}
                    </button>
                  ))}
                </div>
                <div className={styles.practiceFooter}>
                  <span className={wordComplete ? styles.successMessage : ""}>
                    {wordComplete && <b aria-hidden="true">✦</b>}
                    {wordComplete ? "That’s it — the word is complete." : "Tap each wooden letter."}
                  </span>
                  <button type="button" onClick={() => setBuiltIds([])}>Reset</button>
                </div>
              </article>

              <article className={styles.practiceCard}>
                <p className={styles.kicker}>QUICK RECALL</p>
                <h3>Which word matches this meaning?</h3>
                <blockquote>{selected.definition}</blockquote>
                <div className={styles.answerGrid}>
                  {recallOptions.map((word) => (
                    <button
                      type="button"
                      key={word.wordId}
                      className={answer === word.wordId ? (word.wordId === selected.wordId ? styles.correct : styles.incorrect) : ""}
                      onClick={() => setAnswer(word.wordId)}
                    >
                      {word.headword}
                    </button>
                  ))}
                </div>
                <div className={styles.practiceFooter}>
                  <span className={answer === selected.wordId ? styles.successMessage : ""}>
                    {answer === selected.wordId && <b aria-hidden="true">✦</b>}
                    {answer ? (answer === selected.wordId ? "Correct — retrieve it again later." : `Not yet. The answer is “${selected.headword}”.`) : "Choose one answer."}
                  </span>
                  <button type="button" onClick={() => setAnswer(null)}>Again</button>
                </div>
              </article>
            </div>
          </section>
        </div>
      )}

      {view === "library" && (
        <section className={styles.libraryView}>
          <div className={styles.viewIntro}>
            <div><p className={styles.kicker}>CARDS COLLECTION</p><h1>See it. Recall it.</h1></div>
            <p>Open an illustrated card to hear the word, choose a personal color cue, build it with wooden letters, and practice recall.</p>
          </div>
          <div className={styles.collectionHeader}>
            <div><span>Illustrated cards ready</span><strong>{illustratedWords.length}</strong></div>
            <p>Each sketch is matched to its exact word ID and learning pack.</p>
          </div>
          <div className={styles.cardCollection}>
            {illustratedWords.map((word) => (
              <button type="button" className={styles.collectionCard} key={word.wordId} onClick={() => selectWord(word)}>
                <div className={styles.collectionArtwork}>
                  <Image
                    src={word.thumbnailPath!}
                    alt={word.imageAlt ?? `Tingle memory sketch for ${word.headword}`}
                    width={480}
                    height={360}
                    sizes="(max-width: 680px) 44vw, (max-width: 1050px) 29vw, 210px"
                  />
                  <span>Pack {String(word.pack).padStart(2, "0")}</span>
                </div>
                <div><strong>{word.headword}</strong><small>{word.wordId}</small></div>
                <i aria-hidden="true">→</i>
              </button>
            ))}
          </div>
          <section className={styles.archiveSection}>
            <div className={styles.archiveIntro}>
              <div>
                <p className={styles.kicker}>THE TINGLE VISUAL LIBRARY</p>
                <h2>Illustration collection.</h2>
                <p>Visual references from the Tingle collection—organized alongside our sketch-memory cards.</p>
              </div>
              <div className={styles.archiveCount}><strong>{archiveCards.length}</strong><span>archive visuals</span></div>
            </div>
            <div className={styles.archiveTools}>
              <input
                value={archiveQuery}
                onChange={(event) => { setArchiveQuery(event.target.value); setArchiveLimit(48); }}
                placeholder="Search the illustration archive"
                aria-label="Search the illustration archive"
              />
              <span>{filteredArchiveCards.length} visuals</span>
            </div>
            <div className={styles.archiveGrid}>
              {visibleArchiveCards.map((card) => {
                const linkedWord = card.wordId ? wordsById.get(card.wordId) : undefined;
                return (
                  <article className={styles.archiveCard} key={card.archiveId}>
                    <div className={styles.archiveArtwork}>
                      <Image src={card.imagePath} alt={`Tingle illustration for ${card.label}`} width={480} height={480} sizes="(max-width: 680px) 44vw, (max-width: 1050px) 22vw, 180px" />
                    </div>
                    <div className={styles.archiveMeta}>
                      <strong>{card.label}</strong>
                      {linkedWord ? (
                        <button type="button" onClick={() => selectWord(linkedWord)}>Open learning card →</button>
                      ) : (
                        <span>Archive visual</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            {archiveLimit < filteredArchiveCards.length && (
              <button type="button" className={styles.showMoreArchive} onClick={() => setArchiveLimit(archiveLimit + 48)}>
                Show more illustrations
              </button>
            )}
          </section>
          <div className={styles.catalogueHeading}>
            <p className={styles.kicker}>2,000-WORD FOUNDATION</p>
            <h2>Search the complete word catalogue.</h2>
          </div>
          <div className={styles.libraryTools}>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search words or meanings" aria-label="Search the word library" />
            <select value={pack} onChange={(event) => setPack(event.target.value === "all" ? "all" : Number(event.target.value))} aria-label="Filter by pack">
              <option value="all">All 20 packs</option>
              {Array.from({ length: 20 }, (_, index) => <option key={index + 1} value={index + 1}>Pack {String(index + 1).padStart(2, "0")}</option>)}
            </select>
            <span>{filteredWords.length === 80 ? "First 80 matches" : `${filteredWords.length} matches`}</span>
          </div>
          <div className={styles.wordTable}>
            <div className={styles.tableHead}><span>Word</span><span>Meaning</span><span>Pack</span><span>Status</span><span /></div>
            {filteredWords.map((word) => (
              <button type="button" className={styles.wordRow} key={word.wordId} onClick={() => selectWord(word)}>
                <strong>{word.headword}</strong>
                <span>{word.definition}</span>
                <small>{String(word.pack).padStart(2, "0")}</small>
                <small className={progress[word.wordId]?.remembered ? styles.doneStatus : ""}>{progress[word.wordId]?.remembered ? "Remembered" : progress[word.wordId] ? `${progress[word.wordId].cue} cue` : word.imageStatus === "approved" ? "Sketch ready" : "New"}</small>
                <i>→</i>
              </button>
            ))}
          </div>
        </section>
      )}

      {view === "games" && (
        <section className={styles.gamesView}>
          <div className={styles.viewIntro}>
            <div><p className={styles.kicker}>TINGLE RECALL GAMES</p><h1>Play to remember.</h1></div>
            <p>Practice retrieval through short, tactile card games. Pair each sketch with its word, then strengthen recall with Word Bingo.</p>
          </div>
          <div className={styles.pairPanel}>
            <div className={styles.pairHeader}>
              <div>
                <p className={styles.kicker}>RECALL GAME 01 · CHOOSE THE PAIR</p>
                <h2>{pairComplete ? "All pairs found!" : "Match picture + word."}</h2>
                <p>{pairComplete ? `You completed the round in ${pairAttempts} ${pairAttempts === 1 ? "try" : "tries"}.` : "Turn over two cards. Find the word that belongs to each Tingle sketch."}</p>
              </div>
              <div className={styles.pairScore}>
                <span><b>{matchedPairIds.length}</b> / {pairWords.length} pairs</span>
                <span><b>{pairAttempts}</b> tries</span>
                <button type="button" onClick={newPairRound}>{pairComplete ? "Play again" : "New cards"} ↗</button>
              </div>
            </div>
            <div className={`${styles.pairBoard} ${pairComplete ? styles.pairBoardComplete : ""}`} aria-live="polite">
              {pairCards.map((card) => {
                const word = wordsById.get(card.wordId);
                if (!word) return null;
                const isOpen = openPairCards.includes(card.key) || matchedPairIds.includes(card.wordId);
                const isMatched = matchedPairIds.includes(card.wordId);
                return (
                  <button
                    type="button"
                    key={card.key}
                    className={`${styles.pairCard} ${isOpen ? styles.pairCardOpen : ""} ${isMatched ? styles.pairCardMatched : ""}`}
                    onClick={() => choosePairCard(card)}
                    aria-label={isOpen ? `${card.kind === "picture" ? "Picture" : "Word"} card: ${word.headword}` : "Hidden pairing card"}
                    aria-pressed={isOpen}
                  >
                    <span className={styles.pairCardBack}><i aria-hidden="true">✦</i><small>TINGLE</small></span>
                    <span className={styles.pairCardFront}>
                      {card.kind === "picture" && word.thumbnailPath ? (
                        <Image src={word.thumbnailPath} alt={word.imageAlt ?? `Tingle memory sketch for ${word.headword}`} width={480} height={360} sizes="(max-width: 680px) 42vw, 220px" />
                      ) : (
                        <strong>{word.headword}</strong>
                      )}
                      <small>{card.kind === "picture" ? "PICTURE" : "WORD"}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className={styles.gamePanel}>
            <div className={styles.gameCopy}>
              <span className={styles.livePill}>RECALL GAME 02 · WORD BINGO</span>
              <h2>{bingo ? "Bingo!" : "Make one line."}</h2>
              <p>{bingo ? "You completed a recall line. Start a fresh board when you’re ready." : "Choose a word, say it aloud, then tap the tile. Use your memory—not speed."}</p>
              <button type="button" onClick={() => { setBingoSeed(bingoSeed + 1); setBingoMarks([]); }}>New board ↗</button>
              <div className={styles.gameStats}><span><b>{cueCount}</b> words with cues</span><span><b>{rememberedCount}</b> remembered</span></div>
            </div>
            <div className={`${styles.bingoBoard} ${bingo ? styles.hasBingo : ""}`}>
              {bingoWords.map((word, index) => (
                <button
                  type="button"
                  key={word.wordId}
                  className={bingoMarks.includes(index) ? styles.markedTile : ""}
                  style={{ "--tile-color": cues[index % cues.length].color } as React.CSSProperties}
                  onClick={() => setBingoMarks(bingoMarks.includes(index) ? bingoMarks.filter((item) => item !== index) : [...bingoMarks, index])}
                >
                  <small>{word.wordId.replace("TNG-", "")}</small>
                  <strong>{word.headword}</strong>
                  <span>{bingoMarks.includes(index) ? "✓" : "+"}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
