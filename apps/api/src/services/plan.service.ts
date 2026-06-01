import slugify from 'slugify';
import { Random } from '@btffamily/pacitude';
import { IResult } from '@/interfaces/common.interface';
import {
    AllowedPlanUpdateField,
    CreatePlanDTO,
    PlanAvailabilityDTO,
    UpdatePlanDTO,
} from '@/dtos/plan.dto';
import {
    IPlanFilterOptions,
    IPlanPaystackCode,
    IPlanPricing,
    PlanInterval,
    PlanPriceCurrency,
    PlanType,
} from '@/interfaces/plan.interface';
import {
    paystackCreatePlan,
    paystackPlanUpdate,
} from '@/services/paystack.service';
import planRepository from '@/repository/plan.repository';
import { FREE_PLAN_PAYSTACK_CODES } from '@/constants/plan.constants';

class PlanService {
    constructor() {}

    /** All prices zero in minor units: no Paystack subscription plans required. */
    private isFreePricing(pricing: IPlanPricing): boolean {
        return (
            pricing.naira.monthly === 0 &&
            pricing.naira.yearly === 0 &&
            pricing.dollar.monthly === 0 &&
            pricing.dollar.yearly === 0
        );
    }

    /**
     * @name createNewPlan
     * @description creates a new plan on platform for businesses or talents also creates plan on paystack
     * @param {CreatePlanDTO}
     * @returns {Promise<IResult>} A result object indicating success or failure with an appropriate message.
     *
     */
    public async createNewPlan(dto: CreatePlanDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const {
            label,
            name,
            displayName,
            description,
            trial,
            pricing,
            sermon,
            sermonBite,
            planType,
        } = dto;

        const slug = slugify(name, { lower: true, strict: true });

        const code = `PLN-${new Date().getFullYear()}-${Random.randomNum(8)}`;

        const planPriceAmount = this.planPriceToAmount(pricing);

        // build plan object
        const planObj = {
            code,
            label,
            planType,
            name,
            displayName,
            description,
            trial,
            pricing: planPriceAmount,
            sermon,
            sermonBite,
            slug,
        };

        // save plan to db
        const { error, data: newPlan } =
            await planRepository.addNewPlan(planObj);
        if (error || !newPlan) {
            result.error = true;
            result.message = 'Failed to create plan';
            result.code = 500;
            return result;
        }

        // save plan to paystack
        const paystackPlanCodes = await this.getPaystackPlanCodes(
            newPlan.code,
            newPlan.description || '',
            newPlan.pricing,
        );
        // save plan to paystack FOR TESTING
        // const paystackPlanCodes = await this.getPaystackPlanCodes(
        //     planObj.code,
        //     planObj.description || '',
        //     planObj.pricing,
        // );

        // map paystack response to plan model updating the plan record with paystack plan code
        newPlan.paystackPlanCodes = paystackPlanCodes;

        // update plan with paystack codes
        const updatePaystackCodeResult = await planRepository.updatePlan(
            newPlan._id,
            {
                paystackPlanCodes,
            },
        );

        result.data = newPlan; // return plan without paystack codes for now
        result.message = 'Plan created successfully';
        return result;
    }

    /**
     * @name updatePlan
     * @description updates an existing plan on the platform and on paystack
     * @param {UpdatePlanDTO} dto
     * @returns {Promise<IResult>} A result object indicating success or failure with an appropriate message.
     */
    public async updatePlan(dto: UpdatePlanDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const { planId, updates } = dto;

        // update pricing if exists
        const { pricing } = updates;
        if (pricing) {
            const planPriceAmount = this.planPriceToAmount(pricing);

            updates.pricing = planPriceAmount;
        }

        const { error: dbUpdateError, data: updatedPlan } =
            await planRepository.updatePlan(planId, updates);

        if (dbUpdateError || !updatedPlan) {
            result.error = true;
            result.message = 'Failed to update plan';
            result.code = 500;
            return result;
        }

        // Update plan on Paystack using updated plan from DB
        const paystackPlanUpdate = await this.updatePaystackPlan(
            updatedPlan.code,
            updatedPlan.description,
            updatedPlan.pricing,
            updatedPlan.paystackPlanCodes,
        );

        // update plan with new paystack codes if any
        const { error, data: updatedPlanWithPaystack } =
            await planRepository.updatePlan(planId, {
                paystackPlanCodes: paystackPlanUpdate,
            });

        if (error || !updatedPlanWithPaystack) {
            result.error = true;
            result.message = 'Failed to update plan with Paystack codes';
            result.code = 500;
            return result;
        }

        result.data = updatedPlan;
        result.message = 'Plan updated successfully';
        return result;
    }

