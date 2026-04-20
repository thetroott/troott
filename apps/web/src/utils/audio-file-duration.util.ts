/**
 * Reads duration from the browser’s media decoder (seconds, floored).
 * Returns `undefined` if metadata is unavailable.
 */
export function probeAudioFileDurationSec(
    file: File,
): Promise<number | undefined> {
    const t = file.type || '';
    if (!t.startsWith('audio/') && !t.startsWith('video/')) {
        return Promise.resolve(undefined);
    }
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const audio = document.createElement('audio');
        const finish = (sec: number | undefined) => {
            URL.revokeObjectURL(url);
            audio.removeAttribute('src');
            resolve(sec);
        };
        audio.preload = 'metadata';
        audio.addEventListener(
            'loadedmetadata',
            () => {
                const d = audio.duration;
                if (Number.isFinite(d) && d > 0 && d !== Number.POSITIVE_INFINITY) {
                    finish(Math.floor(d));
                } else {
                    finish(undefined);
                }
            },
            { once: true },
        );
        audio.addEventListener('error', () => finish(undefined), { once: true });
        audio.src = url;
    });
}
