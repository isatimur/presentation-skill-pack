import { useState } from "react";
import type { Slide } from "@presentation-skill-pack/export";
import { LAYOUTS, LAYOUT_LABELS, blankSlide } from "../deck.js";
import type { LayoutType } from "../deck.js";

export function SlideList({
  slides,
  selected,
  onSelect,
  onChange,
}: {
  slides: Slide[];
  selected: number;
  onSelect: (i: number) => void;
  onChange: (next: Slide[], select?: number) => void;
}) {
  const [addLayout, setAddLayout] = useState<LayoutType>("title");

  const add = () => {
    const at = selected + 1;
    const next = [...slides.slice(0, at), blankSlide(addLayout), ...slides.slice(at)];
    onChange(next, at);
  };
  const duplicate = (i: number) => {
    const copy = JSON.parse(JSON.stringify(slides[i])) as Slide;
    onChange([...slides.slice(0, i + 1), copy, ...slides.slice(i + 1)], i + 1);
  };
  const remove = (i: number) => {
    if (slides.length <= 1) return;
    const next = slides.filter((_, idx) => idx !== i);
    onChange(next, Math.max(0, Math.min(i, next.length - 1)));
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const next = slides.slice();
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next, j);
  };

  return (
    <div className="slide-list">
      <div className="add-row">
        <select className="text-input" value={addLayout} onChange={(e) => setAddLayout(e.target.value as LayoutType)}>
          {LAYOUTS.map((l) => (
            <option key={l} value={l}>{LAYOUT_LABELS[l]}</option>
          ))}
        </select>
        <button className="btn btn-sm" onClick={add}>+ Add</button>
      </div>
      <ul className="slides">
        {slides.map((slide, i) => (
          <li key={i} className={`slide-row ${i === selected ? "active" : ""}`} onClick={() => onSelect(i)}>
            <div className="slide-row-main">
              <span className="slide-row-num">{i + 1}</span>
              <div className="slide-row-text">
                <span className="slide-row-layout">{LAYOUT_LABELS[slide.layout as LayoutType] ?? slide.layout}</span>
                <span className="slide-row-title">{slide.heading ?? slide.quote ?? slide.eyebrow ?? "—"}</span>
              </div>
            </div>
            <div className="slide-row-actions" onClick={(e) => e.stopPropagation()}>
              <button className="btn btn-icon" title="Move up" onClick={() => move(i, -1)}>↑</button>
              <button className="btn btn-icon" title="Move down" onClick={() => move(i, 1)}>↓</button>
              <button className="btn btn-icon" title="Duplicate" onClick={() => duplicate(i)}>⧉</button>
              <button className="btn btn-icon btn-danger" title="Delete" onClick={() => remove(i)}>✕</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
