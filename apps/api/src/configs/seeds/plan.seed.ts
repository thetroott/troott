import Plan from '../../models/plan.model';
import { PlanType } from '../../interfaces/plan.interface';
import logger from '../../utils/logger.util';

const FREE_PLAN = {
    code: 'plan-free-listener',
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
    paystackPlanCodes: {
        nairaMonthly: '',
        nairaYearly: '',
        dollarMonthly: '',
        dollarYearly: '',
    },
};

const seedPlans = async (): Promise<void> => {
    try {
        const existing = await Plan.findOne({ code: FREE_PLAN.code });
        if (existing) {
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
    } catch (error: any) {
        logger.log({
            type: 'error',
            data: `Failed to seed free plan: ${error.message}`,
        });
    }
};

export default seedPlans;
