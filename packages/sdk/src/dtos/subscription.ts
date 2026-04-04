import Plan, { IPlanTrial } from '@/dtos/plan.dto';
import Transaction from '@/dtos/transaction.dto';
import Sermon from './sermon.dto';

interface Subscription {
    code: string;
    status: string;
    billing: IBilling;
    card: IDebitCard;
    slug: string;
    currency: string;
    trial: IPlanTrial;

    // relationships
    sermon: Sermon | any;
    plan: Plan | any;
    transactions: Array<Transaction | any>;

    // time stamps
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
