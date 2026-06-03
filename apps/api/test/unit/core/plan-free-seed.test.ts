import { describe, it, expect } from '@jest/globals';
import Plan from '@/models/plan.model';
import { buildFreePlanSeedDocument } from '@/configs/seeds/plan.seed';
import {
    FREE_PLAN_CODE,
    FREE_PLAN_PAYSTACK_CODES,
    paystackCodesNeedRepair,
} from '@/utils/helpers.util';

describe('free plan seed payload', () => {
    it('uses non-empty paystackPlanCodes (Mongoose 8 required strings)', () => {
        expect(paystackCodesNeedRepair(FREE_PLAN_PAYSTACK_CODES)).toBe(false);
        expect(paystackCodesNeedRepair({
            nairaMonthly: '',
            nairaYearly: '',
            dollarMonthly: '',
            dollarYearly: '',
        })).toBe(true);
    });

    it('buildFreePlanSeedDocument validates against Plan schema', () => {
        const doc = new Plan(buildFreePlanSeedDocument());
        const err = doc.validateSync();
        expect(err).toBeUndefined();
        expect(doc.code).toBe(FREE_PLAN_CODE);
    });
});
