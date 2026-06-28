import type { Slide, Card, Stat, Step } from "@presentation-skill-pack/export";
import { LAYOUT_LABELS } from "../deck.js";
import type { LayoutType } from "../deck.js";
import { TextInput, TextArea, NumberSelect, ListEditor } from "./fields.js";

export function SlideForm({
  slide,
  onChange,
}: {
  slide: Slide;
  onChange: (next: Slide) => void;
}) {
  const set = (patch: Partial<Slide>) => onChange({ ...slide, ...patch });
  const layout = slide.layout as LayoutType;

  return (
    <div className="slide-form">
      <h2 className="panel-title">{LAYOUT_LABELS[layout] ?? slide.layout}</h2>
      {renderFields()}
    </div>
  );

  function renderFields() {
    switch (slide.layout) {
      case "title":
      case "closing":
        return (
          <>
            <TextInput label="Eyebrow" value={slide.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <TextInput label="Heading" value={slide.heading} onChange={(v) => set({ heading: v })} />
            <TextArea label="Lead" value={slide.lead} onChange={(v) => set({ lead: v })} />
            {slide.layout === "closing" && (
              <>
                <TextInput label="CTA label" value={slide.cta?.label} onChange={(v) => set({ cta: { ...slide.cta, label: v } })} />
                <TextInput label="CTA link" value={slide.cta?.href} onChange={(v) => set({ cta: { ...slide.cta, href: v } })} />
              </>
            )}
          </>
        );

      case "section":
        return (
          <>
            <TextInput label="Number" value={slide.number} onChange={(v) => set({ number: v })} />
            <TextInput label="Eyebrow" value={slide.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <TextInput label="Heading" value={slide.heading} onChange={(v) => set({ heading: v })} />
            <TextArea label="Lead" value={slide.lead} onChange={(v) => set({ lead: v })} />
          </>
        );

      case "two-column":
        return (
          <>
            <TextInput label="Eyebrow" value={slide.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <TextInput label="Heading" value={slide.heading} onChange={(v) => set({ heading: v })} />
            <TextArea label="Body" value={slide.body} onChange={(v) => set({ body: v })} rows={5} />
            <TextInput label="Image URL (data: URIs embed in PPTX)" value={slide.image} onChange={(v) => set({ image: v })} />
            <TextInput label="Image alt" value={slide.imageAlt} onChange={(v) => set({ imageAlt: v })} />
          </>
        );

      case "quote":
        return (
          <>
            <TextArea label="Quote" value={slide.quote} onChange={(v) => set({ quote: v })} rows={4} />
            <TextInput label="Attribution" value={slide.by} onChange={(v) => set({ by: v })} />
          </>
        );

      case "feature-grid":
        return (
          <>
            <TextInput label="Eyebrow" value={slide.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <TextInput label="Heading" value={slide.heading} onChange={(v) => set({ heading: v })} />
            <NumberSelect
              label="Columns"
              value={typeof slide.columns === "number" ? slide.columns : 3}
              options={[2, 3, 4]}
              onChange={(v) => set({ columns: v })}
            />
            <ListEditor<Card>
              label="Cards"
              items={slide.cards ?? []}
              onChange={(cards) => set({ cards })}
              blank={() => ({ title: "New card", body: "" })}
              renderItem={(card, setItem) => (
                <>
                  <TextInput label="Icon (FontAwesome class)" value={card.icon} onChange={(v) => setItem({ ...card, icon: v })} />
                  <TextInput label="Title" value={card.title} onChange={(v) => setItem({ ...card, title: v })} />
                  <TextArea label="Body" value={card.body} onChange={(v) => setItem({ ...card, body: v })} rows={2} />
                </>
              )}
            />
          </>
        );

      case "stat-row":
        return (
          <>
            <TextInput label="Eyebrow" value={slide.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <TextInput label="Heading" value={slide.heading} onChange={(v) => set({ heading: v })} />
            <ListEditor<Stat>
              label="Stats"
              items={slide.stats ?? []}
              onChange={(stats) => set({ stats })}
              blank={() => ({ value: "0", label: "Metric" })}
              renderItem={(stat, setItem) => (
                <>
                  <TextInput label="Value" value={stat.value} onChange={(v) => setItem({ ...stat, value: v })} />
                  <TextInput label="Label" value={stat.label} onChange={(v) => setItem({ ...stat, label: v })} />
                </>
              )}
            />
          </>
        );

      case "timeline":
        return (
          <>
            <TextInput label="Eyebrow" value={slide.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <TextInput label="Heading" value={slide.heading} onChange={(v) => set({ heading: v })} />
            <ListEditor<Step>
              label="Steps"
              items={slide.steps ?? []}
              onChange={(steps) => set({ steps })}
              blank={() => ({ title: "New step", body: "" })}
              renderItem={(step, setItem) => (
                <>
                  <TextInput label="Title" value={step.title} onChange={(v) => setItem({ ...step, title: v })} />
                  <TextArea label="Body" value={step.body} onChange={(v) => setItem({ ...step, body: v })} rows={2} />
                </>
              )}
            />
          </>
        );

      case "data-table":
        return <DataTableFields slide={slide} set={set} />;

      default:
        return <p className="muted">No editable fields for this layout.</p>;
    }
  }
}

function DataTableFields({ slide, set }: { slide: Slide; set: (patch: Partial<Slide>) => void }) {
  const headers: string[] = Array.isArray(slide.columns) ? slide.columns : [];
  const rows: string[][] = Array.isArray(slide.rows) ? slide.rows : [];
  const colCount = Math.max(headers.length, ...rows.map((r) => r.length), 1);

  const setHeader = (i: number, v: string) => {
    const next = headers.slice();
    next[i] = v;
    set({ columns: next });
  };
  const addColumn = () => {
    set({ columns: [...headers, `Column ${headers.length + 1}`], rows: rows.map((r) => [...r, ""]) });
  };
  const removeColumn = (i: number) => {
    set({ columns: headers.filter((_, idx) => idx !== i), rows: rows.map((r) => r.filter((_, idx) => idx !== i)) });
  };

  return (
    <>
      <TextInput label="Eyebrow" value={slide.eyebrow} onChange={(v) => set({ eyebrow: v })} />
      <TextInput label="Heading" value={slide.heading} onChange={(v) => set({ heading: v })} />
      <div className="list-editor">
        <div className="list-editor-head">
          <span className="field-label">Columns</span>
          <button className="btn btn-sm" onClick={addColumn}>+ Column</button>
        </div>
        {Array.from({ length: colCount }).map((_, i) => (
          <div className="row-inline" key={i}>
            <input
              className="text-input"
              value={headers[i] ?? ""}
              placeholder={`Column ${i + 1}`}
              onChange={(e) => setHeader(i, e.target.value)}
            />
            <button className="btn btn-icon btn-danger" title="Remove column" onClick={() => removeColumn(i)}>✕</button>
          </div>
        ))}
      </div>
      <ListEditor<string[]>
        label="Rows"
        items={rows}
        onChange={(next) => set({ rows: next })}
        blank={() => Array.from({ length: colCount }, () => "")}
        renderItem={(row, setItem) => (
          <div className="row-cells">
            {Array.from({ length: colCount }).map((_, c) => (
              <input
                key={c}
                className="text-input"
                value={row[c] ?? ""}
                placeholder={headers[c] ?? `Col ${c + 1}`}
                onChange={(e) => {
                  const next = row.slice();
                  while (next.length < colCount) next.push("");
                  next[c] = e.target.value;
                  setItem(next);
                }}
              />
            ))}
          </div>
        )}
      />
    </>
  );
}
