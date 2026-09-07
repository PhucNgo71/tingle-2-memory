"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

const steps = [
  ["01", "Build word", "Use tactile blocks to connect sound, shape, and spelling."],
  ["02", "Open card", "Find the calm online sketch card for the word."],
  ["03", "Choose color", "Pick the quiet color cue that feels easiest to remember."],
  ["04", "Hear & connect", "Link pronunciation, meaning, sketch, and spelling."],
  ["05", "Review", "Short recall games bring the word back at the right moment."],
];

const ecosystem = [
  ["01", "Tingle Word Board", "An A2 wooden rail board holds longer words securely—without magnets.", "Build"],
  ["02", "Wood & color blocks", "Rounded alphabet blocks and seven color cue blocks make learning safe and tactile.", "Touch"],
  ["03", "Online memory cards", "Sketch, pronunciation, meaning, and examples come together; color is chosen in the app.", "Choose"],
  ["04", "Recall games", "Simple, low-pressure reviews turn recognition into recall without overbuilding the experience.", "Remember"],
];

const cueOptions = [
  { name: "Orange", color: "#FF7A00", soft: "#FFF0DF" },
  { name: "Green", color: "#2E9D71", soft: "#E7F5EE" },
  { name: "Yellow", color: "#E5B600", soft: "#FFF7CE" },
  { name: "Blue", color: "#3977D1", soft: "#E8F1FF" },
  { name: "Red", color: "#D95A4E", soft: "#FBEAE7" },
  { name: "Purple", color: "#8B63C7", soft: "#F1EBFA" },
  { name: "Pink", color: "#D86F9B", soft: "#FBEAF1" },
];

