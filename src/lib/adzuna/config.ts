export function isAdzunaConfigured(): boolean {
  const id = process.env.ADZUNA_APP_ID?.trim() ?? '';
  const key = process.env.ADZUNA_APP_KEY?.trim() ?? '';
  return Boolean(id && key && !id.toLowerCase().includes('your-') && !key.toLowerCase().includes('your-'));
}

/** ISO country slug for Adzuna path, e.g. `us`, `gb`, `au`. */
export function getAdzunaCountry(): string {
  const raw = (process.env.ADZUNA_COUNTRY ?? 'us').trim().toLowerCase();
  return raw || 'us';
}

export function getAdzunaResultsPerPage(): number {
  const n = Number.parseInt(process.env.ADZUNA_RESULTS_PER_PAGE ?? '20', 10);
  return Number.isFinite(n) && n > 0 && n <= 50 ? n : 20;
}
