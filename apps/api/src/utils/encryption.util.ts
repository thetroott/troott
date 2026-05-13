import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const VERSION_PREFIX = 'v1.';

function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    return crypto.createHash('sha256').update(key).digest();
}

export const encrypt = (text: string): string => {
    if (!text) return '';

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    const payload = Buffer.concat([iv, encrypted, authTag]);
    return `${VERSION_PREFIX}${payload.toString('base64')}`;
};

export const decrypt = (text: string): string => {
    if (!text) return '';

    let raw = text;
    if (raw.startsWith(VERSION_PREFIX)) {
        raw = raw.slice(VERSION_PREFIX.length);
    }

    const key = getEncryptionKey();
    const data = Buffer.from(raw, 'base64');

    if (data.length < IV_LENGTH + TAG_LENGTH) {
        throw new Error('Ciphertext too short');
    }

    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(data.length - TAG_LENGTH);
    const encrypted = data.subarray(IV_LENGTH, data.length - TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);
    return decrypted.toString('utf8');
};

export const hash = (value: string): string => {
    if (!value) return '';
    return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
};
