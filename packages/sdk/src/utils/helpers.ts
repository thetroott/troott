// urls.ts

function getAppUrl(): string {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_URL) {
      return (import.meta as any).env.VITE_APP_URL;
    }
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }
    throw new Error('App URL not defined in environment');
  }
  
  /**
   * Returns the registration callback URL dynamically
   */
  export function getRegCallbackUrl(): string {
    return `${getAppUrl()}/verify`;
  }
  
  /**
   * Returns the subscription callback URL dynamically
   */
  export function getSubCallbackUrl(): string {
    return `${getAppUrl()}/dashboard/account/billing`;
  }
  