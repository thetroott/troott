import { toast } from 'sonner';

function firstErrorMessage(errors: unknown): string | null {
    if (!Array.isArray(errors) || errors.length === 0) {
        return null;
    }
    const first = errors[0];
    if (typeof first === 'string' && first.trim()) {
        return first.trim();
    }
    if (first && typeof first === 'object' && 'message' in first) {
        const m = (first as { message?: unknown }).message;
        if (typeof m === 'string' && m.trim()) {
            return m.trim();
        }
    }
    return null;
}

/** Human-readable message from Troott API envelope (`message` or first `errors[]` entry). */
export function apiEnvelopeErrorMessage(body: unknown): string {
    if (body && typeof body === 'object') {
        const o = body as Record<string, unknown>;
        const m = o.message;
        if (typeof m === 'string' && m.trim()) {
            return m.trim();
        }
        const fromErrors = firstErrorMessage(o.errors);
        if (fromErrors) {
            return fromErrors;
        }
    }
    return 'Something went wrong';
}

/**
 * Shows a Sonner error when the server returns HTTP success but `error: true`
 * (e.g. validation message with status 200).
 */
export function toastIfApiEnvelopeError(
    body: unknown,
    options?: { suppress?: boolean },
): void {
    if (options?.suppress) {
        return;
    }
    if (!body || typeof body !== 'object') {
        return;
    }
    const o = body as Record<string, unknown>;
    if (o.error !== true) {
        return;
    }
    toast.error(apiEnvelopeErrorMessage(body));
}

/** When true, {@link toastIfApiEnvelopeError} already ran for this response. */
export function isApiHttp2xxErrorEnvelope(res: {
    error?: boolean;
    status?: number;
}): boolean {
    return (
        res.error === true &&
        typeof res.status === 'number' &&
        res.status >= 200 &&
        res.status < 300
    );
}
