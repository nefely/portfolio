// Вхід через Google вимкнено за замовчуванням: кнопка має сенс лише після
// налаштування провайдера в Supabase (інакше Supabase відповідає 400
// "provider is not enabled"). Увімкнути — NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true.
export const GOOGLE_AUTH_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
