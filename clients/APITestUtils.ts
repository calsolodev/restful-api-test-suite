import { APIResponse, expect } from '@playwright/test';

/**
 * API Test Utilities
 * Helper functions for API testing
 */
export class APITestUtils {
  /**
   * Validate response status codes
   */
  static async validateStatusCode(
    response: APIResponse,
    expectedStatus: number,
    errorMessage?: string
  ): Promise<void> {
    const message = errorMessage || `Expected status ${expectedStatus}, got ${response.status()}`;
    expect(response.status(), message).toBe(expectedStatus);
  }

  /**
   * Validate response is successful (2xx)
   */
  static async validateSuccess(response: APIResponse): Promise<void> {
    expect(response.ok(), `Expected successful response, got ${response.status()}`).toBeTruthy();
  }

  /**
   * Validate response time
   */
  static validateResponseTime(startTime: number, maxTime: number): void {
    const duration = Date.now() - startTime;
    expect(duration, `Response time ${duration}ms exceeded max ${maxTime}ms`).toBeLessThanOrEqual(maxTime);
  }

  /**
   * Validate JSON response structure
   */
  static async validateJSONStructure(
    response: APIResponse,
    expectedKeys: string[]
  ): Promise<void> {
    const body = await response.json();
    
    for (const key of expectedKeys) {
      expect(body, `Missing key: ${key}`).toHaveProperty(key);
    }
  }

  /**
   * Validate response headers
   */
  static validateHeaders(
    response: APIResponse,
    expectedHeaders: Record<string, string>
  ): void {
    const headers = response.headers();
    
    for (const [key, value] of Object.entries(expectedHeaders)) {
      expect(headers[key.toLowerCase()]).toBe(value);
    }
  }

  /**
   * Validate content type
   */
  static validateContentType(
    response: APIResponse,
    expectedType: string
  ): void {
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain(expectedType);
  }

  /**
   * Parse JSON response safely
   */
  static async parseJSON(response: APIResponse): Promise<any> {
    try {
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error}`);
    }
  }

  /**
   * Extract nested value from JSON
   */
  static extractNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Validate array response
   */
  static async validateArrayResponse(
    response: APIResponse,
    minLength?: number,
    maxLength?: number
  ): Promise<void> {
    const body = await response.json();
    
    expect(Array.isArray(body), 'Response should be an array').toBeTruthy();
    
    if (minLength !== undefined) {
      expect(body.length, `Array length should be at least ${minLength}`).toBeGreaterThanOrEqual(minLength);
    }
    
    if (maxLength !== undefined) {
      expect(body.length, `Array length should be at most ${maxLength}`).toBeLessThanOrEqual(maxLength);
    }
  }

  /**
   * Validate pagination
   */
  static async validatePagination(
    response: APIResponse,
    expectedFields: string[] = ['page', 'limit', 'total']
  ): Promise<void> {
    const body = await response.json();
    
    for (const field of expectedFields) {
      expect(body, `Missing pagination field: ${field}`).toHaveProperty(field);
    }
  }

  /**
   * Validate error response
   */
  static async validateErrorResponse(
    response: APIResponse,
    expectedErrorCode?: string,
    expectedErrorMessage?: string
  ): Promise<void> {
    const body = await response.json();
    
    expect(body).toHaveProperty('error');
    
    if (expectedErrorCode) {
      expect(body.error.code).toBe(expectedErrorCode);
    }
    
    if (expectedErrorMessage) {
      expect(body.error.message).toContain(expectedErrorMessage);
    }
  }

  /**
   * Compare two JSON objects
   */
  static compareJSONObjects(
    obj1: any,
    obj2: any,
    ignoreKeys: string[] = []
  ): boolean {
    const filtered1 = this.filterObject(obj1, ignoreKeys);
    const filtered2 = this.filterObject(obj2, ignoreKeys);
    
    return JSON.stringify(filtered1) === JSON.stringify(filtered2);
  }

  /**
   * Filter object keys
   */
  private static filterObject(obj: any, keysToIgnore: string[]): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.filterObject(item, keysToIgnore));
    }
    
    const filtered: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!keysToIgnore.includes(key)) {
        filtered[key] = this.filterObject(value, keysToIgnore);
      }
    }
    
    return filtered;
  }

  /**
   * Wait for condition with polling
   */
  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 10000,
    interval: number = 500
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Generate test email
   */
  static generateTestEmail(): string {
    const timestamp = Date.now();
    const random = this.generateRandomString(5);
    return `test.${timestamp}.${random}@example.com`;
  }

  /**
   * Log API call details
   */
  static async logAPICall(
    method: string,
    url: string,
    response: APIResponse
  ): Promise<void> {
    console.log('='.repeat(80));
    console.log(`API Call: ${method} ${url}`);
    console.log(`Status: ${response.status()} ${response.statusText()}`);
    console.log(`Headers:`, response.headers());
    
    try {
      const body = await response.json();
      console.log(`Body:`, JSON.stringify(body, null, 2));
    } catch {
      console.log(`Body:`, await response.text());
    }
    
    console.log('='.repeat(80));
  }

  /**
   * Measure response time
   */
  static measureResponseTime(startTime: number): number {
    return Date.now() - startTime;
  }

  /**
   * Create performance metrics
   */
  static createPerformanceMetrics(responseTimes: number[]): {
    min: number;
    max: number;
    avg: number;
    median: number;
  } {
    const sorted = responseTimes.sort((a, b) => a - b);
    const sum = responseTimes.reduce((acc, val) => acc + val, 0);
    
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / responseTimes.length,
      median: sorted[Math.floor(sorted.length / 2)],
    };
  }

  /**
   * Validate rate limiting
   */
  static async validateRateLimiting(
    apiCall: () => Promise<APIResponse>,
    maxRequests: number,
    expectedStatus: number = 429
  ): Promise<void> {
    const responses: APIResponse[] = [];
    
    for (let i = 0; i < maxRequests + 1; i++) {
      responses.push(await apiCall());
    }
    
    // Last request should be rate limited
    expect(responses[responses.length - 1].status()).toBe(expectedStatus);
  }
}
