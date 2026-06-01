import type { IPlanPaystackCode } from '@/interfaces/plan.interface';

/** Stable code for the seeded listener free tier plan. */
export const FREE_PLAN_CODE = 'plan-free-listener';

const DEFAULT_FREE_PLAN_PAYSTACK_CODES: IPlanPaystackCode = {
    nairaMonthly: 'troott_free_ngn_monthly',
    nairaYearly: 'troott_free_ngn_yearly',
    dollarMonthly: 'troott_free_usd_monthly',
    dollarYearly: 'troott_free_usd_yearly',
};

function envOrDefault(envKey: string, fallback: string): string {
    const value = process.env[envKey]?.trim();
    return value && value.length > 0 ? value : fallback;
}

/** Non-empty Paystack plan codes for $0 plans (sentinels; no Paystack API calls). */
export function getFreePlanPaystackCodes(): IPlanPaystackCode {
    return {
        nairaMonthly: envOrDefault(
            'SEED_FREE_PLAN_PAYSTACK_NGN_MONTHLY',
            DEFAULT_FREE_PLAN_PAYSTACK_CODES.nairaMonthly,
        ),
        nairaYearly: envOrDefault(
            'SEED_FREE_PLAN_PAYSTACK_NGN_YEARLY',
            DEFAULT_FREE_PLAN_PAYSTACK_CODES.nairaYearly,
        ),
        dollarMonthly: envOrDefault(
            'SEED_FREE_PLAN_PAYSTACK_USD_MONTHLY',
            DEFAULT_FREE_PLAN_PAYSTACK_CODES.dollarMonthly,
        ),
        dollarYearly: envOrDefault(
            'SEED_FREE_PLAN_PAYSTACK_USD_YEARLY',
            DEFAULT_FREE_PLAN_PAYSTACK_CODES.dollarYearly,
        ),
    };
}

/** Resolved at module load for seed, schema defaults, and service. */
export const FREE_PLAN_PAYSTACK_CODES: IPlanPaystackCode =
    getFreePlanPaystackCodes();

export function paystackCodesNeedRepair(
    codes: Partial<IPlanPaystackCode> | null | undefined,
): boolean {
    if (!codes) {
        return true;
    }
    const keys: Array<keyof IPlanPaystackCode> = [
        'nairaMonthly',
        'nairaYearly',
        'dollarMonthly',
        'dollarYearly',
    ];
    return keys.some((key) => !String(codes[key] ?? '').trim());
}
