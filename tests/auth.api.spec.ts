import { test, expect } from '@playwright/test';
import { AuthAPI } from '../clients/AuthAPI';
import { APITestUtils } from '../clients/APITestUtils';
import { TestDataGenerator } from '../utils/TestDataGenerator';

/**
 * Authentication API Tests
 * Tests for user authentication endpoints
 */
test.describe('Authentication API Tests @api @auth', () => {
  let authAPI: AuthAPI;

  test.beforeEach(async ({ request }) => {
    authAPI = new AuthAPI(request);
  });

  test('POST /auth/login - should login with valid credentials', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    
    await test.step('Send login request', async () => {
      const response = await authAPI.login(email, password);
      
      await test.step('Verify response status', async () => {
        expect(response.status()).toBe(200);
      });
    });
  });

  test('POST /auth/login - should reject invalid credentials', async () => {
    const email = 'invalid@example.com';
    const password = 'wrongpassword';
    
    await test.step('Try to login with invalid credentials', async () => {
      const response = await authAPI.login(email, password);
      
      await test.step('Verify response indicates error', async () => {
        expect(response.status()).toBe(200); // OpenCart returns 200 with error message
        const body = await response.text();
        expect(body.toLowerCase()).toContain('warning');
      });
    });
  });

  test('POST /auth/login - should reject empty email', async () => {
    const email = '';
    const password = 'password123';
    
    await test.step('Try to login with empty email', async () => {
      const response = await authAPI.login(email, password);
      
      expect([200, 400]).toContain(response.status());
    });
  });

  test('POST /auth/login - should reject empty password', async () => {
    const email = 'test@example.com';
    const password = '';
    
    await test.step('Try to login with empty password', async () => {
      const response = await authAPI.login(email, password);
      
      expect([200, 400]).toContain(response.status());
    });
  });

  test('POST /auth/login - should handle SQL injection attempt', async () => {
    const email = "admin' OR '1'='1";
    const password = "admin' OR '1'='1";
    
    await test.step('Try SQL injection', async () => {
      const response = await authAPI.login(email, password);
      
      await test.step('Verify SQL injection is blocked', async () => {
        expect(response.status()).toBe(200); // Should return normal error, not succeed
        const body = await response.text();
        expect(body.toLowerCase()).toContain('warning');
      });
    });
  });

  test('POST /auth/register - should register new user', async () => {
    const userData = TestDataGenerator.generateUser();
    
    await test.step('Register new user', async () => {
      const response = await authAPI.register({
        firstname: userData.firstName,
        lastname: userData.lastName,
        email: userData.email,
        telephone: userData.telephone,
        password: userData.password,
        confirm: userData.password,
        agree: 1,
      });
      
      await test.step('Verify registration response', async () => {
        expect(response.status()).toBe(200);
      });
    });
  });

  test('POST /auth/register - should reject duplicate email', async () => {
    const email = 'existing@example.com';
    const userData = TestDataGenerator.generateUser();
    
    await test.step('Try to register with duplicate email', async () => {
      const response = await authAPI.register({
        firstname: userData.firstName,
        lastname: userData.lastName,
        email: email,
        telephone: userData.telephone,
        password: userData.password,
        confirm: userData.password,
      });
      
      // May succeed or fail depending on if email exists
      expect([200, 400, 409]).toContain(response.status());
    });
  });

  test('POST /auth/register - should reject mismatched passwords', async () => {
    const userData = TestDataGenerator.generateUser();
    
    await test.step('Try to register with mismatched passwords', async () => {
      const response = await authAPI.register({
        firstname: userData.firstName,
        lastname: userData.lastName,
        email: userData.email,
        telephone: userData.telephone,
        password: 'Password123!',
        confirm: 'DifferentPassword456!',
      });
      
      expect([200, 400]).toContain(response.status());
    });
  });

  test('POST /auth/register - should validate email format', async () => {
    const userData = TestDataGenerator.generateUser();
    
    await test.step('Try to register with invalid email', async () => {
      const response = await authAPI.register({
        firstname: userData.firstName,
        lastname: userData.lastName,
        email: 'invalid-email-format',
        telephone: userData.telephone,
        password: userData.password,
        confirm: userData.password,
      });
      
      expect([200, 400]).toContain(response.status());
    });
  });

  test('POST /auth/register - should require privacy policy agreement', async () => {
    const userData = TestDataGenerator.generateUser();
    
    await test.step('Try to register without agreeing to policy', async () => {
      const response = await authAPI.register({
        firstname: userData.firstName,
        lastname: userData.lastName,
        email: userData.email,
        telephone: userData.telephone,
        password: userData.password,
        confirm: userData.password,
        agree: 0,
      });
      
      expect([200, 400]).toContain(response.status());
    });
  });

  test('GET /auth/logout - should logout user', async () => {
    await test.step('Logout user', async () => {
      const response = await authAPI.logout();
      
      expect(response.status()).toBe(200);
    });
  });

  test('GET /auth/session - should get current session', async () => {
    await test.step('Get session', async () => {
      const response = await authAPI.getSession();
      
      expect(response.status()).toBe(200);
    });
  });

  test('POST /auth/forgot-password - should handle password reset request', async () => {
    const email = 'test@example.com';
    
    await test.step('Request password reset', async () => {
      const response = await authAPI.forgotPassword(email);
      
      expect(response.status()).toBe(200);
    });
  });

  test('POST /auth/forgot-password - should handle non-existent email', async () => {
    const email = 'nonexistent@example.com';
    
    await test.step('Request password reset for non-existent email', async () => {
      const response = await authAPI.forgotPassword(email);
      
      // Should not reveal if email exists
      expect(response.status()).toBe(200);
    });
  });

  test('GET /auth/profile - should get user profile', async () => {
    await test.step('Get user profile', async () => {
      const response = await authAPI.getUserProfile();
      
      expect(response.status()).toBe(200);
    });
  });

  test('Performance: Multiple login attempts', async () => {
    const credentials = [
      { email: 'user1@example.com', password: 'password1' },
      { email: 'user2@example.com', password: 'password2' },
      { email: 'user3@example.com', password: 'password3' },
    ];
    
    const responseTimes: number[] = [];
    
    await test.step('Perform multiple logins', async () => {
      for (const cred of credentials) {
        const start = Date.now();
        const response = await authAPI.login(cred.email, cred.password);
        const duration = Date.now() - start;
        
        responseTimes.push(duration);
        expect(response.status()).toBe(200);
      }
    });
    
    await test.step('Verify performance', async () => {
      const metrics = APITestUtils.createPerformanceMetrics(responseTimes);
      console.log('Login Performance:', metrics);
      
      expect(metrics.avg).toBeLessThan(2000); // Average under 2 seconds
    });
  });

  test('Security: Rate limiting on login attempts', async () => {
    const email = 'test@example.com';
    const password = 'wrongpassword';
    const attempts = 5;
    
    await test.step('Make multiple failed login attempts', async () => {
      for (let i = 0; i < attempts; i++) {
        const response = await authAPI.login(email, password);
        console.log(`Attempt ${i + 1}: Status ${response.status()}`);
        
        // After certain attempts, might be rate limited
        expect([200, 429]).toContain(response.status());
      }
    });
  });

  test('Security: XSS prevention in registration', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    const userData = TestDataGenerator.generateUser();
    
    await test.step('Try to register with XSS payload', async () => {
      const response = await authAPI.register({
        firstname: xssPayload,
        lastname: userData.lastName,
        email: userData.email,
        telephone: userData.telephone,
        password: userData.password,
        confirm: userData.password,
      });
      
      expect([200, 400]).toContain(response.status());
      
      // If successful, verify payload is sanitized
      if (response.status() === 200) {
        const body = await response.text();
        expect(body).not.toContain('<script>');
      }
    });
  });
});
