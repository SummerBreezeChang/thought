import { Baby, Clapperboard, Landmark, Moon, Tent, Utensils, Waves, type LucideIcon } from "lucide-react";
import type { Category } from "@/server/catalog/types";

const ICONS: Record<Category, LucideIcon> = {
  food: Utensils,
  outing: Clapperboard,
  membership: Landmark,
  lessons: Waves,
  camp: Tent,
  baby_gear: Baby,
  care: Moon,
};

export function GiftIcon({ category, size = "md" }: { category: Category; size?: "md" | "lg" }) {
  const Icon = ICONS[category];
  const box = size === "lg" ? "size-20 rounded-[1.5rem]" : "size-12 rounded-2xl";
  const icon = size === "lg" ? "size-9" : "size-6";
  return (
    <span aria-hidden className={`${box} grid shrink-0 place-items-center bg-th-surface text-th-label`}>
      <Icon className={icon} strokeWidth={1.6} />
    </span>
  );
}
