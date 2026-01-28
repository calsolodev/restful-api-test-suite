import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseAPIClient } from './BaseAPIClient';

/**
 * Authentication API Client
 * Handles user authentication and session management
 */
export class AuthAPI extends BaseAPIClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  /**
   * User login
   */
  async login(email: string, password: string): Promise<APIResponse> {
    this.logRequest('POST', '/auth/login', { email });
    
    const response = await this.post('/index.php?route=account/login', {
      data: {
        email: email,
        password: password,
      },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * User registration
   */
  async register(userData: {
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    password: string;
    confirm: string;
    agree?: number;
  }): Promise<APIResponse> {
    this.logRequest('POST', '/auth/register', { email: userData.email });
    
    const response = await this.post('/index.php?route=account/register', {
      data: {
        ...userData,
        agree: userData.agree || 1,
      },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Logout
   */
  async logout(): Promise<APIResponse> {
    this.logRequest('POST', '/auth/logout');
    
    const response = await this.get('/index.php?route=account/logout');
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Get current user session
   */
  async getSession(): Promise<APIResponse> {
    this.logRequest('GET', '/auth/session');
    
    const response = await this.get('/index.php?route=account/account');
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<APIResponse> {
    this.logRequest('POST', '/auth/forgot-password', { email });
    
    const response = await this.post('/index.php?route=account/forgotten', {
      data: { email },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Reset password
   */
  async resetPassword(
    code: string,
    password: string,
    confirmPassword: string
  ): Promise<APIResponse> {
    this.logRequest('POST', '/auth/reset-password');
    
    const response = await this.post('/index.php?route=account/reset', {
      data: {
        code: code,
        password: password,
        confirm: confirmPassword,
      },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<APIResponse> {
    this.logRequest('POST', '/auth/verify-email', { token });
    
    const response = await this.get('/index.php?route=account/success', {
      params: { token },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<APIResponse> {
    this.logRequest('GET', '/auth/profile');
    
    const response = await this.get('/index.php?route=account/account');
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: {
    firstname?: string;
    lastname?: string;
    email?: string;
    telephone?: string;
  }): Promise<APIResponse> {
    this.logRequest('PUT', '/auth/profile', profileData);
    
    const response = await this.post('/index.php?route=account/edit', {
      data: profileData,
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<APIResponse> {
    this.logRequest('POST', '/auth/change-password');
    
    const response = await this.post('/index.php?route=account/password', {
      data: {
        password: currentPassword,
        confirm: newPassword,
      },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Extract session token from response
   */
  async extractSessionToken(response: APIResponse): Promise<string | null> {
    const cookies = response.headers()['set-cookie'];
    
    if (cookies) {
      const sessionMatch = cookies.match(/OCSESSID=([^;]+)/);
      return sessionMatch ? sessionMatch[1] : null;
    }
    
    return null;
  }

  /**
   * Verify authentication response
   */
  async verifyAuthResponse(response: APIResponse, shouldBeAuthenticated: boolean): Promise<void> {
    const body = await response.text();
    
    if (shouldBeAuthenticated) {
      // Check for successful login indicators
      expect(body).toContain('account');
    } else {
      // Check for login page or error
      expect(body).toContain('login');
    }
  }
}
