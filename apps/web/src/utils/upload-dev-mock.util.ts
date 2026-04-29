/**
 * Sermon file upload is mocked in Vite dev so upload wizard UI can be built
 * before the API is available. Set `VITE_USE_REAL_API_UPLOAD=true` to call the real endpoint.
 */
export function shouldMockSermonUpload(): boolean {
    return (
        import.meta.env.DEV &&
        import.meta.env.VITE_USE_REAL_API_UPLOAD !== 'true'
    );
}