    /**
     * @name getAllPlans
     * @description retrieves all plans from the platform
     * @param {IPlanFilterOptions} filterOptions
     * @returns {Promise<IResult>} A result object indicating success or failure with an appropriate message.
     */
    public async getAllPlans(
        filterOptions: IPlanFilterOptions,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const { error, data: plans } =
            await planRepository.getPlans(filterOptions);
        if (error || !plans) {
            result.error = true;
            result.message = 'Failed to retrieve plans';
            result.code = 500;
            return result;
        }

        result.data = plans;
        result.message = 'Plans retrieved successfully';
        return result;
    }

    /**
     * @name planPriceToAmount
     * @description helper function to convert plan pricing to minor units (e.g., kobo, cents)
     * @param pricing
     * @returns
     */
    private planPriceToAmount(pricing: IPlanPricing): IPlanPricing {
        // prepare amount
        const toMinorUnit = (amount: number) => Math.round(amount * 100);

        const newPricing = {
            naira: {
                monthly: toMinorUnit(pricing.naira.monthly),
                yearly: toMinorUnit(pricing.naira.yearly),
            },
            dollar: {
                monthly: toMinorUnit(pricing.dollar.monthly),
                yearly: toMinorUnit(pricing.dollar.yearly),
            },
        };

        return newPricing;
    }

    /**
     * @name validateDto
     * @description helper function to validate CreatePlanDTO for all required fields
     * @param dto
     * @returns {Promise<IResult>} A result object indicating success or failure with an appropriate message.
     */
    public async validateDto(dto: CreatePlanDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const allowedPlanTypes = [PlanType.FOR_BUSINESS, PlanType.FOR_LISTENER];

        const errors: { field: string; message: string }[] = [];

        if (!dto.name) {
            errors.push({ field: 'name', message: 'Plan name is required' });
        }
        if (!dto.label) {
            errors.push({ field: 'label', message: 'Plan label is required' });
        }
        if (!dto.displayName) {
            errors.push({
                field: 'displayName',
                message: 'Plan display name is required',
            });
        }
        if (!dto.planType) {
            errors.push({
                field: 'planType',
                message: 'Plan type is required',
            });
        }
        if (!allowedPlanTypes.includes(dto.planType)) {
            errors.push({
                field: 'planType',
                message: `Invalid plan type. Allowed types are: ${allowedPlanTypes.join(', ')}`,
            });
        }
        if (!dto.pricing) {
            errors.push({
                field: 'pricing',
                message: 'Plan pricing is required',
            });
        }
        if (!dto.trial) {
            errors.push({
                field: 'trial',
                message: 'Plan trial information is required',
            });
        }
        if (!dto.sermon) {
            errors.push({
                field: 'sermon',
                message: 'Plan sermon limits are required',
            });
        }
        if (!dto.sermonBite) {
            errors.push({
                field: 'sermonBite',
                message: 'Plan sermon bite limits are required',
            });
        }

        if (errors.length > 0) {
            result.error = true;
            result.code = 400;
            result.message = 'DTO validation failed';
            result.data = errors;
            return result;
        }

        result.message = 'DTO is valid';
        return result;
    }

