import type { Metadata } from 'next';

import { PreviewPage } from '@/components/containers/preview/PreviewPage';

export const metadata: Metadata = {
    title: 'Section preview | Troott',
    description: 'Internal preview of all marketing sections.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function PreviewRoutePage() {
    return <PreviewPage />;
}
