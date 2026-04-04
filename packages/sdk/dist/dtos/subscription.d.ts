import Business from "@/dtos/business.dto";
import Plan, { IPlanTrial } from "@/dtos/plan.dto";
import Talent from "@/dtos/talent.dto";
import Transaction from "@/dtos/transaction.dto";
interface Subscription {
    code: string;
    status: string;
    billing: IBilling;
    card: IDebitCard;
    slug: string;
    currency: string;
    trial: IPlanTrial;
    talent: Talent | any;
    business: Business | any;
    plan: Plan | any;
    transactions: Array<Transaction | any>;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;
}
export interface IBilling {
    retries: number;
    startAt: any;
    paidAt: any;
    dueAt: any;
    graceAt: any;
    amount: number;
    frequency: string;
    isPaid: boolean;
}
export interface IDebitCard {
    authCode: string;
    cardBin: string;
    cardLast: string;
    expiryMonth: string;
    expiryYear: string;
    cardPan: string;
}
export default Subscription;
//# sourceMappingURL=subscription.d.ts.map