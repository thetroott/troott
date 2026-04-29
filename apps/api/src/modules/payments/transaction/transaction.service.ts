import { IResult } from '@/modules/shared/interfaces.util';
import { initializePayment } from '../paystack/paystack.service';
import { NewTransactionDTO, SubscriptionDTO } from './transaction.dto';

/**
 * Responsible for handling transactions. Paystack-based
 * This service manages: transaction lifecycle, transaction initialization, verification of completed payments, webhook reconciliation
 */
class TransactionService {
    /**
     * @name initializeTransaction
     * @describtion Create a local transaction and initialize it with paystack
     * @param {SubscriptionDTO} - payload
     * @returns {Promise<IResult>}
     *
     */
    public async initializeTransaction(dto: SubscriptionDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const { email, amount, planCode, currency } = dto;

        //if amount is provided initialize with amount
        const response = await initializePayment({
            email: 'harrydunnie@gmail.com',
            amount: '500000000',
        });

        return result;
    }

    /**
     * @name verifyTransaction
     * @description verify a transaction with paystack after redirect or callback.
     * @param reference Paystack transaction reference
     * @returns
     */
    public verifyTransaction(reference: string) {}

    /**
     * @name handleWebhook
     * @description Handle paystack webhook events. This is the final authority for transaction success or failure. Must be idempotent and signature-verified.
     * Expected events:
     * - charge.success
     * - charge.failed
     * @param payload - Raw webhook payload
     * @returns {Promise<void>}
     */
    public handleWebhook() {}

    /**
     * @name markTransactionSuccessful
     * @description Mark a transaction as successful. Called only after Paystack verification or webhook confirmation.
     * @param {string} reference - Paystack reference.
     * @param {Object} providerData - Full Paystack response.
     *
     * @returns {Promise<Object>} Updated transaction.
     */
    private async markTransactionSuccessful(
        reference: string,
        providerData: object,
    ) {}

    /**
     *@name markTransactionFailed
     *@description Mark a transaction as failed. Must be safe to call multiple times.
     * @param {string} reference - Paystack reference.
     * @param {string} reason - Failure reason.
     *
     * @returns {Promise<Object>} Failed transaction.
     */
    async markTransactionFailed(reference: string, reason: string) {}

    /**
     * Retrieve a transaction by Paystack reference.
     *
     * @param {string} reference
     *
     * @returns {Promise<Object|null>} Transaction or null.
     */
    async getTransactionByReference(reference: string) {}
}

export default new TransactionService();

/**
 * REMINDERS
 *Design rules you must not violate (Paystack-specific)

1.Never mark success on redirect
Redirect ≠ payment
Verification or webhook only

2. Webhooks win
If verification says success but webhook later contradicts → webhook wins

3. Amount & currency must match
If Paystack returns a different amount → flag fraud, fail transaction

4. Idempotency
Webhooks will retry
Verification will be called twice

VerifyTransaction
must compare amount currency reference status
 */

//pnpm tsx watch ./src/modules/transaction/transaction.service.ts
