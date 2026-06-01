import Plan from '../../models/plan.model';
import { PlanType } from '../../interfaces/plan.interface';
import {
    FREE_PLAN_CODE,
    FREE_PLAN_PAYSTACK_CODES,
    paystackCodesNeedRepair,
} from '@/constants/plan.constants';
import logger from '../../utils/logger.util';

export function buildFreePlanSeedDocument() {
    return {
        code: FREE_PLAN_CODE,
        slug: 'free-listener',
        label: 'Free',
        name: 'Free',
        displayName: 'Free Plan',
        planType: PlanType.FOR_LISTENER,
        isEnabled: true,
        description: 'Free tier with unlimited ad-supported streaming.',
        trial: { days: 0, enabled: false },
        pricing: {
            naira: { monthly: 0, yearly: 0 },
            dollar: { monthly: 0, yearly: 0 },
        },
        sermon: { limit: -1, frequency: 'monthly' },
        sermonBite: { limit: -1, frequency: 'monthly' },
        paystackPlanCodes: { ...FREE_PLAN_PAYSTACK_CODES },
    };
}

const FREE_PLAN = buildFreePlanSeedDocument();

const seedPlans = async (): Promise<void> => {
    const existing = await Plan.findOne({ code: FREE_PLAN_CODE });

    if (existing) {
        if (paystackCodesNeedRepair(existing.paystackPlanCodes)) {
            await Plan.findOneAndUpdate(
                { code: FREE_PLAN_CODE },
                { $set: { paystackPlanCodes: { ...FREE_PLAN_PAYSTACK_CODES } } },
            );
            logger.log({
                type: 'success',
                data: 'Free plan paystackPlanCodes repaired.',
            });
            return;
        }

        logger.log({
            type: 'info',
            data: 'Free plan already exists, skipping seed.',
        });
        return;
    }

    await Plan.create(FREE_PLAN);
    logger.log({
        type: 'success',
        data: 'Free plan seeded successfully.',
    });
};

export default seedPlans;
