/** Auth screens — square corners on inputs and buttons. */
export const authInputClass = 'h-12 rounded-none';
export const authOtpInputClass =
    'h-12 w-12 rounded-none text-center text-lg font-semibold';
export const authSubmitButtonClass = 'h-12 w-full rounded-none';
export const authSecondaryButtonClass = 'w-full rounded-none';
export const authPasswordToggleClass =
    'absolute right-0 top-0 h-full rounded-none px-3 py-2 hover:bg-transparent';

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
