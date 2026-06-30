import { useEffect, useRef, useState } from "react";

// Injected into the deck so each slide fills the viewport and pages cleanly.
const PRESENT_CSS = `
html { scroll-behavior: smooth; scroll-snap-type: y mandatory; }
body { gap: 0 !important; padding: 0 !important; }
.slide { min-height: 100vh !important; margin: 0 !important; border-radius: 0 !important; scroll-snap-align: start !important; scroll-snap-stop: always !important; }
.psp-attribution { display: none !important; }
`;

export function PresentMode({
  html,
  slideCount,
  onClose,
}: {
  html: string;
  slideCount: number;
  onClose: () => void;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [i, setI] = useState(0);
  const presentHtml = html.replace("</head>", `<style>${PRESENT_CSS}</style></head>`);

  const go = (n: number) => setI((p) => Math.max(0, Math.min(slideCount - 1, p + n)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setI((p) => Math.min(slideCount - 1, p + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setI((p) => Math.max(0, p - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, slideCount]);

  useEffect(() => {
    const doc = frameRef.current?.contentDocument;
    const sections = doc?.querySelectorAll<HTMLElement>("section.slide");
    sections?.[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [i, presentHtml]);

  return (
    <div className="present-overlay">
      <div className="present-stage">
        <iframe
          ref={frameRef}
          className="present-frame"
          title="Present deck"
          srcDoc={presentHtml}
          sandbox="allow-same-origin"
        />
      </div>
      <div className="present-bar">
        <button className="btn btn-icon" title="Previous (←)" onClick={() => go(-1)}>←</button>
        <span className="present-count">{i + 1} / {slideCount}</span>
        <button className="btn btn-icon" title="Next (→)" onClick={() => go(1)}>→</button>
        <button className="btn" onClick={onClose}>Exit · Esc</button>
      </div>
    </div>
  );
}
