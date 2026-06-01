/** Client-only Get Started keys in localStorage (cleared on logout). */

export const LEGACY_ONBOARDING_PROGRESS_KEY = 'onboarding_progress';

export const GET_STARTED_VERIFY_ACCOUNT_COUNTRY_KEY =
    'troott.getStarted.verifyAccount.country';

export const GET_STARTED_SELECTED_DOCUMENT_TYPE_KEY = 'selectedDocumentType';

export const GET_STARTED_UPLOADED_DOCUMENTS_KEY = 'uploadedDocuments';

/** Legacy keys from pre-feat-0013 upload components — remove on logout / milestone. */
export const LEGACY_INTERNATIONAL_PASSPORT_DOCUMENTS_KEY =
    'internationalPassportDocuments';
export const LEGACY_DRIVER_LICENSE_DOCUMENTS_KEY = 'driverLicenseDocuments';

/** After `onboardingDocumentComplete` — server owns verification state. */
export function clearDocumentVerificationLocalStorage(): void {
    try {
        localStorage.removeItem(GET_STARTED_SELECTED_DOCUMENT_TYPE_KEY);
        localStorage.removeItem(GET_STARTED_UPLOADED_DOCUMENTS_KEY);
        localStorage.removeItem(LEGACY_INTERNATIONAL_PASSPORT_DOCUMENTS_KEY);
        localStorage.removeItem(LEGACY_DRIVER_LICENSE_DOCUMENTS_KEY);
    } catch {
        /* ignore */
    }
}

export function clearGetStartedLocalStorage(): void {
    try {
        localStorage.removeItem(LEGACY_ONBOARDING_PROGRESS_KEY);
        localStorage.removeItem(GET_STARTED_VERIFY_ACCOUNT_COUNTRY_KEY);
        clearDocumentVerificationLocalStorage();
    } catch {
        /* ignore */
    }
}

export function clearLegacyOnboardingProgress(): void {
    try {
        localStorage.removeItem(LEGACY_ONBOARDING_PROGRESS_KEY);
    } catch {
        /* ignore */
    }
}
