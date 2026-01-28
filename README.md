# RESTful API Test Suite

[![Playwright](https://img.shields.io/badge/Playwright-1.40-green)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![API Testing](https://img.shields.io/badge/API-Testing-orange)](https://playwright.dev/docs/api-testing)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A **production-ready REST API testing framework** built with Playwright and TypeScript, implementing the **Service Objects Pattern** for maintainable and scalable API test automation.

## 🎯 Features

- ✅ **Service Objects Pattern** - Clean separation of API clients and tests
- ✅ **TypeScript** - Full type safety and IntelliSense support
- ✅ **Comprehensive Coverage** - Products, Cart, Authentication APIs
- ✅ **Performance Testing** - Built-in response time measurement
- ✅ **Security Testing** - SQL injection, XSS, rate limiting tests
- ✅ **Parallel Execution** - Fast test execution with multiple workers
- ✅ **Multiple Reporters** - HTML, JSON, JUnit, Allure
- ✅ **CI/CD Ready** - GitHub Actions workflow included
- ✅ **Request/Response Logging** - Detailed API call tracking
- ✅ **Retry Logic** - Automatic retries for flaky tests
- ✅ **Schema Validation** - JSON response structure verification

## 📁 Project Structure

```
restful-api-test-suite/
├── clients/                  # API Service Objects
│   ├── BaseAPIClient.ts     # Base HTTP client with common methods
│   ├── ProductsAPI.ts       # Products API client
│   ├── CartAPI.ts           # Shopping cart API client
│   ├── AuthAPI.ts           # Authentication API client
│   └── APITestUtils.ts      # Test utilities and helpers
├── tests/                    # API Test Specifications
│   ├── products.api.spec.ts # Product API tests (15 tests)
│   ├── cart.api.spec.ts     # Cart API tests (18 tests)
│   └── auth.api.spec.ts     # Authentication tests (20 tests)
├── utils/                    # Shared Utilities
│   ├── TestDataGenerator.ts # Test data generation
│   └── TestHelpers.ts       # Common helper functions
├── docs/                     # Documentation
│   └── API_TESTING_GUIDE.md # Comprehensive testing guide
├── .github/workflows/        # CI/CD Configuration
│   └── api-tests.yml        # GitHub Actions workflow
├── playwright.config.ts      # Playwright configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── .env.example             # Environment variables template
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/restful-api-test-suite.git
cd restful-api-test-suite

# Install dependencies
npm install

# Install Playwright
npx playwright install

# Configure environment
cp .env.example .env
# Edit .env with your API configuration
```

### Running Tests

```bash
# Run all API tests
npm test

# Run specific test suite
npm run test:products
npm run test:cart
npm run test:auth

# Run by category
npm run test:smoke          # Smoke tests only
npm run test:performance    # Performance tests only
npm run test:security       # Security tests only

# Run with UI mode
npm run test:ui

# Debug mode
npm run test:debug
```

## 📊 Test Coverage

### Total Tests: 53 API Tests

#### Products API (15 tests)
- ✅ GET all products with pagination
- ✅ GET product by ID
- ✅ Search products by keyword
- ✅ Filter products by category
- ✅ Get featured products
- ✅ Invalid product ID handling
- ✅ Empty search results
- ✅ Performance testing (concurrent requests)
- ✅ Stress testing (10 sequential requests)

#### Cart API (18 tests)
- ✅ Add product to cart
- ✅ Add multiple quantities
- ✅ Update cart item quantity
- ✅ Remove item from cart
- ✅ Clear cart
- ✅ Apply coupon code
- ✅ Remove coupon
- ✅ Calculate shipping
- ✅ Get shipping methods
- ✅ Invalid product handling
- ✅ Zero/negative quantity validation
- ✅ Concurrent cart operations

#### Authentication API (20 tests)
- ✅ User login (valid/invalid)
- ✅ User registration
- ✅ Logout
- ✅ Password reset flow
- ✅ Profile management
- ✅ Email validation
- ✅ Duplicate email prevention
- ✅ Password mismatch handling
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ Rate limiting
- ✅ Security testing

## 🏗️ Architecture

### Service Objects Pattern

```
┌─────────────┐
│   Test      │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ API Client  │  (ProductsAPI, CartAPI, AuthAPI)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│BaseAPIClient│  (Common HTTP methods)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Playwright │  (HTTP requests)
│ APIRequest   │
└─────────────┘
```

### Key Components

#### BaseAPIClient
Foundation class providing:
- HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Response validation
- Header management
- JSON parsing
- Error handling
- Request/response logging

#### API Clients (Service Objects)
Specialized clients for each API domain:
- **ProductsAPI** - Product catalog operations
- **CartAPI** - Shopping cart management
- **AuthAPI** - User authentication

#### APITestUtils
Comprehensive test utilities:
- Response validation
- Performance measurement
- Schema validation
- Data generation
- Logging utilities

## 📝 Writing Tests

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test';
import { ProductsAPI } from '../clients/ProductsAPI';

test.describe('Products API', () => {
  let productsAPI: ProductsAPI;

  test.beforeEach(async ({ request }) => {
    productsAPI = new ProductsAPI(request);
  });

  test('should get product by ID', async () => {
    const response = await productsAPI.getProductById('43');
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('product_id');
  });
});
```

### Performance Testing Example

```typescript
test('measure API response time @performance', async () => {
  const responseTimes: number[] = [];
  
  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    await productsAPI.getAllProducts();
    responseTimes.push(Date.now() - start);
  }
  
  const metrics = APITestUtils.createPerformanceMetrics(responseTimes);
  expect(metrics.avg).toBeLessThan(2000);
});
```

### Security Testing Example

```typescript
test('prevent SQL injection @security', async () => {
  const maliciousInput = "admin' OR '1'='1";
  const response = await authAPI.login(maliciousInput, maliciousInput);
  
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain('warning');
});
```

## 🎨 Best Practices

### 1. Service Objects
✅ Encapsulate API logic in client classes
✅ Keep tests focused on assertions
✅ Reuse clients across tests

### 2. Test Organization
✅ Group related tests with `test.describe()`
✅ Use descriptive test names
✅ Tag tests for filtering (@smoke, @regression)

### 3. Data Management
✅ Generate dynamic test data
✅ Avoid hardcoded values
✅ Clean up after tests

### 4. Assertions
✅ Validate status codes
✅ Verify response structure
✅ Check business logic
✅ Measure performance

### 5. Error Handling
✅ Test error scenarios
✅ Validate error messages
✅ Check error codes
✅ Handle timeouts gracefully

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# API Configuration
API_BASE_URL=https://demo.opencart.com
API_TIMEOUT=30000

# Test Settings
WORKERS=4
RETRIES=1
HEADLESS=true

# Credentials (for testing)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Test@123
```

### Playwright Config

Key settings in `playwright.config.ts`:

```typescript
export default defineConfig({
  timeout: 60000,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
  
  projects: [
    { name: 'api', testMatch: /.*\.api\.spec\.ts/ },
    { name: 'api-smoke', grep: /@smoke/ },
    { name: 'api-performance', grep: /@performance/ },
  ],
});
```

## 📈 Reporting

### HTML Report
```bash
npm test
npm run report
```

### Allure Report
```bash
npm test
npm run report:allure
```

### CI/CD Reports
- JUnit XML for CI integration
- JSON for custom processing
- HTML for human review

## 🔄 CI/CD Integration

### GitHub Actions

`.github/workflows/api-tests.yml`:

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## 🧪 Test Categories

### Functional Tests
- Endpoint validation
- CRUD operations
- Business logic verification
- Error handling

### Performance Tests
- Response time measurement
- Load testing
- Stress testing
- Concurrent requests

### Security Tests
- Input validation
- SQL injection prevention
- XSS prevention
- Authentication checks
- Rate limiting

## 📚 Documentation

- [API Testing Guide](docs/API_TESTING_GUIDE.md) - Comprehensive guide
- [Service Objects Pattern](docs/SERVICE_OBJECTS.md) - Architecture details
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 👨‍💻 Author

**Caleb Solomon**
- Principal QA Technical Lead
- 12+ years in Quality Engineering
- Specializing in API Test Automation

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- Test API: [OpenCart Demo](https://demo.opencart.com/)
- Inspired by industry best practices

## 📧 Support

For questions or issues, please open an issue on GitHub.

---

**Happy API Testing! 🚀**
