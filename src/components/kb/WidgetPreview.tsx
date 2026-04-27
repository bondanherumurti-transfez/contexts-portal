interface WidgetPreviewProps {
  /**
   * Exactly 3 quick-reply pill labels, matching the `kb.pills` array stored on the backend.
   * Rendered right-to-left above the FAB circle, mirroring the live widget appearance.
   */
  pills: [string, string, string];
}

export function WidgetPreview({ pills }: WidgetPreviewProps) {
  return (
    <div className="p-[14px] bg-background-secondary rounded-[8px]">
      <div className="flex items-end gap-[10px]">
        <div className="flex flex-col gap-[5px] items-end flex-1">
          {pills.map((pill) => (
            <div
              key={pill}
              className="text-[11px] px-3 py-[5px] bg-white rounded-[14px] border-hairline text-[#444]"
            >
              {pill}
            </div>
          ))}
        </div>
        <div className="w-8 h-8 rounded-full bg-primary shrink-0" />
      </div>
    </div>
  );
}
