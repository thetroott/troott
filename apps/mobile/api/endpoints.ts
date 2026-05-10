/**
 * API Endpoints Constants
 * 
 * Centralized endpoint definitions generated from Postman collection.
 * All endpoints use the base URL from config.
 */

import { API_BASE_PATH } from './config';

/**
 * Base URL placeholder - will be replaced with actual base URL in client
 */
const BASE = API_BASE_PATH;

/**
 * Authentication endpoints
 */
export const authEndpoints = {
  login: `${BASE}/auth/login`,
  register: `${BASE}/auth/register`,
  verifyOtp: `${BASE}/auth/verify-otp`,
  resendOtp: `${BASE}/auth/resend-otp`,
  forgotPassword: `${BASE}/auth/forgot-password`,
  resetPassword: `${BASE}/auth/reset-password`,
  changePassword: `${BASE}/auth/change-password`,
  logout: `${BASE}/auth/logout`,
  sendMail: `${BASE}/auth/send-mail`, // TEST endpoint
} as const;

/**
 * User endpoints
 */
export const userEndpoints = {
  getAll: `${BASE}/users`,
  getById: (userId: string) => `${BASE}/users/${userId}`,
  getByEmail: (email: string) => `${BASE}/users/get-user-by-email/${email}`,
  updateProfile: `${BASE}/users/update-profile`,
  uploadAvatar: `${BASE}/users/upload-avatar`,
  deleteMe: `${BASE}/users/delete-me`,
} as const;

/**
 * Partner endpoints
 */
export const partnerEndpoints = {
  sendInvite: `${BASE}/users/partner/send-invite`,
  acceptInvite: `${BASE}/users/partner/accept-invite`,
  disconnect: `${BASE}/users/partner/disconnect-partner`,
  confirmPartner: `${BASE}/users/partner/confirm-partner`,
} as const;

/**
 * Assessment endpoints
 */
export const assessmentEndpoints = {
  getAll: `${BASE}/assessments`,
  getById: (assessmentId: string) => `${BASE}/assessments/${assessmentId}`,
  getByCategory: (category: string) => `${BASE}/assessments/category/${category}`,
  create: `${BASE}/assessments`,
  update: (assessmentId: string) => `${BASE}/assessments/${assessmentId}`,
  delete: (assessmentId: string) => `${BASE}/assessments/${assessmentId}`,
  generateResult: `${BASE}/assessments/generate-result`,
} as const;

/**
 * Article endpoints
 */
export const articleEndpoints = {
  getAll: `${BASE}/articles`,
  getById: (articleId: string) => `${BASE}/articles/${articleId}`,
  create: `${BASE}/articles`,
  update: (articleId: string) => `${BASE}/articles/${articleId}`,
  delete: (articleId: string) => `${BASE}/articles/${articleId}`,
} as const;

/**
 * Category endpoints
 */
export const categoryEndpoints = {
  getAll: `${BASE}/categories`,
  getGuests: `${BASE}/categories/guests`,
  getAllCategories: `${BASE}/categories/all-categories`,
  getById: (categoryId: string) => `${BASE}/categories/${categoryId}`,
  create: `${BASE}/categories`,
  update: (categoryId: string) => `${BASE}/categories/${categoryId}`,
  delete: (categoryId: string) => `${BASE}/categories/${categoryId}`,
} as const;

/**
 * Post endpoints (v1)
 */
export const postEndpoints = {
  getAll: `${BASE}/posts`,
  getCount: `${BASE}/posts/count`,
  getById: (postId: string) => `${BASE}/posts/${postId}`,
  create: `${BASE}/posts`,
  update: (postId: string) => `${BASE}/posts/${postId}`,
  delete: (postId: string) => `${BASE}/posts/${postId}`,
} as const;

/**
 * Book endpoints
 */
