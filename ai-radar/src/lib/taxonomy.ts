// Static taxonomy used by filters. Category values must match FreeSerp's
// `ai_categories` exactly (taken from `?stats=1` → top_ai_categories);
// the Ukrainian labels are display-only.

const CATEGORY_UK: Record<string, string> = {
  "AI Agents & Autonomous": "AI-агенти",
  "AI Automation & Workflows": "Автоматизація процесів",
  "Code & Dev Tools": "Код і інструменти розробника",
  "AI Chatbot & Assistant": "Чат-боти й асистенти",
  "AI Infrastructure & API": "AI-інфраструктура й API",
  "AI Search & Answers": "AI-пошук і відповіді",
  "AI Website Builder": "AI-конструктори сайтів",
  "No-code / App Builder": "No-code / конструктори застосунків",
  "Image Generation": "Генерація зображень",
  "Video Generation": "Генерація відео",
  "Writing & Content": "Тексти й контент",
  "SEO & Content": "SEO і контент",
  "Marketing & Ads": "Маркетинг і реклама",
  "Social Media": "Соцмережі",
  "Lead Gen & Outreach": "Лідогенерація й аутріч",
  "Sales & CRM": "Продажі й CRM",
  "Customer Support": "Підтримка клієнтів",
  "Data & Analytics": "Дані й аналітика",
  Productivity: "Продуктивність",
  "Design & UI": "Дизайн і UI",
  "Education & Tutoring": "Освіта й навчання",
  "Research & Science": "Дослідження й наука",
  "Healthcare & Medical": "Здоров'я й медицина",
  "Finance & Trading": "Фінанси й трейдинг",
  "Recruiting & HR": "Рекрутинг і HR",
  "Security & Moderation": "Безпека й модерація",
  "E-commerce": "E-commerce",
  "Directory / Aggregator": "Каталоги й агрегатори",
  "Knowledge & RAG": "Бази знань і RAG",
  "LLM & Prompt Tools": "LLM і промпт-інструменти",
  "Voice & Audio": "Голос і аудіо",
  "Legal & Compliance": "Право й комплаєнс",
  "Real Estate": "Нерухомість",
  "Travel & Hospitality": "Подорожі й гостинність",
  "Gaming & Entertainment": "Ігри й розваги",
  "Translation & Language": "Переклад і мови",
  "Logo & Branding": "Логотипи й брендинг",
  "Food & Recipe": "Їжа й рецепти",
  "Other AI": "Інше AI",
};

export const AI_CATEGORIES = [
  "AI Agents & Autonomous",
  "AI Automation & Workflows",
  "Code & Dev Tools",
  "AI Chatbot & Assistant",
  "AI Infrastructure & API",
  "AI Search & Answers",
  "AI Website Builder",
  "No-code / App Builder",
  "Image Generation",
  "Video Generation",
  "Writing & Content",
  "SEO & Content",
  "Marketing & Ads",
  "Social Media",
  "Lead Gen & Outreach",
  "Sales & CRM",
  "Customer Support",
  "Data & Analytics",
  "Productivity",
  "Design & UI",
  "Education & Tutoring",
  "Research & Science",
  "Healthcare & Medical",
  "Finance & Trading",
  "Recruiting & HR",
  "Security & Moderation",
  "E-commerce",
  "Directory / Aggregator",
  "Other AI",
] as const;

export function categoryLabel(value: string, locale: string): string {
  return locale === "uk" ? (CATEGORY_UK[value] ?? value) : value;
}

/** Category options sorted by their label in the current locale. */
export function categoryOptions(locale: string) {
  return AI_CATEGORIES.map((value) => ({ value, label: categoryLabel(value, locale) })).sort((a, b) =>
    a.label.localeCompare(b.label, locale),
  );
}

export type BuilderHint = "aiBuilder" | "v0" | "nocode" | "framework" | "cms" | "heuristic";
export type BuilderInfo = { key: string; label: string | null; hint: BuilderHint };

// `ai_source` values: what the homepage was built with. label=null → translated ("builders.aiLikely").
export const BUILDERS: BuilderInfo[] = [
  { key: "lovable", label: "Lovable", hint: "aiBuilder" },
  { key: "v0", label: "v0", hint: "v0" },
  { key: "bolt", label: "Bolt", hint: "aiBuilder" },
  { key: "base44", label: "Base44", hint: "aiBuilder" },
  { key: "framer", label: "Framer", hint: "nocode" },
  { key: "nextjs", label: "Next.js", hint: "framework" },
  { key: "wordpress", label: "WordPress", hint: "cms" },
  { key: "ai_likely", label: null, hint: "heuristic" },
];

/** Builder display name. `aiLikelyLabel` is the translated label for the heuristic bucket. */
export function builderLabel(key: string | null | undefined, aiLikelyLabel: string): string {
  if (!key) return "—";
  const b = BUILDERS.find((x) => x.key === key);
  if (!b) return key;
  return b.label ?? aiLikelyLabel;
}

export const DR_PRESETS = ["", "10", "20", "30", "50"] as const;

export const SORT_KEYS = ["went_live", "dr", "relevance", "domain"] as const;

// Shared by server pages and the client compare store — must live outside "use client" modules.
export const MAX_COMPARE = 3;
