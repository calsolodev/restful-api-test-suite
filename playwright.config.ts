import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Playwright Configuration for REST API Testing
 * Optimized for API-only test execution
 */
export default defineConfig({
  testDir: './tests',
  
  // Test timeout settings
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }]
  ],

  // Global API test configuration
  use: {
    baseURL: process.env.API_BASE_URL || 'https://demo.opencart.com',
    
    // API-specific settings
    extraHTTPHeaders: {
      'Accept': 'application/json, text/html',
      'User-Agent': 'Playwright API Test Framework/1.0',
    },
    
    // Timeout settings
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Trace and video (not needed for API tests, but useful for debugging)
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
  },

  // Project configuration for API testing
  projects: [
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL || 'https://demo.opencart.com',
      },
    },
    
    // Separate project for smoke tests
    {
      name: 'api-smoke',
      testMatch: /.*\.api\.spec\.ts/,
      grep: /@smoke/,
      use: {
        baseURL: process.env.API_BASE_URL || 'https://demo.opencart.com',
      },
    },
    
    // Separate project for performance tests
    {
      name: 'api-performance',
      testMatch: /.*\.api\.spec\.ts/,
      grep: /@performance/,
      retries: 0, // No retries for performance tests
      use: {
        baseURL: process.env.API_BASE_URL || 'https://demo.opencart.com',
      },
    },
  ],
});
