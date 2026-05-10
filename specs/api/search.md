function buildSearchText(sermon: any): string {
    const ministerNames = (sermon.minister || [])
        .map((m: any) => m.name)
        .join(' ');

    const tags = (sermon.tags || []).join(' ');

    const scriptureReferences = (sermon.scriptureReferences || []).join(' ');

    return [
        sermon.title,
        sermon.description,
        ministerNames,
        sermon.topic?.name,
        tags,
        scriptureReferences,
        sermon.series?.title,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

// Search and Discovery
preachedAt: string; // When the sermon was originally preached
preachedYear: number; // The year the sermon was originally preached
shareableUrl: string;

/**
 * Precomputed full-text search field used for fast searching.
 *
 * This field combines the most important searchable content into a
 * single indexed string instead of querying multiple fields individually.
 *
 * Included fields:
 * - title
 * - description
 * - minister.name
 * - topic.name
 * - tags
 * - scriptureReferences
 * - series.title
 *
 * Example value:
 * "The Power of Faith How faith moves mountains Bishop David Oyedepo Faith
 * belief miracles Hebrews 11:1 Mark 11:23 Winning Faith"
 *
 * Typical usage:
 * - MongoDB text index
 * - PostgreSQL full-text search
 * - Elasticsearch/OpenSearch document field
 *
 * This field should be automatically regenerated whenever any of the
 * source fields change.
 */
searchText: string;