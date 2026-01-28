import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseAPIClient } from './BaseAPIClient';

/**
 * Products API Client
 * Handles all product-related API operations
 */
export class ProductsAPI extends BaseAPIClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  /**
   * Get all products
   */
  async getAllProducts(params?: {
    limit?: number;
    offset?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<APIResponse> {
    this.logRequest('GET', '/products');
    
    const response = await this.get('/index.php?route=api/product', {
      params: {
        limit: params?.limit || 20,
        start: params?.offset || 0,
        sort: params?.sort || 'p.sort_order',
        order: params?.order || 'asc',
      },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string | number): Promise<APIResponse> {
    this.logRequest('GET', `/products/${productId}`);
    
    const response = await this.get('/index.php?route=api/product', {
      params: { product_id: productId },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Search products
   */
  async searchProducts(query: string, params?: {
    limit?: number;
    categoryId?: number;
  }): Promise<APIResponse> {
    this.logRequest('GET', `/products/search?q=${query}`);
    
    const response = await this.get('/index.php?route=product/search', {
      params: {
        search: query,
        limit: params?.limit || 20,
        category_id: params?.categoryId || 0,
      },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: number, params?: {
    limit?: number;
    offset?: number;
  }): Promise<APIResponse> {
    this.logRequest('GET', `/categories/${categoryId}/products`);
    
    const response = await this.get('/index.php?route=product/category', {
      params: {
        path: categoryId,
        limit: params?.limit || 20,
        start: params?.offset || 0,
      },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit?: number): Promise<APIResponse> {
    this.logRequest('GET', '/products/featured');
    
    const response = await this.get('/index.php?route=extension/module/featured', {
      params: { limit: limit || 10 },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Get product reviews
   */
  async getProductReviews(productId: string | number): Promise<APIResponse> {
    this.logRequest('GET', `/products/${productId}/reviews`);
    
    const response = await this.get('/index.php?route=product/product/review', {
      params: { product_id: productId },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Create product review
   */
  async createProductReview(productId: string | number, reviewData: {
    name: string;
    text: string;
    rating: number;
  }): Promise<APIResponse> {
    this.logRequest('POST', `/products/${productId}/reviews`, reviewData);
    
    const response = await this.post('/index.php?route=product/product/write', {
      data: {
        product_id: productId,
        name: reviewData.name,
        text: reviewData.text,
        rating: reviewData.rating,
      },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Get related products
   */
  async getRelatedProducts(productId: string | number): Promise<APIResponse> {
    this.logRequest('GET', `/products/${productId}/related`);
    
    const response = await this.get('/index.php?route=product/product', {
      params: { product_id: productId },
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Check product availability
   */
  async checkProductAvailability(productId: string | number): Promise<APIResponse> {
    const response = await this.getProductById(productId);
    return response;
  }

  /**
   * Verify product structure
   */
  async verifyProductStructure(response: APIResponse): Promise<void> {
    await this.verifyJSONSchema(response, {
      product_id: 'string',
      name: 'string',
      price: 'string',
      description: 'string',
    });
  }
}
