export function ToggleRow(props: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button onClick={() => props.onChange(!props.value)} className="w-full">
      <div className="flex flex-row items-center justify-between bg-ink-900 border border-gold-700/30 rounded-lg px-3 py-3">
        <span className="text-gold-100">{props.label}</span>
        <span className={props.value ? "text-gold-400 font-semibold" : "text-gold-400/50"}>
          {props.value ? "✓" : "—"}
        </span>
      </div>
    </button>
  );
}