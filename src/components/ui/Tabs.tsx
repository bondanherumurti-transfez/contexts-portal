interface Tab {
  /** Displayed text in the tab strip. */
  label: string;
  /** Internal key passed to `onChange` and compared against `active`. */
  value: string;
}

interface TabsProps {
  /** Ordered list of tabs to render. */
  tabs: Tab[];
  /** `value` of the currently selected tab. */
  active: string;
  /** Called with the new tab's `value` when the user clicks a tab. */
  onChange: (value: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-0.5 px-[14px] border-hairline-b shrink-0 pt-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-3 py-[7px] text-[12px] border-b-[1.5px] -mb-px transition-colors ${
            active === tab.value
              ? "text-text-body border-text-body"
              : "text-text-muted border-transparent hover:text-text-body"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
