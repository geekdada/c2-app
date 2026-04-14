import appIconUrl from "@/assets/app.svg";

type BrandBadgeProps = {
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<BrandBadgeProps["size"]>, string> = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-10 w-10 rounded-xl",
  lg: "h-12 w-12 rounded-xl",
};

export function BrandBadge({ size = "md" }: BrandBadgeProps) {
  return <img src={appIconUrl} alt="C2" className={sizeClasses[size]} />;
}
