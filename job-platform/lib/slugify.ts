// Транслітерація для імен українською/польською — slug лишається читабельним
// ASCII (/candidates/olena-kovalenko-4f2a) замість percent-encoded кирилиці
// (з тих самих міркувань, що й відсутність localized pathnames, див.
// i18n/routing.ts).
// prettier-ignore
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye", ж: "zh", з: "z",
  и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ь: "", ю: "yu", я: "ya", ы: "y", э: "e", ё: "yo", ъ: "",
  ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
};

export function slugify(input: string): string {
  const transliterated = Array.from(input.toLowerCase())
    .map((char) => TRANSLIT[char] ?? char)
    .join("");

  return transliterated
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

// Короткий випадковий суфікс робить slug унікальним без перевірки в БД
// (двоє "Olena Kovalenko" — нормальна ситуація). `suffix` параметром — для
// детермінованих тестів.
export function uniqueSlug(input: string, fallback: string, suffix = randomSuffix()): string {
  const base = slugify(input) || fallback;
  return `${base}-${suffix}`;
}

function randomSuffix(): string {
  return crypto.randomUUID().slice(0, 6);
}