    /**
     * @name validateUpdateField
     * @description helper function to validate UpdatePlanDTO fields against allowed fields
     * @param updates
     * @returns {Promise<IResult>} A result object indicating success or failure with an appropriate message.
     */
    public async validateUpdateField(
        updates: Partial<CreatePlanDTO>,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const allowedPlanTypes = [PlanType.FOR_BUSINESS, PlanType.FOR_LISTENER];

        const allowedFields = Object.keys(AllowedPlanUpdateField);

        // check for invalid fields
        const invalidFields = Object.keys(updates).filter(
            (field) => !allowedFields.includes(field),
        );

        if (invalidFields.length > 0) {
            result.error = true;
            result.code = 400;
            result.message = 'Update fields validation failed';
            result.data = invalidFields;
            return result;
        }

        // validate planType if exists
        if (updates.planType && !allowedPlanTypes.includes(updates.planType)) {
            result.error = true;
            result.message = `Invalid plan type. Allowed types are: ${allowedPlanTypes.join(', ')}`;
            result.code = 400;
            return result;
        }

        result.message = 'Update fields are valid';
        return result;
    }

    /**
     * @name getPaystackPlanCodes
     * @description helper function to create plans on paystack and return the plan codes
     * @param planCode System generated plan code as plan name on paystack
     * @param description
     * @param planPricing
     * @returns {Promise<IPlanPaystackCode>} paystack plan codes for all created plans
     */
    private async getPaystackPlanCodes(
        planCode: string,
        description: string,
        planPricing: IPlanPricing,
    ): Promise<IPlanPaystackCode> {
        if (this.isFreePricing(planPricing)) {
            return { ...FREE_PLAN_PAYSTACK_CODES };
        }

        const createPaystackPlan = async (
            name: string,
            amount: number,
            interval: PlanInterval,
            description: string,
            currency: PlanPriceCurrency,
        ) => {
            try {
                const res = await paystackCreatePlan({
                    name,
                    amount,
                    interval,
                    description,
                    currency,
                });
                return res?.data?.plan_code;
            } catch (error) {
                console.log(
                    `Failed to create Paystack ${currency} ${interval} plan`,
                    // error,
                );
            }
        };

        const [
            nairaMonthlyCode,
            nairaYearlyCode,
            dollarMonthlyCode,
            dollarYearlyCode,
        ] = await Promise.all([
            createPaystackPlan(
                planCode,
                planPricing.naira.monthly,
                PlanInterval.MONTHLY,
                description || '',
                PlanPriceCurrency.NAIRA,
            ),
            createPaystackPlan(
                planCode,
                planPricing.naira.yearly,
                PlanInterval.YEARLY,
                description || '',
                PlanPriceCurrency.NAIRA,
            ),
            createPaystackPlan(
                planCode,
                planPricing.dollar.monthly,
                PlanInterval.MONTHLY,
                description || '',
                PlanPriceCurrency.DOLLAR,
            ),
            createPaystackPlan(
                planCode,
                planPricing.dollar.yearly,
                PlanInterval.YEARLY,
                description || '',
                PlanPriceCurrency.DOLLAR,
            ),
        ]);

        return {
            nairaMonthly: nairaMonthlyCode || '',
            nairaYearly: nairaYearlyCode || '',
            dollarMonthly: dollarMonthlyCode || '',
            dollarYearly: dollarYearlyCode || '',
        };
    }

