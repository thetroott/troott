/**
 * Types Index
 * 
 * Central export for all API type definitions.
 * 
 * This file should contain all TypeScript interfaces and types
 * for API requests and responses.
 */

/**
 * Base API Response Structure
 */
export interface ApiResponse<T = unknown> {
  status: 'success' | 'fail' | 'error';
  records?: number;
  data?: T;
  errors?: {
    message: string;
    field?: string;
  }[];
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  records: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface VerifyOtpRequest {
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}

export interface ChangePasswordRequest {
  password: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  photo?: string; // Deprecated: use avatar instead
  interests?: string[];
  areasOfFocus?: string[];
  profileCode?: string;
  partnerId?: string;
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
  assessmentResults?: Record<string, any>;
  isVerified?: boolean;
  lastLogin?: string;
  maritalStatus?: string | null;
  roles?: string[];
}

export interface UpdateUserProfileRequest {
  name?: string;
  interests?: string[];
  areasOfFocus?: string[];
}

export type GetUsersParams = PaginationParams;

// ============================================================================
// Partner Types
// ============================================================================

export interface SendPartnerInviteRequest {
  profileCode: string;
}

export interface ConfirmPartnerRequest {
  profileCode: string;
}

export interface AcceptPartnerInviteRequest {
  partnerId: string;
}

// ============================================================================
// Assessment Types
// ============================================================================

export interface Assessment {
  id: string;
  question: string;
  category: string;
  section: 'couple' | 'individual';
  options: AssessmentOption[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AssessmentOption {
  option: string;
  value: number;
}

export interface CreateAssessmentRequest {
  question: string;
  category: string;
  section: 'couple' | 'individual';
  options: AssessmentOption[];
}

export interface UpdateAssessmentRequest {
  question?: string;
  category?: string;
  section?: 'couple' | 'individual';
  options?: AssessmentOption[];
}

export interface AssessmentAnswer {
  question: string;
  answer: AssessmentOption;
}

export interface GenerateAssessmentResultRequest {
  answers: {
    [questionId: string]: string; // questionId -> selected option text (e.g., "Sometimes", "Always")
  };
  category: string;
  assessment: string; // assessment/question ID
}

export interface AssessmentResult {
  attemptNumber: number;
  category: string;
  completedAt: string;
  maxScore: number;
  message: string;
  percentage: number;
  rating: string;
  suggestions: string[];
  title: string;
  totalScore: number;
}

// ============================================================================
// Article Types
// ============================================================================

export interface Article {
  id: string;
  title: string;
  content: string;
  poster?: string;
  nudge?: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  poster?: File | string;
  nudge?: string;
  category: string;
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
  poster?: File | string;
  nudge?: string;
  category?: string;
}

// ============================================================================
// Category Types
// ============================================================================

export interface Category {
  id: string;
  name: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  image?: File | string;
}

export interface UpdateCategoryRequest {
  name?: string;
  image?: File | string;
}

// ============================================================================
// Post Types (v1)
// ============================================================================

export interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  image?: File | string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  image?: File | string;
}

// ============================================================================
// Book Types
// ============================================================================

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  image?: string;
  book?: string; // PDF file URL
  category: string;
  price: 'Free' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  description: string;
  image?: File | string;
  book?: File | string;
  category: string;
  price: 'Free' | string;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  description?: string;
  image?: File | string;
  book?: File | string;
  category?: string;
  price?: 'Free' | string;
}

// ============================================================================
// Forum Types
// ============================================================================

export interface Question {
  id: string;
  question: string;
  author: string;
  category: string;
  replies?: Reply[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuestionRequest {
  question: string;
  author: string;
  category: string;
}

export interface UpdateQuestionRequest {
  question?: string;
  author?: string;
  category?: string;
}

export interface Reply {
  id: string;
  reply: string;
  author: string;
  question: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReplyRequest {
  reply: string;
  author: string;
  question: string;
}

export interface UpdateReplyRequest {
  reply?: string;
}

// ============================================================================
// Nudge Types
// ============================================================================

export interface Nudge {
  id: string;
  nudge: string;
  category: string;
  section: 'couple' | 'individual';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNudgeRequest {
  nudge: string;
  category: string;
  section: 'couple' | 'individual';
}

export interface UpdateNudgeRequest {
  nudge?: string;
  category?: string;
  section?: 'couple' | 'individual';
}

// ============================================================================
// Counsellor Types
// ============================================================================

export interface Counsellor {
  id: string;
  name: string;
  title: string;
  description: string;
  schedule?: CounsellorSchedule[];
  user: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CounsellorSchedule {
  day?: string;
  start_time?: string;
  end_time?: string;
   timeChunks?: unknown[];
}

export interface CreateCounsellorRequest {
  name: string;
  title: string;
  description: string;
  schedule?: {
    start_time: string;
    end_time: string;
  }[];
  user: string;
}

export interface UpdateCounsellorRequest {
  name?: string;
  title?: string;
  description?: string;
  schedule?: CounsellorSchedule[];
  user?: string;
}

export interface GetCounsellorByEmailRequest {
  email: string;
}

// ============================================================================
// Meeting Types
// ============================================================================

export interface Meeting {
  id: string;
  topic: string;
  start_time: string;
  counsellor: string;
  client: string;
  withPartner: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMeetingRequest {
  topic: string;
  start_time: string;
  counsellor: string;
  client: string;
  withPartner: boolean | string;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface PayNudgesRequest {
  name: string;
  amount: string;
  duration: string;
  paymentId: string;
}

export interface PayCounsellingRequest {
  name: string;
  amount: string;
  duration: string;
  paymentId: string;
  sessions: string;
}

export interface PayPremiumRequest {
  name: string;
  amount: string;
  duration: string;
  paymentId: string;
  sessions: string;
}

// ============================================================================
// Health Check
// ============================================================================

export interface HealthCheckResponse {
  status: 'ok';
  timestamp: string;
}

