import { Page, expect } from '@playwright/test';

/**
 * Test Helper Utilities
 * Common helper functions used across tests
 */
export class TestHelpers {
  /**
   * Wait for API response
   */
  static async waitForAPIResponse(
    page: Page,
    urlPattern: string | RegExp,
    timeout: number = 30000
  ): Promise<any> {
    const response = await page.waitForResponse(
      (resp) => {
        const url = resp.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
    
    return await response.json();
  }

  /**
   * Take screenshot with timestamp
   */
  static async takeScreenshot(page: Page, name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({
      path: `screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for network idle
   */
  static async waitForNetworkIdle(page: Page, timeout: number = 10000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Extract number from string
   */
  static extractNumber(text: string): number {
    const match = text.match(/[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
    return 0;
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Generate random number in range
   */
  static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Sleep for specified milliseconds
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry action with specified attempts
   */
  static async retry<T>(
    action: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          await this.sleep(delayMs);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Verify URL contains path
   */
  static async verifyURL(page: Page, expectedPath: string): Promise<void> {
    await expect(page).toHaveURL(new RegExp(expectedPath));
  }

  /**
   * Verify page title
   */
  static async verifyTitle(page: Page, expectedTitle: string): Promise<void> {
    await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  }

  /**
   * Get current timestamp
   */
  static getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Log test step
   */
  static logStep(stepName: string, data?: any): void {
    console.log(`[${this.getTimestamp()}] Step: ${stepName}`);
    if (data) {
      console.log('Data:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Scroll to bottom of page
   */
  static async scrollToBottom(page: Page): Promise<void> {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  /**
   * Scroll to top of page
   */
  static async scrollToTop(page: Page): Promise<void> {
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }

  /**
   * Clear browser cookies
   */
  static async clearCookies(page: Page): Promise<void> {
    await page.context().clearCookies();
  }

  /**
   * Clear browser local storage
   */
  static async clearLocalStorage(page: Page): Promise<void> {
    await page.evaluate(() => {
      localStorage.clear();
    });
  }

  /**
   * Get local storage item
   */
  static async getLocalStorageItem(page: Page, key: string): Promise<string | null> {
    return await page.evaluate((k) => localStorage.getItem(k), key);
  }

  /**
   * Set local storage item
   */
  static async setLocalStorageItem(page: Page, key: string, value: string): Promise<void> {
    await page.evaluate(
      ({ k, v }) => localStorage.setItem(k, v),
      { k: key, v: value }
    );
  }
}
