/**
 * Permission string matching (entity:action wildcards).
 * Contextual workspace / project / hackathon RBAC was removed for the sermon-streaming product.
 */
export function matchPermission(
    requested: string,
    perms: Set<string> | string[],
): boolean {
    const permSet =
        perms instanceof Set
            ? perms
            : new Set(perms.map((p) => p.toLowerCase()));
    const r = requested.toLowerCase();

    if (permSet.has('*:*')) return true;
    if (permSet.has(r)) return true;

    const [entity, action] = r.split(':');
    if (entity && permSet.has(`${entity}:*`)) return true;
    if (action && permSet.has(`*:${action}`)) return true;

    return false;
}
