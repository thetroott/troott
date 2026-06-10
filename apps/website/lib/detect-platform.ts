export type Platform = 'android' | 'ios' | 'macos' | 'windows' | 'unknown';

export function detectPlatform(ua: string, maxTouchPoints = 0): Platform {
    if (/Android/i.test(ua)) return 'android';
    if (/iPhone|iPod/i.test(ua)) return 'ios';
    if (/iPad/i.test(ua) || (maxTouchPoints > 1 && /Macintosh/i.test(ua))) {
        return 'ios';
    }
    if (/Windows/i.test(ua)) return 'windows';
    if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
    return 'unknown';
}
