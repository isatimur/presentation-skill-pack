import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <input
        className="text-input"
        type="text"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <Field label={label}>
      <textarea
        className="text-input"
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function NumberSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: number[];
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <select className="text-input" value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Generic add/remove/reorder editor for an array of items. */
export function ListEditor<T>({
  label,
  items,
  onChange,
  blank,
  renderItem,
}: {
  label: string;
  items: T[];
  onChange: (next: T[]) => void;
  blank: () => T;
  renderItem: (item: T, setItem: (next: T) => void, index: number) => ReactNode;
}) {
  const replace = (i: number, item: T) => onChange(items.map((it, idx) => (idx === i ? item : it)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };

  return (
    <div className="list-editor">
      <div className="list-editor-head">
        <span className="field-label">{label}</span>
        <button className="btn btn-sm" onClick={() => onChange([...items, blank()])}>
          + Add
        </button>
      </div>
      {items.map((item, i) => (
        <div className="list-item" key={i}>
          <div className="list-item-controls">
            <span className="list-item-index">{i + 1}</span>
            <div className="spacer" />
            <button className="btn btn-icon" title="Move up" onClick={() => move(i, -1)}>↑</button>
            <button className="btn btn-icon" title="Move down" onClick={() => move(i, 1)}>↓</button>
            <button
              className="btn btn-icon btn-danger"
              title="Remove"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            >
              ✕
            </button>
          </div>
          {renderItem(item, (next) => replace(i, next), i)}
        </div>
      ))}
      {items.length === 0 && <p className="muted small">No items yet.</p>}
    </div>
  );
}
