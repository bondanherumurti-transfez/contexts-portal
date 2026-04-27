import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * `outline` — bordered, transparent background. Used for secondary actions (cancel, request recrawl).
   * `solid` — black fill, white text. Used for primary actions (add Q&A, add to knowledge).
   */
  variant?: "outline" | "solid";
  /** `sm` = 11px text, `md` = 12px text with slightly taller hit area. */
  size?: "sm" | "md";
}

export function Button({
  variant = "outline",
  size = "sm",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded border-[0.5px] font-sans transition-colors disabled:opacity-50",
        size === "sm" && "px-3 py-[5px] text-[11px]",
        size === "md" && "px-3 py-[6px] text-[12px]",
        variant === "outline" &&
          "border-[#888] text-[#444] bg-transparent hover:bg-background-secondary",
        variant === "solid" &&
          "border-primary bg-primary text-white hover:opacity-80",
        className,
      )}
      {...props}
    />
  );
}
