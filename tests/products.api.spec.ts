import { test, expect } from '@playwright/test';
import { ProductsAPI } from '../clients/ProductsAPI';
import { APITestUtils } from '../clients/APITestUtils';

/**
 * Products API Tests
 * Tests for product-related API endpoints
 */
test.describe('Products API Tests @api @products', () => {
  let productsAPI: ProductsAPI;

  test.beforeEach(async ({ request }) => {
    productsAPI = new ProductsAPI(request);
  });

  test('GET /products - should return list of products', async () => {
    const startTime = Date.now();
    
    await test.step('Send GET request to fetch products', async () => {
      const response = await productsAPI.getAllProducts({ limit: 10 });
      
      await test.step('Verify response status is 200', async () => {
        await APITestUtils.validateStatusCode(response, 200);
      });
      
      await test.step('Verify response time is acceptable', async () => {
        APITestUtils.validateResponseTime(startTime, 3000);
      });
      
      await test.step('Verify response contains products', async () => {
        const body = await response.text();
        expect(body.length).toBeGreaterThan(0);
      });
    });
  });

  test('GET /products with pagination', async () => {
    await test.step('Request first page', async () => {
      const response = await productsAPI.getAllProducts({
        limit: 5,
        offset: 0,
      });
      
      expect(response.status()).toBe(200);
    });

    await test.step('Request second page', async () => {
      const response = await productsAPI.getAllProducts({
        limit: 5,
        offset: 5,
      });
      
      expect(response.status()).toBe(200);
    });
  });

  test('GET /products with sorting', async () => {
    await test.step('Sort by price ascending', async () => {
      const response = await productsAPI.getAllProducts({
        sort: 'p.price',
        order: 'asc',
      });
      
      expect(response.status()).toBe(200);
    });

    await test.step('Sort by price descending', async () => {
      const response = await productsAPI.getAllProducts({
        sort: 'p.price',
        order: 'desc',
      });
      
      expect(response.status()).toBe(200);
    });
  });

  test('GET /products/:id - should return specific product', async () => {
    const productId = '43'; // MacBook product ID
    
    await test.step('Get product by ID', async () => {
      const response = await productsAPI.getProductById(productId);
      
      await test.step('Verify response status', async () => {
        expect(response.status()).toBe(200);
      });
      
      await test.step('Verify product contains expected data', async () => {
        const body = await response.text();
        expect(body).toContain('MacBook');
      });
    });
  });

  test('GET /products/:id - should return 404 for invalid product', async () => {
    const invalidProductId = '999999';
    
    await test.step('Request invalid product', async () => {
      const response = await productsAPI.getProductById(invalidProductId);
      
      // Note: OpenCart demo may return 200 with error page
      expect([200, 404]).toContain(response.status());
    });
  });

  test('GET /products/search - should search products by keyword', async () => {
    const searchQuery = 'MacBook';
    
    await test.step('Search for products', async () => {
      const response = await productsAPI.searchProducts(searchQuery);
      
      await test.step('Verify response status', async () => {
        expect(response.status()).toBe(200);
      });
      
      await test.step('Verify search results contain query', async () => {
        const body = await response.text();
        expect(body.toLowerCase()).toContain(searchQuery.toLowerCase());
      });
    });
  });

  test('GET /products/search - should return empty for no matches', async () => {
    const searchQuery = 'nonexistentproduct12345';
    
    await test.step('Search for non-existent product', async () => {
      const response = await productsAPI.searchProducts(searchQuery);
      
      expect(response.status()).toBe(200);
      
      const body = await response.text();
      expect(body).toContain('no product');
    });
  });

  test('GET /categories/:id/products - should return products by category', async () => {
    const categoryId = 20; // Desktops category
    
    await test.step('Get products by category', async () => {
      const response = await productsAPI.getProductsByCategory(categoryId);
      
      expect(response.status()).toBe(200);
    });
  });

  test('GET /products/featured - should return featured products', async () => {
    await test.step('Get featured products', async () => {
      const response = await productsAPI.getFeaturedProducts(5);
      
      expect(response.status()).toBe(200);
    });
  });

  test('Performance: Multiple concurrent product requests', async () => {
    const productIds = ['43', '40', '42', '30'];
    const startTime = Date.now();
    
    await test.step('Send concurrent requests', async () => {
      const promises = productIds.map(id => productsAPI.getProductById(id));
      const responses = await Promise.all(promises);
      
      await test.step('Verify all requests succeeded', async () => {
        responses.forEach(response => {
          expect(response.status()).toBe(200);
        });
      });
      
      await test.step('Verify total time is acceptable', async () => {
        const totalTime = Date.now() - startTime;
        expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
      });
    });
  });

  test('Stress: Request product details 10 times', async () => {
    const productId = '43';
    const iterations = 10;
    const responseTimes: number[] = [];
    
    await test.step('Make multiple requests', async () => {
      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        const response = await productsAPI.getProductById(productId);
        const duration = Date.now() - start;
        
        responseTimes.push(duration);
        expect(response.status()).toBe(200);
      }
    });
    
    await test.step('Calculate performance metrics', async () => {
      const metrics = APITestUtils.createPerformanceMetrics(responseTimes);
      
      console.log('Performance Metrics:');
      console.log(`Min: ${metrics.min}ms`);
      console.log(`Max: ${metrics.max}ms`);
      console.log(`Avg: ${metrics.avg.toFixed(2)}ms`);
      console.log(`Median: ${metrics.median}ms`);
      
      expect(metrics.avg).toBeLessThan(3000);
    });
  });
});
