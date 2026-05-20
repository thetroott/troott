/** Normalizes email persisted in storage (quotes / JSON-encoding quirks). */
export function cleanStoredEmail(raw: string | null | undefined): string {
    if (raw === null || raw === undefined || raw === '') return '';
    let clean = raw;
    if (clean.startsWith('"') && clean.endsWith('"')) {
        try {
            clean = JSON.parse(clean) as string;
        } catch {
            clean = clean.replace(/^"(.*)"$/, '$1');
        }
    }
    return clean;
}
