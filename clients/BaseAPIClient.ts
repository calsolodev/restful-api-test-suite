import { APIRequestContext, APIResponse, expect } from '@playwright/test';

/**
 * Base API Client
 * Provides common methods for API testing
 */
export class BaseAPIClient {
  protected request: APIRequestContext;
  protected baseURL: string;

  constructor(request: APIRequestContext, baseURL?: string) {
    this.request = request;
    this.baseURL = baseURL || process.env.API_BASE_URL || '';
  }

  /**
   * GET request
   */
  async get(
    endpoint: string,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
    }
  ): Promise<APIResponse> {
    const url = this.buildURL(endpoint, options?.params);
    
    return await this.request.get(url, {
      headers: options?.headers,
    });
  }

  /**
   * POST request
   */
  async post(
    endpoint: string,
    options?: {
      data?: any;
      headers?: Record<string, string>;
      params?: Record<string, any>;
    }
  ): Promise<APIResponse> {
    const url = this.buildURL(endpoint, options?.params);
    
    return await this.request.post(url, {
      data: options?.data,
      headers: options?.headers,
    });
  }

  /**
   * PUT request
   */
  async put(
    endpoint: string,
    options?: {
      data?: any;
      headers?: Record<string, string>;
      params?: Record<string, any>;
    }
  ): Promise<APIResponse> {
    const url = this.buildURL(endpoint, options?.params);
    
    return await this.request.put(url, {
      data: options?.data,
      headers: options?.headers,
    });
  }

  /**
   * PATCH request
   */
  async patch(
    endpoint: string,
    options?: {
      data?: any;
      headers?: Record<string, string>;
      params?: Record<string, any>;
    }
  ): Promise<APIResponse> {
    const url = this.buildURL(endpoint, options?.params);
    
    return await this.request.patch(url, {
      data: options?.data,
      headers: options?.headers,
    });
  }

  /**
   * DELETE request
   */
  async delete(
    endpoint: string,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, any>;
    }
  ): Promise<APIResponse> {
    const url = this.buildURL(endpoint, options?.params);
    
    return await this.request.delete(url, {
      headers: options?.headers,
    });
  }

  /**
   * Build full URL with query parameters
   */
  protected buildURL(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseURL}${endpoint}`;
    
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Verify response status code
   */
  async verifyStatusCode(response: APIResponse, expectedStatus: number): Promise<void> {
    expect(response.status(), `Expected status ${expectedStatus} but got ${response.status()}`).toBe(expectedStatus);
  }

  /**
   * Verify response contains data
   */
  async verifyResponseContains(response: APIResponse, key: string, value: any): Promise<void> {
    const body = await response.json();
    expect(body[key]).toBe(value);
  }

  /**
   * Get response body as JSON
   */
  async getResponseBody(response: APIResponse): Promise<any> {
    return await response.json();
  }

  /**
   * Get response body as text
   */
  async getResponseText(response: APIResponse): Promise<string> {
    return await response.text();
  }

  /**
   * Get response headers
   */
  getResponseHeaders(response: APIResponse): Record<string, string> {
    return response.headers();
  }

  /**
   * Verify response time
   */
  async verifyResponseTime(response: APIResponse, maxTime: number): Promise<void> {
    const timing = response.headers()['x-response-time'];
    if (timing) {
      const time = parseInt(timing);
      expect(time).toBeLessThanOrEqual(maxTime);
    }
  }

  /**
   * Verify response has header
   */
  verifyHeader(response: APIResponse, headerName: string, expectedValue?: string): void {
    const headers = response.headers();
    expect(headers[headerName.toLowerCase()]).toBeDefined();
    
    if (expectedValue) {
      expect(headers[headerName.toLowerCase()]).toBe(expectedValue);
    }
  }

  /**
   * Verify JSON schema structure
   */
  async verifyJSONSchema(response: APIResponse, schema: any): Promise<void> {
    const body = await response.json();
    
    // Basic schema validation
    for (const key in schema) {
      expect(body).toHaveProperty(key);
      expect(typeof body[key]).toBe(schema[key]);
    }
  }

  /**
   * Extract value from JSON response
   */
  async extractValue(response: APIResponse, path: string): Promise<any> {
    const body = await response.json();
    const keys = path.split('.');
    let value = body;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined) break;
    }
    
    return value;
  }

  /**
   * Log request details
   */
  logRequest(method: string, endpoint: string, data?: any): void {
    console.log(`[API Request] ${method} ${endpoint}`);
    if (data) {
      console.log('Request Body:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log response details
   */
  async logResponse(response: APIResponse): Promise<void> {
    console.log(`[API Response] Status: ${response.status()}`);
    console.log('Response Body:', await response.text());
  }
}
