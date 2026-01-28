# API Testing Guide

## Overview

This guide provides comprehensive documentation for the RESTful API Test Suite, covering architecture, patterns, best practices, and usage examples.

## Table of Contents

1. [Architecture](#architecture)
2. [Service Objects Pattern](#service-objects-pattern)
3. [API Clients](#api-clients)
4. [Writing Tests](#writing-tests)
5. [Test Categories](#test-categories)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Architecture

### Framework Components

```
┌─────────────────────────────────────┐
│         Test Layer                   │
│  (products.api.spec.ts, etc.)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Service Objects Layer           │
│  (ProductsAPI, CartAPI, AuthAPI)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Base Client Layer              │
│      (BaseAPIClient)                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Playwright Layer                │
│      (HTTP Requests)                 │
└─────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns** - Each layer has specific responsibilities
2. **DRY (Don't Repeat Yourself)** - Reusable components
3. **Single Responsibility** - Each class has one purpose
4. **Open/Closed Principle** - Open for extension, closed for modification

## Service Objects Pattern

### What is Service Objects Pattern?

Service Objects Pattern encapsulates API business logic in dedicated classes (services), keeping tests clean and focused on validation.

### Benefits

- **Maintainability** - Changes to APIs only affect service objects
- **Reusability** - Services can be used across multiple tests
- **Testability** - Easy to test services independently
- **Readability** - Tests are more readable and focused

### Example

```typescript
// Service Object
class ProductsAPI {
  async getProductById(id: string) {
    return await this.get(`/products/${id}`);
  }
}

// Test using service
test('should get product', async () => {
  const api = new ProductsAPI(request);
  const response = await api.getProductById('43');
  expect(response.status()).toBe(200);
});
```

## API Clients

### BaseAPIClient

The foundation class providing common HTTP methods.

**Key Methods:**

```typescript
// HTTP Methods
get(endpoint, options)      // GET request
post(endpoint, options)     // POST request
put(endpoint, options)      // PUT request
patch(endpoint, options)    // PATCH request
delete(endpoint, options)   // DELETE request

// Validation Methods
verifyStatusCode(response, expected)
verifyHeader(response, header, value)
verifyJSONSchema(response, schema)

// Utility Methods
getResponseBody(response)
extractValue(response, path)
logRequest(method, endpoint)
logResponse(response)
```

**Example:**

```typescript
const client = new BaseAPIClient(request);
const response = await client.get('/products', {
  params: { limit: 10 },
  headers: { 'Accept': 'application/json' }
});
```

### ProductsAPI

Handles product catalog operations.

**Methods:**

```typescript
getAllProducts(params)              // List products with pagination
getProductById(id)                  // Get specific product
searchProducts(query, params)       // Search products
getProductsByCategory(categoryId)   // Filter by category
getFeaturedProducts(limit)          // Get featured products
getProductReviews(productId)        // Get reviews
createProductReview(productId, data) // Add review
checkProductAvailability(productId)  // Check stock
```

**Example:**

```typescript
const productsAPI = new ProductsAPI(request);

// Search for laptops
const response = await productsAPI.searchProducts('laptop', {
  limit: 20,
  categoryId: 18
});

expect(response.status()).toBe(200);
```

### CartAPI

Manages shopping cart operations.

**Methods:**

```typescript
getCart()                           // Get cart contents
addToCart(productId, quantity)      // Add item
updateCartItem(itemId, quantity)    // Update quantity
removeFromCart(itemId)              // Remove item
clearCart()                         // Empty cart
applyCoupon(code)                   // Apply discount
removeCoupon()                      // Remove discount
getCartTotals()                     // Get price breakdown
calculateShipping(data)             // Calculate shipping
getShippingMethods()                // Get available methods
```

**Example:**

```typescript
const cartAPI = new CartAPI(request);

// Add product to cart
await cartAPI.addToCart('43', 2);

// Get cart contents
const cart = await cartAPI.getCart();

// Apply coupon
await cartAPI.applyCoupon('SAVE10');
```

### AuthAPI

Handles user authentication and management.

**Methods:**

```typescript
login(email, password)              // User login
register(userData)                  // New user registration
logout()                            // User logout
getSession()                        // Get current session
forgotPassword(email)               // Password reset request
resetPassword(code, password)       // Reset password
getUserProfile()                    // Get user details
updateProfile(data)                 // Update user info
changePassword(current, new)        // Change password
verifyEmail(token)                  // Email verification
```

**Example:**

```typescript
const authAPI = new AuthAPI(request);

// Login
const response = await authAPI.login(
  'user@example.com',
  'password123'
);

// Extract session token
const token = await authAPI.extractSessionToken(response);

// Use token for authenticated requests
cartAPI.setSessionToken(token);
```

## Writing Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { ProductsAPI } from '../clients/ProductsAPI';

test.describe('Products API @api @products', () => {
  let productsAPI: ProductsAPI;

  test.beforeEach(async ({ request }) => {
    productsAPI = new ProductsAPI(request);
  });

  test('should get all products', async () => {
    const response = await productsAPI.getAllProducts();
    expect(response.status()).toBe(200);
  });
});
```

### Test with Steps

```typescript
test('complete shopping flow', async () => {
  await test.step('Search for product', async () => {
    const response = await productsAPI.searchProducts('laptop');
    expect(response.status()).toBe(200);
  });
  
  await test.step('Add to cart', async () => {
    const response = await cartAPI.addToCart('43', 1);
    expect(response.status()).toBe(200);
  });
  
  await test.step('Verify cart', async () => {
    const response = await cartAPI.getCart();
    expect(response.status()).toBe(200);
  });
});
```

### Data-Driven Tests

```typescript
const testData = [
  { productId: '43', quantity: 1 },
  { productId: '40', quantity: 2 },
  { productId: '42', quantity: 3 },
];

testData.forEach(({ productId, quantity }) => {
  test(`add product ${productId} with quantity ${quantity}`, async () => {
    const response = await cartAPI.addToCart(productId, quantity);
    expect(response.status()).toBe(200);
  });
});
```

## Test Categories

### Functional Tests

Test business logic and functionality.

```typescript
test('should add product to cart @functional', async () => {
  const response = await cartAPI.addToCart('43', 1);
  
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toHaveProperty('success');
});
```

### Smoke Tests

Quick validation of critical functionality.

```typescript
test('API health check @smoke', async () => {
  const response = await productsAPI.getAllProducts({ limit: 1 });
  expect(response.status()).toBe(200);
});
```

### Regression Tests

Comprehensive test coverage.

```typescript
test('product search with various filters @regression', async () => {
  // Test multiple search scenarios
  const queries = ['laptop', 'phone', 'camera'];
  
  for (const query of queries) {
    const response = await productsAPI.searchProducts(query);
    expect(response.status()).toBe(200);
  }
});
```

## Performance Testing

### Response Time Measurement

```typescript
test('measure product API response time @performance', async () => {
  const responseTimes: number[] = [];
  
  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    await productsAPI.getProductById('43');
    responseTimes.push(Date.now() - start);
  }
  
  const metrics = APITestUtils.createPerformanceMetrics(responseTimes);
  
  console.log('Performance Metrics:');
  console.log(`Min: ${metrics.min}ms`);
  console.log(`Max: ${metrics.max}ms`);
  console.log(`Avg: ${metrics.avg}ms`);
  console.log(`Median: ${metrics.median}ms`);
  
  expect(metrics.avg).toBeLessThan(2000);
});
```

### Load Testing

```typescript
test('concurrent API requests @performance', async () => {
  const promises = Array.from({ length: 10 }, () =>
    productsAPI.getAllProducts()
  );
  
  const responses = await Promise.all(promises);
  
  responses.forEach(response => {
    expect(response.status()).toBe(200);
  });
});
```

## Security Testing

### SQL Injection Prevention

```typescript
test('prevent SQL injection @security', async () => {
  const maliciousInput = "admin' OR '1'='1";
  const response = await authAPI.login(maliciousInput, maliciousInput);
  
  // Should not authenticate
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain('warning');
});
```

### XSS Prevention

```typescript
test('prevent XSS attacks @security', async () => {
  const xssPayload = '<script>alert("XSS")</script>';
  const userData = {
    firstname: xssPayload,
    lastname: 'Test',
    email: 'test@example.com',
    password: 'Test@123',
    confirm: 'Test@123',
  };
  
  const response = await authAPI.register(userData);
  
  if (response.status() === 200) {
    const body = await response.text();
    expect(body).not.toContain('<script>');
  }
});
```

### Rate Limiting

```typescript
test('validate rate limiting @security', async () => {
  const attempts = 10;
  const responses: number[] = [];
  
  for (let i = 0; i < attempts; i++) {
    const response = await authAPI.login('test@test.com', 'wrong');
    responses.push(response.status());
  }
  
  // Check if rate limiting kicks in
  console.log('Status codes:', responses);
});
```

## Best Practices

### 1. Use Service Objects

❌ **Don't:**
```typescript
test('get product', async ({ request }) => {
  const response = await request.get('/products/43');
  expect(response.status()).toBe(200);
});
```

✅ **Do:**
```typescript
test('get product', async () => {
  const response = await productsAPI.getProductById('43');
  expect(response.status()).toBe(200);
});
```

### 2. Validate Responses Thoroughly

```typescript
test('validate product structure', async () => {
  const response = await productsAPI.getProductById('43');
  
  // Status
  expect(response.status()).toBe(200);
  
  // Headers
  expect(response.headers()['content-type']).toContain('text/html');
  
  // Body structure
  const body = await response.text();
  expect(body.length).toBeGreaterThan(0);
});
```

### 3. Use Test Data Generators

```typescript
const userData = TestDataGenerator.generateUser();
await authAPI.register(userData);
```

### 4. Clean Up After Tests

```typescript
test.afterEach(async () => {
  await cartAPI.clearCart();
});
```

### 5. Tag Tests Appropriately

```typescript
test('critical user flow @smoke @critical', async () => {
  // Test implementation
});
```

## Troubleshooting

### Common Issues

#### Issue: Tests timing out

**Solution:**
- Increase timeout in config
- Check network connectivity
- Verify API endpoint availability

#### Issue: Flaky tests

**Solution:**
- Add appropriate waits
- Increase retries
- Check for race conditions

#### Issue: Authentication failures

**Solution:**
- Verify credentials
- Check session management
- Review token handling

### Debugging

```typescript
// Enable detailed logging
test('debug API call', async () => {
  const response = await productsAPI.getProductById('43');
  await APITestUtils.logAPICall('GET', '/products/43', response);
});
```

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Maintainer**: Caleb Solomon
