import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-3 w-3 border",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-2",
};

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-current border-t-transparent opacity-50",
        sizes[size],
        className,
      )}
      aria-label="Loading"
    />
  );
}
