const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// `id` колонок job_platform_* — Postgres uuid: некоректний id з URL
// (напр. /jobs/abc) інакше валив би сам запит ("invalid input syntax for
// type uuid") замість акуратного notFound().
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
