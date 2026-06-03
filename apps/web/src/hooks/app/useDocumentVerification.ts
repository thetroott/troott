import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    FileText,
    IdCard,
    Image as ImageIcon,
    type LucideIcon,
} from 'lucide-react';
import api from '@/api/config';
import cookieService from '@/api/services/cookies';
import { DocumentType } from '@/dtos/minister.dto';
import type { DocumentUpload } from '@/dtos/minister.dto';
import type { IAPIResponse } from '@/api/types';
import { UserType } from '@/models/User.model';
import { normalizeUserType } from '@/utils/auth-redirect.util';
import {
    GET_STARTED_SELECTED_DOCUMENT_TYPE_KEY,
    clearDocumentVerificationLocalStorage,
} from '@/utils/get-started-local-storage.util';

export type DocumentUiType = 'nin' | 'drivers-license' | 'passport';

export type DocumentVerificationField = {
    id: string;
    label: string;
    uploadText: string;
    reuploadText: string;
    acceptedFormats: string[];
    icon: LucideIcon;
    alt: string;
    required: boolean;
};

export type DocumentVerificationConfig = {
    layout: 'single' | 'dual';
    headline: string;
    description: string;
    fields: DocumentVerificationField[];
    apiType: DocumentType;
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_BYTES = 15 * 1024 * 1024;

function isCreatorPersona(): boolean {
    const ut = normalizeUserType(cookieService.getUserType() || '');
    return ut === UserType.CREATOR.toLowerCase();
}

export function normalizeDocumentUiType(
    raw: string | null | undefined,
): DocumentUiType {
    const v = (raw ?? '').trim().toLowerCase();
    if (v === 'nin' || v === 'national_identity_number') {
        return 'nin';
    }
    if (
        v === 'drivers-license' ||
        v === 'drivers_license' ||
        v === 'driver-license' ||
        v === 'driver_license'
    ) {
        return 'drivers-license';
    }
    if (
        v === 'passport' ||
        v === 'international_passport' ||
        v === 'international-passport' ||
        v === 'passport-file'
    ) {
        return 'passport';
    }
    return 'nin';
}

export function readSelectedDocumentUiType(): DocumentUiType {
    try {
        const raw = localStorage.getItem(
            GET_STARTED_SELECTED_DOCUMENT_TYPE_KEY,
        );
        if (raw?.trim()) {
            return normalizeDocumentUiType(raw);
        }
    } catch {
        /* ignore */
    }
    return 'nin';
}

export function formatAcceptHint(acceptedFormats: string[]): string {
    const parts = acceptedFormats.map((f) => {
        if (f === 'application/pdf') {
            return 'PDF';
        }
        const ext = f.split('/')?.[1];
        return ext ? ext.toUpperCase() : f;
    });
    return `${parts.join(' or ')} only`;
}

function buildConfig(uiType: DocumentUiType): DocumentVerificationConfig {
    if (uiType === 'drivers-license') {
        return {
            layout: 'dual',
            headline: 'Upload your driver\u2019s license',
            description:
                'Make sure your photos aren\u2019t blurry and the front of your driver\u2019s license clearly shows your face.',
            apiType: DocumentType.DRIVERS,
            fields: [
                {
                    id: 'front',
                    label: 'Upload Front',
                    uploadText: 'Upload front',
                    reuploadText: 'Re-upload front',
                    acceptedFormats: ['image/jpeg', 'image/png'],
                    icon: IdCard,
                    alt: 'Front of driver license',
                    required: true,
                },
                {
                    id: 'back',
                    label: 'Upload back',
                    uploadText: 'Upload back',
                    reuploadText: 'Re-upload back',
                    acceptedFormats: ['image/jpeg', 'image/png'],
                    icon: ImageIcon,
                    alt: 'Back of driver license',
                    required: true,
                },
            ],
        };
    }

    if (uiType === 'passport') {
        return {
            layout: 'single',
            headline: 'Upload an image of your passport',
            description:
                'Make sure the photo of your passport isn\u2019t blurry and that it clearly shows your face.',
            apiType: DocumentType.PASSPORT,
            fields: [
                {
                    id: 'passport_page',
                    label: 'Upload International Passport Page',
                    uploadText: 'Upload passport',
                    reuploadText: 'Re-upload',
                    acceptedFormats: [
                        'image/jpeg',
                        'image/png',
                        'application/pdf',
                    ],
                    icon: FileText,
                    alt: 'International passport photo page',
                    required: true,
                },
            ],
        };
    }

    return {
        layout: 'single',
        headline: 'Upload an image of your NIN',
        description:
            'Make sure the photo of your NIN isn\u2019t blurry and that it clearly shows your face and NIN number.',
        apiType: DocumentType.NIN,
        fields: [
            {
                id: 'nin_page',
                label: 'Upload NIN',
                uploadText: 'Upload NIN',
                reuploadText: 'Re-upload',
                acceptedFormats: ['image/jpeg', 'image/png'],
                icon: IdCard,
                alt: 'National identity card',
                required: true,
            },
        ],
    };
}

function parseStorageUploadEnvelope(data: unknown): string | null {
    if (!data || typeof data !== 'object') {
        return null;
    }
    const envelope = data as { data?: unknown; error?: boolean };
    if (envelope.error) {
        return null;
    }
    const inner =
        envelope.data && typeof envelope.data === 'object'
            ? envelope.data
            : data;
    if (!inner || typeof inner !== 'object') {
        return null;
    }
    const dto = inner as { file?: string; s3Key?: string };
    return dto.file?.trim() || null;
}

async function uploadFileToUrl(file: File): Promise<string> {
    const isPdf = file.type === 'application/pdf';
    const max = isPdf ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
    if (file.size > max) {
        throw new Error(
            isPdf
                ? 'PDF must be 15MB or smaller.'
                : 'Image must be 10MB or smaller.',
        );
    }

    const res = await api.storage.uploadImage(file);
    const url = parseStorageUploadEnvelope(res.data);
    if (!url) {
        throw new Error('Upload failed');
    }
    return url;
}

function mapUrlsToDocument(
    uiType: DocumentUiType,
    urls: Record<string, string>,
): DocumentUpload {
    if (uiType === 'drivers-license') {
        return {
            type: DocumentType.DRIVERS,
            frontPage: urls.front ?? '',
            backPage: urls.back ?? '',
        };
    }
    if (uiType === 'passport') {
        return {
            type: DocumentType.PASSPORT,
            frontPage: urls.passport_page ?? '',
        };
    }
    return {
        type: DocumentType.NIN,
        frontPage: urls.nin_page ?? '',
    };
}

export function useDocumentVerificationConfig():
    | DocumentVerificationConfig
    | null {
    const uiType = readSelectedDocumentUiType();
    return useMemo(() => buildConfig(uiType), [uiType]);
}

/** feat-0015: minister/creator `onboarding.step` from profile API. */
export async function readServerOnboardingStep(): Promise<number> {
    const res: IAPIResponse = isCreatorPersona()
        ? await api.creator.getCreator()
        : await api.minister.getMinister();
    if (res.error || !res.data) {
        return 0;
    }
    const raw = res.data as
        | { onboarding?: { step?: number }; minister?: { onboarding?: { step?: number } } }
        | { onboarding?: { step?: number } };
    const step =
        ('minister' in raw && raw.minister?.onboarding?.step != null
            ? raw.minister.onboarding.step
            : raw.onboarding?.step) ?? 0;
    return typeof step === 'number' && !Number.isNaN(step) ? step : 0;
}

/**
 * feat-0015: `POST …/onboarding/document-complete` + clear document localStorage.
 * Idempotent when server step is already ≥ 2.
 */
export async function completeDocumentOnboardingMilestone(): Promise<unknown> {
    const milestone: IAPIResponse = isCreatorPersona()
        ? await api.creator.onboardingDocumentComplete({})
        : await api.minister.onboardingDocumentComplete({});

    if (milestone.error) {
        throw new Error(
            milestone.message ||
                'Documents uploaded but onboarding step could not be saved. Contact support if this persists.',
        );
    }

    clearDocumentVerificationLocalStorage();
    return milestone.data;
}

export function useSubmitDocumentVerificationMutation() {
    return useMutation({
        mutationFn: async (files: Record<string, File>) => {
            const uiType = readSelectedDocumentUiType();
            const config = buildConfig(uiType);
            const urls: Record<string, string> = {};

            for (const field of config.fields) {
                const file = files[field.id];
                if (!file && field.required) {
                    throw new Error(`Upload ${field.uploadText.toLowerCase()}.`);
                }
                if (file) {
                    urls[field.id] = await uploadFileToUrl(file);
                }
            }

            const document = mapUrlsToDocument(uiType, urls);
            const res: IAPIResponse = isCreatorPersona()
                ? await api.creator.submitVerification({ document })
                : await api.minister.submitVerification({ document });

            if (res.error) {
                throw new Error(
                    res.message || 'Could not submit verification',
                );
            }

            const data = await completeDocumentOnboardingMilestone();
            return data;
        },
    });
}
