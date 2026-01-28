import { test, expect } from '@playwright/test';
import { CartAPI } from '../clients/CartAPI';
import { APITestUtils } from '../clients/APITestUtils';

/**
 * Cart API Tests
 * Tests for shopping cart API endpoints
 */
test.describe('Cart API Tests @api @cart', () => {
  let cartAPI: CartAPI;

  test.beforeEach(async ({ request }) => {
    cartAPI = new CartAPI(request);
  });

  test('POST /cart/add - should add product to cart', async () => {
    const productId = '43'; // MacBook
    const quantity = 1;
    
    await test.step('Add product to cart', async () => {
      const response = await cartAPI.addToCart(productId, quantity);
      
      await test.step('Verify response status', async () => {
        expect(response.status()).toBe(200);
      });
      
      await test.step('Verify success message', async () => {
        const body = await response.text();
        expect(body.length).toBeGreaterThan(0);
      });
    });
  });

  test('POST /cart/add - should add multiple quantities', async () => {
    const productId = '43';
    const quantity = 5;
    
    await test.step('Add multiple quantities to cart', async () => {
      const response = await cartAPI.addToCart(productId, quantity);
      
      expect(response.status()).toBe(200);
    });
  });

  test('POST /cart/add - should handle invalid product ID', async () => {
    const invalidProductId = '999999';
    const quantity = 1;
    
    await test.step('Try to add invalid product', async () => {
      const response = await cartAPI.addToCart(invalidProductId, quantity);
      
      // OpenCart may return 200 with error message
      expect([200, 400, 404]).toContain(response.status());
    });
  });

  test('POST /cart/add - should handle zero quantity', async () => {
    const productId = '43';
    const quantity = 0;
    
    await test.step('Try to add zero quantity', async () => {
      const response = await cartAPI.addToCart(productId, quantity);
      
      expect([200, 400]).toContain(response.status());
    });
  });

  test('POST /cart/add - should handle negative quantity', async () => {
    const productId = '43';
    const quantity = -1;
    
    await test.step('Try to add negative quantity', async () => {
      const response = await cartAPI.addToCart(productId, quantity);
      
      expect([200, 400]).toContain(response.status());
    });
  });

  test('GET /cart - should get cart contents', async () => {
    await test.step('Get cart', async () => {
      const response = await cartAPI.getCart();
      
      await test.step('Verify response status', async () => {
        expect(response.status()).toBe(200);
      });
    });
  });

  test('Complete cart flow - add, update, remove', async () => {
    const productId = '43';
    
    await test.step('Add product to cart', async () => {
      const response = await cartAPI.addToCart(productId, 1);
      expect(response.status()).toBe(200);
    });
    
    await test.step('View cart', async () => {
      const response = await cartAPI.getCart();
      expect(response.status()).toBe(200);
    });
    
    await test.step('Update quantity (if cart item ID available)', async () => {
      // Note: Would need cart item ID from previous response
      // This is a placeholder showing the flow
      console.log('Update quantity step - requires cart item ID from response');
    });
  });

  test('POST /cart/coupon - should apply coupon code', async () => {
    const couponCode = 'TEST123';
    
    await test.step('Apply coupon code', async () => {
      const response = await cartAPI.applyCoupon(couponCode);
      
      // May return various status codes depending on coupon validity
      expect([200, 400, 404]).toContain(response.status());
    });
  });

  test('DELETE /cart/coupon - should remove coupon', async () => {
    await test.step('Remove coupon', async () => {
      const response = await cartAPI.removeCoupon();
      
      expect(response.status()).toBe(200);
    });
  });

  test('GET /cart/totals - should get cart totals', async () => {
    await test.step('Get cart totals', async () => {
      const response = await cartAPI.getCartTotals();
      
      expect(response.status()).toBe(200);
    });
  });

  test('Performance: Add 10 products to cart sequentially', async () => {
    const productId = '43';
    const startTime = Date.now();
    
    await test.step('Add products sequentially', async () => {
      for (let i = 0; i < 10; i++) {
        const response = await cartAPI.addToCart(productId, 1);
        expect(response.status()).toBe(200);
      }
    });
    
    await test.step('Verify total time', async () => {
      const totalTime = Date.now() - startTime;
      console.log(`Total time for 10 sequential adds: ${totalTime}ms`);
      expect(totalTime).toBeLessThan(15000); // 15 seconds for 10 requests
    });
  });

  test('Stress: Concurrent cart additions', async () => {
    const productIds = ['43', '40', '42', '30', '47'];
    
    await test.step('Add multiple products concurrently', async () => {
      const promises = productIds.map(id => cartAPI.addToCart(id, 1));
      const responses = await Promise.all(promises);
      
      await test.step('Verify all additions succeeded', async () => {
        responses.forEach(response => {
          expect(response.status()).toBe(200);
        });
      });
    });
  });

  test('Edge case: Add product with very large quantity', async () => {
    const productId = '43';
    const largeQuantity = 9999;
    
    await test.step('Try to add large quantity', async () => {
      const response = await cartAPI.addToCart(productId, largeQuantity);
      
      // Should either succeed or return validation error
      expect([200, 400]).toContain(response.status());
    });
  });

  test('POST /cart/shipping - should calculate shipping', async () => {
    const shippingData = {
      country_id: '223', // United States
      zone_id: '3655', // California
      postcode: '94101',
    };
    
    await test.step('Calculate shipping', async () => {
      const response = await cartAPI.calculateShipping(shippingData);
      
      expect([200, 400]).toContain(response.status());
    });
  });

  test('GET /cart/shipping-methods - should get available shipping methods', async () => {
    await test.step('Get shipping methods', async () => {
      const response = await cartAPI.getShippingMethods();
      
      expect(response.status()).toBe(200);
    });
  });
});
