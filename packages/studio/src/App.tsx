import { useEffect, useMemo, useState } from "react";
import type { DeckJson, Slide } from "@presentation-skill-pack/export";
import { EXAMPLE_DECK } from "./deck.js";
import { resolveTheme } from "./render/themes.js";
import { renderDeckHtml } from "./render/renderDeck.js";
import { Toolbar } from "./components/Toolbar.js";
import { SlideList } from "./components/SlideList.js";
import { SlideForm } from "./components/SlideForm.js";
import { Preview } from "./components/Preview.js";
import { PresentMode } from "./components/PresentMode.js";

const STORAGE_KEY = "psp-studio-deck-v1";

function loadInitialDeck(): DeckJson {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as DeckJson;
      if (parsed?.type === "deck" && Array.isArray(parsed.slides) && parsed.slides.length) {
        return parsed;
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return EXAMPLE_DECK;
}

export function App() {
  const [deck, setDeck] = useState<DeckJson>(loadInitialDeck);
  const [selected, setSelected] = useState(0);
  const [presenting, setPresenting] = useState(false);

  // Autosave to localStorage so work survives refreshes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [deck]);

  const html = useMemo(() => {
    try {
      return renderDeckHtml(deck, resolveTheme(deck.meta?.theme ?? "default-tech"));
    } catch (err) {
      return `<pre style="color:#d9695a;font-family:monospace;padding:24px">${String(err)}</pre>`;
    }
  }, [deck]);

  const setSlides = (slides: Slide[], select?: number) => {
    setDeck({ ...deck, slides });
    if (select !== undefined) setSelected(select);
  };

  const updateSlide = (next: Slide) => {
    setDeck({ ...deck, slides: deck.slides.map((s, i) => (i === selected ? next : s)) });
  };

  const loadExample = () => {
    setDeck(EXAMPLE_DECK);
    setSelected(0);
  };

  const current = deck.slides[Math.min(selected, deck.slides.length - 1)];

  return (
    <div className="app">
      <Toolbar deck={deck} onChange={setDeck} onLoadExample={loadExample} onPresent={() => setPresenting(true)} />
      <div className="workspace">
        <aside className="panel panel-left">
          <SlideList slides={deck.slides} selected={selected} onSelect={setSelected} onChange={setSlides} />
        </aside>
        <main className="panel panel-center">
          <Preview html={html} />
        </main>
        <aside className="panel panel-right">
          {current ? (
            <SlideForm slide={current} onChange={updateSlide} />
          ) : (
            <p className="muted">No slide selected.</p>
          )}
        </aside>
      </div>
      {presenting && (
        <PresentMode html={html} slideCount={deck.slides.length} onClose={() => setPresenting(false)} />
      )}
    </div>
  );
}
