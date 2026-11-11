import { ageInMonths, DEMO, type Member } from "@/server/demo/family";

export function getMember(id: string): Member | undefined {
  return DEMO.members.find((m) => m.id === id);
}

export function familyOf(member: Member) {
  const family = DEMO.families.find((f) => f.id === member.familyId)!;
  const child = DEMO.children.find((c) => c.familyId === family.id)!;
  const parent = DEMO.members.find((m) => m.familyId === family.id && m.role === "parent")!;
  const months = ageInMonths(child.birthdate);
  return { family, child, parent, ageMonths: months, ageYears: Math.floor(months / 12) };
}

export const CITY_LABEL: Record<string, Record<string, string>> = {
  SF: { en: "San Francisco", "zh-TW": "舊金山", "ja-JP": "サンフランシスコ", "fr-FR": "San Francisco" },
  "East Bay": { en: "East Bay", "zh-TW": "東灣", "ja-JP": "イーストベイ", "fr-FR": "East Bay" },
};

export function memberName(id: string): string {
  return getMember(id)?.title ?? "";
}
