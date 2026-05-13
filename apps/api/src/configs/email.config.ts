import { EmailService, ENVType } from '@/types/common.enum';
import { EmailConfig } from '@/interfaces/common.interface';

export function getEmailConfig(): EmailConfig {
    const env = process.env.NODE_ENV;

    const zeptoConfig = {
        zeptoMailUrl: process.env.ZEPTO_MAIL_URL as string,
        zeptoApiKey: process.env.ZEPTO_API_KEY as string,
    };

    if (env === ENVType.PRODUCTION) {
        return {
            service: EmailService.MAILSEND,
            fromEmail: process.env.EMAIL_FROM_EMAIL as string,
            fromName: process.env.EMAIL_FROM_NAME as string,
            replyTo: process.env.EMAIL_REPLY_TO as string,
            apiKey: process.env.MAILSEND_API_KEY as string,
            templateId: process.env.MAILSEND_TEMPLATE_ID as string,
            sendingDomain: process.env.EMAIL_DOMAIN as string,
            clientUrl: process.env.CLIENT_APP_URL as string,
            isTestMode: false,
            ...zeptoConfig,
        };
    }

    if (env === ENVType.STAGING) {
        return {
            service: EmailService.MAILSEND,
            fromEmail: process.env.EMAIL_FROM_EMAIL as string,
            fromName: process.env.EMAIL_FROM_NAME as string,
            replyTo: process.env.EMAIL_REPLY_TO as string,
            apiKey: process.env.MAILERSEND_API_KEY as string,
            templateId: process.env.MAILSEND_TEMPLATE_ID as string,
            sendingDomain: process.env.EMAIL_DOMAIN as string,
            clientUrl: process.env.CLIENT_STAGING_URL as string,
            isTestMode: false,
            ...zeptoConfig,
        };
    }

    if (env === ENVType.DEVELOPMENT) {
        return {
            service: EmailService.MAILSEND,
            fromEmail: process.env.EMAIL_FROM_EMAIL as string,
            fromName: process.env.EMAIL_FROM_NAME as string,
            replyTo: process.env.EMAIL_REPLY_TO as string,
            apiKey: process.env.MAILERSEND_STAGING_API_KEY as string,
            templateId: process.env.MAILSEND_TEMPLATE_ID as string,
            sendingDomain: process.env.EMAIL_DOMAIN as string,
            clientUrl: process.env.CLIENT_LOCAL_URL as string,
            isTestMode: true,
            ...zeptoConfig,
        };
    }

    throw new Error('Invalid NODE_ENV. Email config not set.');
}

export const EMAIL_CONFIG = getEmailConfig();