    /**
     * @name updatePaystackPlan
     * @description helper function to update existing plans on paystack and return the updated plan codes
     * @param planCode
     * @param description
     * @param planPricing
     * @param paystackPlanCodes
     * @returns
     */
    private async updatePaystackPlan(
        planCode: string,
        description: string,
        planPricing: IPlanPricing,
        paystackPlanCodes: IPlanPaystackCode,
    ) {
        if (this.isFreePricing(planPricing)) {
            return {
                nairaMonthly:
                    paystackPlanCodes.nairaMonthly?.trim() ||
                    FREE_PLAN_PAYSTACK_CODES.nairaMonthly,
                nairaYearly:
                    paystackPlanCodes.nairaYearly?.trim() ||
                    FREE_PLAN_PAYSTACK_CODES.nairaYearly,
                dollarMonthly:
                    paystackPlanCodes.dollarMonthly?.trim() ||
                    FREE_PLAN_PAYSTACK_CODES.dollarMonthly,
                dollarYearly:
                    paystackPlanCodes.dollarYearly?.trim() ||
                    FREE_PLAN_PAYSTACK_CODES.dollarYearly,
            };
        }

        const updatePaystack = async (
            paystackPlanCode: string,
            name: string,
            amount: number,
            interval: PlanInterval,
            description: string,
            currency: PlanPriceCurrency,
        ) => {
            const updateData = {
                name,
                amount,
                interval,
                description,
                currency,
            };

            try {
                const res = await paystackPlanUpdate(
                    paystackPlanCode,
                    updateData,
                );
                return res?.data?.plan_code;
            } catch (error) {
                console.log(
                    `Failed to update Paystack ${currency} ${interval} plan`,
                    // error,
                );
            }
        };

        const [
            nairaMonthlyCode,
            nairaYearlyCode,
            dollarMonthlyCode,
            dollarYearlyCode,
        ] = await Promise.all([
            updatePaystack(
                paystackPlanCodes.nairaMonthly,
                planCode,
                planPricing.naira.monthly,
                PlanInterval.MONTHLY,
                description || '',
                PlanPriceCurrency.NAIRA,
            ),
            updatePaystack(
                paystackPlanCodes.nairaYearly,
                planCode,
                planPricing.naira.yearly,
                PlanInterval.YEARLY,
                description || '',
                PlanPriceCurrency.NAIRA,
            ),
            updatePaystack(
                paystackPlanCodes.dollarMonthly,
                planCode,
                planPricing.dollar.monthly,
                PlanInterval.MONTHLY,
                description || '',
                PlanPriceCurrency.DOLLAR,
            ),
            updatePaystack(
                paystackPlanCodes.dollarYearly,
                planCode,
                planPricing.dollar.yearly,
                PlanInterval.YEARLY,
                description || '',
                PlanPriceCurrency.DOLLAR,
            ),
        ]);

        return {
            nairaMonthly: nairaMonthlyCode || paystackPlanCodes.nairaMonthly,
            nairaYearly: nairaYearlyCode || paystackPlanCodes.nairaYearly,
            dollarMonthly: dollarMonthlyCode || paystackPlanCodes.dollarMonthly,
            dollarYearly: dollarYearlyCode || paystackPlanCodes.dollarYearly,
        };
    }

    //validate plan for subscription
    /**
     * @name getPlanAvailability
     * @description Decides plan availibity for Subscription
     * @param planId
     * @returns {PlanAvailabilityDTO }
     */
    public async getPlanAvailability(
        planId: string,
    ): Promise<PlanAvailabilityDTO> {
        let result: PlanAvailabilityDTO = {
            isAvailable: true,
            data: null,
        };
        const { error, data: plan } = await planRepository.getPlanById(
            String(planId),
        );

        if (error || !plan) {
            result.isAvailable = false;
            return result;
        }

        if (plan.isEnabled !== true) {
            result.isAvailable = false;
            return result;
        }

        const codes = plan.paystackPlanCodes;

        if (!this.isFreePricing(plan.pricing)) {
            if (
                !codes ||
                !codes.nairaMonthly ||
                !codes.nairaYearly ||
                !codes.dollarMonthly ||
                !codes.dollarYearly
            ) {
                result.isAvailable = false;
                return result;
            }
        }

        result.data = {
            trial: plan.trial,
            paystackCodes: plan.paystackPlanCodes,
        };
        return result;
    }

    // get all active plans

    // get plan

    // disable plan

    // enable plan

    // remove paystack plan codes from plan
}
export default new PlanService();
