export function Preview({ html }: { html: string }) {
  return (
    <div className="preview">
      <iframe className="preview-frame" title="Deck preview" srcDoc={html} />
    </div>
  );
}