export default function Home() {
  const [cue, setCue] = useState(cueOptions[0]);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="overflow-hidden bg-tingle-cream text-tingle-charcoal">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-[#fffaf2]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <a href="#top" className="brand-logo" aria-label="Tingle home">
            <Image src="/tingle-logo-official.jpg" alt="Tingle" width={100} height={100} className="brand-logo-image" priority />
          </a>
          <nav className="hidden items-center gap-8 text-[0.9rem] font-semibold text-tingle-muted md:flex" aria-label="Main navigation">
            <a className="nav-link" href="#how">How it works</a>
            <a className="nav-link" href="#color">Why color</a>
            <a className="nav-link" href="#ecosystem">Ecosystem</a>
          </nav>
          <a className="button button-small" href="#early-access">Get early access <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <section id="top" className="relative pt-[76px]">
        <div className="hero-glow" aria-hidden="true" />
        <div className="mx-auto grid min-h-[760px] max-w-[1240px] items-center gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:py-20">
          <div className="relative z-10 max-w-[650px]">
            <p className="eyebrow"><span className="eyebrow-dot" /> AI visual memory learning</p>
            <h1 className="mt-7 font-serif text-[clamp(4.2rem,8.5vw,8.4rem)] font-normal leading-[0.84] tracking-[-0.07em]">
              Build it.<br />Choose it.<br /><em className="relative not-italic text-tingle-orange">Remember it.<span className="sketch-underline" aria-hidden="true" /></em>
            </h1>
            <p className="mt-9 max-w-[560px] text-lg leading-8 text-tingle-muted sm:text-xl">
              Tingle pairs a safe A2 wooden rail board with calm online memory cards and personal color choice in the app—so English words are easier to recognize and recall.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a className="button" href="#early-access">Join early access <span aria-hidden="true">→</span></a>
              <a className="text-link" href="#how">See how memory moves <span aria-hidden="true">↓</span></a>
            </div>
            <p className="mt-8 flex items-center gap-3 text-sm font-semibold text-tingle-muted"><span className="tiny-mark">CUE</span> One color. One personal connection. Another way back to the word.</p>
          </div>
          <div className="relative lg:-mr-28">
            <div className="hero-image-wrap">
              <Image src="/tingle-build-memory-v2.png" alt="A wooden word board with blocks spelling sun beside a calm sun memory card" width={1536} height={1024} priority className="h-auto w-full" />
            </div>
            <div className="float-note float-note-top"><span>01</span> Build it by hand</div>
            <div className="float-note float-note-bottom"><span>02</span> Choose your cue</div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-tingle-paper py-8">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-5 px-5 text-center sm:px-8 md:flex-row md:text-left">
          <p className="font-serif text-2xl leading-tight sm:text-3xl">Tingle helps learners build words offline and remember them online.</p>
          <p className="max-w-xl text-base leading-7 text-tingle-muted"><strong className="text-tingle-charcoal">Block offline. Card online. Color chosen in app.</strong> One focused hybrid system for tangible learning and personal recall.</p>
        </div>
      </section>

      <section id="how" className="section-shell">
        <div className="section-heading">
          <div><p className="section-number">01 / HOW IT WORKS</p><h2>From building to <em>lasting recall.</em></h2></div>
          <p>One gentle flow connects building, choosing, listening, and remembering—without adding noise.</p>
        </div>
        <div className="mt-14 grid gap-3 md:grid-cols-5">
          {steps.map(([number, title, body], index) => (
            <article className="step-card" key={title}>
              <div className="flex items-center justify-between"><span className="step-number">{number}</span>{index < 4 && <span className="step-arrow" aria-hidden="true">→</span>}</div>
              <div><h3>{title}</h3><p>{body}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section id="color" className="bg-tingle-charcoal py-24 text-white sm:py-32">
        <div className="mx-auto grid max-w-[1240px] gap-16 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="section-number text-orange-300">02 / WHY COLOR MATTERS</p>
            <h2 className="mt-5 max-w-[650px] font-serif text-[clamp(3.2rem,6vw,6rem)] leading-[0.95] tracking-[-0.05em]">Color is not <em className="text-tingle-orange">decoration.</em></h2>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/65">A memory becomes easier to revisit when learning gives the brain a distinctive, meaningful cue. Tingle lets each learner choose a color and reconnect with that same cue during review.</p>
            <div className="theory-list mt-10">
              {[
                ["01", "Notice", "Color can direct attention to the part of a card that matters, giving the word a clearer moment of focus."],
                ["02", "Connect", "Choosing a color adds a personal association to the word instead of treating color as decoration."],
                ["03", "Retrieve", "When the same cue returns during review, it can help reinstate part of the original learning context."],
              ].map(([number, title, body]) => (
                <article className="theory-point" key={title}>
                  <span>{number}</span>
                  <div><h3>{title}</h3><p>{body}</p></div>
                </article>
              ))}
            </div>
            <p className="theory-note">Color is a support, not a guarantee. Durable recall still depends on attention, meaning, and repeated retrieval.</p>
            <p className="theory-note">Over time, Tingle&apos;s AI layer can learn which color cues best support each learner&apos;s recall.</p>
            <p className="research-links">Research basis: <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3743993/" target="_blank" rel="noreferrer">color, attention & memory ↗</a><a href="https://pubmed.ncbi.nlm.nih.gov/18062540/" target="_blank" rel="noreferrer">color as context ↗</a></p>
          </div>
          <div className="memory-rule-visual">
            <div className="rule-card rule-card-back" aria-hidden="true" />
            <div className="rule-card">
              <span className="card-index">MEMORY / 001</span>
              <div className="sun-sketch" aria-hidden="true">☼</div>
              <div className="card-word"><span>sun</span><small>/sʌn/</small></div>
              <span className="color-chip">your cue</span>
            </div>
            <span className="pencil-note">one cue,<br />another way back ↗</span>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <div><p className="section-number">03 / PERSONAL MEMORY</p><h2>Choose your <em>memory cue.</em></h2></div>
          <p>The word stays the same. The cue changes with the learner. Choose from seven color cues in the app and find the quiet signal that feels personally recognizable.</p>
        </div>
        <div className="cue-stage mt-14">
          <div className="cue-card" style={{ "--cue": cue.color, "--cue-soft": cue.soft } as React.CSSProperties}>
            <span className="card-index text-tingle-muted">MEMORY / SUN</span>
            <div className="cue-sun" aria-hidden="true">☼</div>
            <div className="text-center"><p className="font-serif text-5xl tracking-[-0.04em]">sun</p><p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-tingle-muted">light · warmth · day</p></div>
            <span className="cue-label">{cue.name} cue</span>
          </div>
          <div className="cue-controls" role="group" aria-label="Choose a color memory cue">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-tingle-muted">Select a quiet signal</p>
            {cueOptions.map((option) => (
              <button key={option.name} type="button" onClick={() => setCue(option)} className={`cue-option ${cue.name === option.name ? "is-active" : ""}`} aria-pressed={cue.name === option.name}>
                <span className="cue-swatch" style={{ backgroundColor: option.color }} />
                <span>{option.name}</span>
                <span className="ml-auto" aria-hidden="true">{cue.name === option.name ? "✓" : "↗"}</span>
              </button>
            ))}
            <p className="mt-6 max-w-sm text-sm leading-6 text-tingle-muted">Personal choice creates an extra point of connection—without overwhelming the sketch.</p>
          </div>
        </div>
      </section>

      <section id="ecosystem" className="section-shell pt-6">
        <div className="section-heading">
          <div><p className="section-number">04 / THE TINGLE ECOSYSTEM</p><h2>Four ways to make a <em>word stick.</em></h2></div>
          <p>Digital intelligence and tactile learning work together, each doing one simple job well.</p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {ecosystem.map(([number, title, body, action], index) => (
            <article className={`ecosystem-card ecosystem-${index + 1}`} key={title}>
              <div className="flex items-start justify-between"><span className="ecosystem-number">{number}</span><span className="ecosystem-action">{action}</span></div>
              <div><h3>{title}</h3><p>{body}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="blocks-panel">
          <div className="max-w-xl">
            <p className="section-number">05 / TINGLE WORD BOARD</p>
            <h2 className="mt-5 font-serif text-[clamp(3rem,5vw,5.2rem)] leading-[0.95] tracking-[-0.05em]">Build the word.<br /><em>Feel the recall.</em></h2>
            <p className="mt-7 text-lg leading-8 text-tingle-muted">The A2 wooden rail board gives learners room to build longer words by hand. Its rail-guided placement keeps safe, smooth blocks in line—without magnets.</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {["A2 rail board, no magnet", "Safe, rounded natural wood", "Wood alphabet blocks", "7 color cue blocks"].map(item => <li className="check-item" key={item}><span>✓</span>{item}</li>)}
            </ul>
          </div>
          <div className="word-blocks" aria-label="Wooden letter blocks spelling Tingle">
            {["T", "I", "N", "G", "L", "E"].map((letter, index) => <span key={letter + index} className={index === 1 || index === 5 ? "accent-block" : ""}>{letter}</span>)}
          </div>
        </div>
      </section>

      <section className="section-shell pt-6">
        <div className="coming-panel">
          <div>
            <span className="coming-pill">COMING NEXT · PHASE 2</span>
            <h2 className="mt-7 font-serif text-[clamp(3rem,5.4vw,5.6rem)] leading-[0.95] tracking-[-0.05em]">Draw, scan & animate<br /><em>your own card.</em></h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-tingle-muted">Later—not in Phase 1—learners will draw a personal cue, scan it, and use AI animation to turn it into a reusable memory card. For now, Tingle stays focused: build the word, open the card, choose a cue, remember it.</p>
          </div>
          <div className="phase-divider"><span className="phase active"><b>Now</b> Build & remember</span><span className="phase-line" /><span className="phase"><b>Next</b> Draw your own</span></div>
        </div>
      </section>

      <section className="section-shell py-20 sm:py-28">
        <div className="launch-strip">
          <div><p className="section-number">MADE FOR EVERY LEARNER</p><h2>Words belong to everyone.</h2></div>
          <p>Tingle is designed for learners everywhere—at home, in classrooms, and wherever a new word becomes part of daily life.</p>
          <div className="country-marks" aria-label="For learning at home, in class, and anywhere"><span>HOME</span><span>CLASS</span></div>
        </div>
      </section>

      <section id="early-access" className="px-5 pb-5 sm:px-8 sm:pb-8">
        <div className="cta-panel">
          <p className="section-number text-orange-200">EARLY ACCESS</p>
          <h2 className="mt-5 font-serif text-[clamp(3.5rem,7vw,7.4rem)] leading-[0.86] tracking-[-0.06em] text-white">Make words<br /><em className="text-tingle-orange">stay with you.</em></h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/65">Be among the first learners, families, teachers, and learning partners to experience Tingle—wherever you are.</p>
          {submitted ? (
            <div className="success-note" role="status"><span>✓</span><div><strong>You’re on the early list.</strong><p>We’ll keep the next step simple.</p></div></div>
          ) : (
            <form className="signup-form" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="email">Email address</label>
              <input id="email" type="email" required placeholder="Your email address" autoComplete="email" />
              <button type="submit">Request early access <span aria-hidden="true">→</span></button>
            </form>
          )}
          <p className="mt-4 text-xs text-white/40">A private Phase 1 preview. No noise, only meaningful updates.</p>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1240px] flex-col justify-between gap-8 px-5 py-10 text-sm text-tingle-muted sm:px-8 md:flex-row md:items-end">
        <div><a href="#top" className="brand-logo" aria-label="Tingle home"><Image src="/tingle-logo-official.jpg" alt="Tingle" width={100} height={100} className="brand-logo-image" /></a><p className="mt-3">Build offline. Remember online.</p></div>
        <div className="flex flex-wrap gap-x-8 gap-y-3"><a className="nav-link" href="#how">How it works</a><a className="nav-link" href="#color">Why color</a><a className="nav-link" href="#early-access">Early access</a></div>
        <p>© {new Date().getFullYear()} Tingle. Learning, made memorable.</p>
      </footer>
    </main>
  );
}
