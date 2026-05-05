/**
 * Build Apple-style multivariant HLS master playlist for audio-only streams.
 * Bandwidth is nominal AAC bitrate in bits per second ( conservative vs TS mux overhead).
 */
export function buildHlsMasterPlaylist(
    variants: Array<{ name: string; bitrateKbps: number }>,
): string {
    const lines = ['#EXTM3U', '#EXT-X-VERSION:3'];
    for (const v of variants) {
        const bw = Math.round(v.bitrateKbps * 1000);
        lines.push(
            `#EXT-X-STREAM-INF:BANDWIDTH=${bw},NAME=${v.name}`,
            `${v.name}/playlist.m3u8`,
        );
    }
    return `${lines.join('\n')}\n`;
}
