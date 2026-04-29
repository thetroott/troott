import User from './user.model';

/** Admin or super-admin (staff) — used when elevating access beyond self-only routes. */
export async function userIsStaff(userId: string): Promise<boolean> {
    const u = await User.findById(userId).select('isAdmin isSuper').lean();
    if (!u) {
        return false;
    }
    const doc = u as { isAdmin?: boolean; isSuper?: boolean };
    return !!(doc.isAdmin || doc.isSuper);
}
