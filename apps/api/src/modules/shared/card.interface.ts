/** Card payload types shared across payments and profiles. */
export interface IDebitCard {
    authCode: string;
    cardBin: string;
    cardLast: string;
    expiryMonth: string;
    expiryYear: string;
    cardPan: string;
    token: string;
    provider: string;
}
