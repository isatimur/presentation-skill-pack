export function Preview({ html }: { html: string }) {
  // The preview renders untrusted deck content (imported/edited JSON). Decks are
  // static HTML/CSS with no scripts, so we sandbox WITHOUT `allow-scripts`:
  // script execution and `javascript:` navigations are blocked, while
  // `allow-same-origin` keeps external fonts/icons and styles working.
  return (
    <div className="preview">
      <iframe
        className="preview-frame"
        title="Deck preview"
        srcDoc={html}
        sandbox="allow-same-origin"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
