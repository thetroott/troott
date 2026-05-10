/**
 * Query Keys Factory
 * 
 * Centralized query key management for TanStack Query.
 * Provides type-safe query keys for cache management.
 */

/**
 * Query keys factory for all API endpoints
 */
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    login: () => [...queryKeys.auth.all, 'login'] as const,
    register: () => [...queryKeys.auth.all, 'register'] as const,
  },
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    byEmail: (email: string) => [...queryKeys.users.all, 'email', email] as const,
  },
  // Assessments
  assessments: {
    all: ['assessments'] as const,
    lists: () => [...queryKeys.assessments.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.assessments.lists(), filters] as const,
    details: () => [...queryKeys.assessments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.assessments.details(), id] as const,
    byCategory: (category: string) => [...queryKeys.assessments.all, 'category', category] as const,
  },
  // Articles
  articles: {
    all: ['articles'] as const,
    lists: () => [...queryKeys.articles.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.articles.lists(), filters] as const,
    details: () => [...queryKeys.articles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.articles.details(), id] as const,
  },
  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
    guests: () => [...queryKeys.categories.all, 'guests'] as const,
    allCategories: () => [...queryKeys.categories.all, 'all'] as const,
  },
  // Forum
  forum: {
    all: ['forum'] as const,
    questions: {
      all: ['forum', 'questions'] as const,
      lists: () => ['forum', 'questions', 'list'] as const,
      list: (filters?: unknown) => ['forum', 'questions', 'list', filters] as const,
      details: () => ['forum', 'questions', 'detail'] as const,
      detail: (id: string) => ['forum', 'questions', 'detail', id] as const,
      byCategory: (categoryId: string) => ['forum', 'questions', 'category', categoryId] as const,
      replies: (questionId: string) => ['forum', 'questions', 'replies', questionId] as const,
    },
    replies: {
      all: ['forum', 'replies'] as const,
      lists: () => ['forum', 'replies', 'list'] as const,
      list: (filters?: unknown) => ['forum', 'replies', 'list', filters] as const,
      details: () => ['forum', 'replies', 'detail'] as const,
      detail: (id: string) => ['forum', 'replies', 'detail', id] as const,
    },
  },
  // Nudges
  nudges: {
    all: ['nudges'] as const,
    lists: () => [...queryKeys.nudges.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.nudges.lists(), filters] as const,
    details: () => [...queryKeys.nudges.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.nudges.details(), id] as const,
    byCategoryAndSection: (categoryId: string, section: string) => 
      [...queryKeys.nudges.all, 'category', categoryId, 'section', section] as const,
  },
  // Counsellors
  counsellors: {
    all: ['counsellors'] as const,
    lists: () => [...queryKeys.counsellors.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.counsellors.lists(), filters] as const,
    details: () => [...queryKeys.counsellors.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.counsellors.details(), id] as const,
    pending: () => [...queryKeys.counsellors.all, 'pending'] as const,
  },
  // Meetings
  meetings: {
    all: ['meetings'] as const,
    lists: () => [...queryKeys.meetings.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.meetings.lists(), filters] as const,
    details: () => [...queryKeys.meetings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.meetings.details(), id] as const,
    byCounsellor: (counsellorId: string) => [...queryKeys.meetings.all, 'counsellor', counsellorId] as const,
    upcoming: (counsellorId: string) => [...queryKeys.meetings.all, 'upcoming', counsellorId] as const,
  },
} as const;

