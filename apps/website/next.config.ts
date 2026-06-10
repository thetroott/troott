import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
    output: 'standalone',
    outputFileTracingRoot: path.join(process.cwd(), '../..'),
    async redirects() {
        return [
            {
                source: '/privacy',
                destination: '/legal/listener/privacy-policy',
                permanent: true,
            },
            {
                source: '/terms',
                destination: '/legal/listener/terms-of-use',
                permanent: true,
            },
            {
                source: '/listeners',
                destination: '/listener',
                permanent: true,
            },
            {
                source: '/ministers',
                destination: '/minister',
                permanent: true,
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/photo-1633332755192-727a05c4013d',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/photo-1580489944761-15a19d654956',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/photo-1544005313-94ddf0286df2',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/photo-1506794778202-cad84cf45f1d',
            },
        ],
    },
};

export default nextConfig;
