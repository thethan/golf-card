export function ToggleRow(props: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button onClick={() => props.onChange(!props.value)} className="w-full">
      <div className="flex flex-row items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-3">
        <span className="text-white">{props.label}</span>
        <span className={props.value ? "text-emerald-400 font-semibold" : "text-slate-400"}>
          {props.value ? "✓" : "—"}
        </span>
      </div>
    </button>
  );
}