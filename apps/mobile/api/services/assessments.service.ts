/**
 * Assessments Service
 * 
 * Service layer for assessment-related API calls.
 */

import { assessmentEndpoints } from '../config/endpoints';
import {
    Assessment,
    AssessmentResult,
    CreateAssessmentRequest,
    GenerateAssessmentResultRequest,
    UpdateAssessmentRequest,
} from '../types';
import { BaseService } from './base.service';

/**
 * Assessments service
 */
export class AssessmentsService extends BaseService {
  /**
   * Get all assessments
   */
  async getAllAssessments(): Promise<Assessment[]> {
    const response = await this.get<Assessment[]>(assessmentEndpoints.getAll);
    return this.extractData(response);
  }

  /**
   * Get assessment by ID
   */
  async getAssessmentById(assessmentId: string): Promise<Assessment> {
    const response = await this.get<Assessment>(assessmentEndpoints.getById(assessmentId));
    return this.extractData(response);
  }

  /**
   * Get assessments by category
   */
  async getAssessmentsByCategory(category: string): Promise<Assessment[]> {
    // API returns { assessments: Assessment[], limit: number, page: number, total: number } structure
    const response = await this.get<{ assessments: Assessment[]; limit?: number; page?: number; total?: number }>(assessmentEndpoints.getByCategory(category));
    
    // Extract the assessments array from the response
    if (response && typeof response === 'object' && 'assessments' in response) {
      return Array.isArray(response.assessments) ? response.assessments : [];
    }
    
    return [];
  }

  /**
   * Create assessment
   */
  async createAssessment(data: CreateAssessmentRequest): Promise<Assessment> {
    const response = await this.post<Assessment>(assessmentEndpoints.create, data);
    return this.extractData(response);
  }

  /**
   * Update assessment
   */
  async updateAssessment(assessmentId: string, data: UpdateAssessmentRequest): Promise<Assessment> {
    const response = await this.patch<Assessment>(assessmentEndpoints.update(assessmentId), data);
    return this.extractData(response);
  }

  /**
   * Delete assessment
   */
  async deleteAssessment(assessmentId: string): Promise<void> {
    await this.delete(assessmentEndpoints.delete(assessmentId));
  }

  /**
   * Generate assessment result
   */
  async generateResult(data: GenerateAssessmentResultRequest): Promise<AssessmentResult> {
    const response = await this.post<AssessmentResult>(assessmentEndpoints.generateResult, data);

    console.log("Assessment Result Response", response)
    return this.extractData(response);
  }
}

/**
 * Assessments service instance
 */
export const assessmentsService = new AssessmentsService();

