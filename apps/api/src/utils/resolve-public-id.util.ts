import mongoose from 'mongoose';

/**
 * True only for canonical 24-hex MongoDB ObjectId strings (not arbitrary 12-char codes).
 */
export function isMongoObjectId(value: string): boolean {
    const s = value.trim();
    return (
        mongoose.Types.ObjectId.isValid(s) &&
        new mongoose.Types.ObjectId(s).toString() === s
    );
}

export function mongoIdFromDoc(doc: unknown): string {
    if (doc == null) return '';
    const d = doc as { _id?: unknown; id?: unknown };
    if (d._id != null) return String(d._id);
    if (d.id != null) return String(d.id);
    return '';
}
