import Plan, { IPlanTrial } from "./Plan.model";
import Talent from "./Listener.model";
import Transaction from "./Transaction.model";

interface Subscription {

    code: string,
    status: string,
    billing: IBilling,
    card: IDebitCard,
    slug: string,
    currency: string,
    trial: IPlanTrial,

    // relationships
    talent: Talent | any,
    plan: Plan | any,
    transactions: Array<Transaction | any>,

    // time stamps
    createdAt: string;
    updatedAt: string;
    _version: number;
    _id: string;
    id: string;

}

export interface IBilling {
    retries: number,
    startAt: any,
    paidAt: any,
    dueAt: any,
    graceAt: any,
    amount: number,
    frequency: string,
    isPaid: boolean
}

export interface IDebitCard {
    authCode: string,
    cardBin: string,
    cardLast: string,
    expiryMonth: string,
    expiryYear: string,
    cardPan: string
}


// entitlements: {
//     canPlayAds: boolean;
//     canDownload: boolean;
//     maxBitrate: number;
//     audioQuality: MediaQuality;
//     skipAds: boolean;
//     //subscriptionStatus: SubscriptionStatus;
//    // subscriptionType: SubscriptionType;
// }

export default Subscription;