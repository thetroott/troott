import Business  from "@/dtos/business.dto";
import Subscription, { IDebitCard } from "@/dtos/subscription";
import Talent from "@/dtos/talent.dto";

interface Transaction {
    code: string,
    type: string,
    label: string,
    resource: string,
    reference: string,
    currency: string,
    providerRef: string,
    providerName: string,
    description: string,
    narration: string,
    amount: number,
    unitAmount: number,
    fee: number,
    unitFee: number,
    status: string,
    reason: string,
    message: string,
    providerData: any,
    metadata: Array<any>
    channel: string,
    slug: string,
    card: IDebitCard,
    policed: number

    // relationships
    talent: Talent | any;
    business: Business | any;
    subscription: Subscription | any;

    // time stamps
    completedAt: string;
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;

}

export default Transaction;