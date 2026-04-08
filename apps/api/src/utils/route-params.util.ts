/**
 * Express may type `req.params` values as `string | string[] | undefined`.
 * Normalizes to a single string for repository calls.
 */
export function pathParam(
    value: string | string[] | undefined,
): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    return Array.isArray(value) ? value[0] : value;
}
