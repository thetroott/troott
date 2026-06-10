export type DownloadPlatformId = 'ios' | 'android' | 'web' | 'desktop';

export type DesktopDownloadTile = {
    title: string;
    subtitle: string;
    package: 'dmg' | 'exe';
};