export const bookEndpoints = {
  getAll: `${BASE}/books`,
  getById: (bookId: string) => `${BASE}/books/${bookId}`,
  create: `${BASE}/books`,
  update: (bookId: string) => `${BASE}/books/${bookId}`,
  delete: (bookId: string) => `${BASE}/books/${bookId}`,
} as const;

/**
 * Forum endpoints
 */
export const forumEndpoints = {
  questions: {
    getAll: `${BASE}/questions`,
    getByCategory: (categoryId: string) => `${BASE}/questions/${categoryId}/questions`,
    getById: (questionId: string) => `${BASE}/questions/${questionId}`,
    create: `${BASE}/questions`,
    update: (questionId: string) => `${BASE}/questions/${questionId}`,
    delete: (questionId: string) => `${BASE}/questions/${questionId}`,
    getReplies: (questionId: string) => `${BASE}/questions/${questionId}/replies`,
    createReply: (questionId: string) => `${BASE}/questions/${questionId}/replies`,
  },
  replies: {
    getAll: `${BASE}/replies`,
    getById: (replyId: string) => `${BASE}/replies/${replyId}`,
    create: `${BASE}/replies`,
    update: (replyId: string) => `${BASE}/replies/${replyId}`,
    delete: (replyId: string) => `${BASE}/replies/${replyId}`,
  },
} as const;

/**
 * Nudge endpoints
 */
export const nudgeEndpoints = {
  getAll: `${BASE}/nudges`,
  getByCategoryAndSection: (categoryId: string, section: string) => 
    `${BASE}/nudges/${categoryId}/${section}`,
  getById: (nudgeId: string) => `${BASE}/nudges/${nudgeId}`,
  create: `${BASE}/nudges`,
  update: (nudgeId: string) => `${BASE}/nudges/${nudgeId}`,
  delete: (nudgeId: string) => `${BASE}/nudges/${nudgeId}`,
} as const;

/**
 * Counsellor endpoints
 */
export const counsellorEndpoints = {
  getAll: `${BASE}/counsellors`,
  getPending: `${BASE}/counsellors/pending-counsellors`,
  getById: (counsellorId: string) => `${BASE}/counsellors/${counsellorId}`,
  getByEmail: `${BASE}/counsellors/get-counsellor`,
  create: `${BASE}/counsellors`,
  update: (counsellorId: string) => `${BASE}/counsellors/${counsellorId}`,
  delete: (counsellorId: string) => `${BASE}/counsellors/${counsellorId}`,
} as const;

/**
 * Meeting endpoints
 */
export const meetingEndpoints = {
  getAll: `${BASE}/meetings`,
  getById: (meetingId: string) => `${BASE}/meetings/${meetingId}`,
  getCounsellorMeetings: (counsellorId: string) => 
    `${BASE}/meetings/counsellor/${counsellorId}`,
  getUpcoming: (counsellorId: string) => 
    `${BASE}/meetings/counsellor/${counsellorId}/upcoming`,
  create: `${BASE}/meetings`,
  delete: (meetingId: string) => `${BASE}/meetings/${meetingId}`,
  sendMail: `${BASE}/meetings/send-mail`,
} as const;

/**
 * Payment endpoints
 */
export const paymentEndpoints = {
  payNudges: `${BASE}/payments/pay-nudges`,
  payCounselling: `${BASE}/payments/pay-counselling`,
  payPremium: `${BASE}/payments/pay-premium`,
} as const;

/**
 * Health check endpoint
 */
export const healthEndpoint = `${BASE}/health`;

/**
 * All endpoints grouped by resource
 */
export const endpoints = {
  auth: authEndpoints,
  user: userEndpoints,
  partner: partnerEndpoints,
  assessment: assessmentEndpoints,
  article: articleEndpoints,
  category: categoryEndpoints,
  post: postEndpoints,
  book: bookEndpoints,
  forum: forumEndpoints,
  nudge: nudgeEndpoints,
  counsellor: counsellorEndpoints,
  meeting: meetingEndpoints,
  payment: paymentEndpoints,
  health: healthEndpoint,
} as const;

