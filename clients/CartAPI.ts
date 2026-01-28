import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseAPIClient } from './BaseAPIClient';

/**
 * Cart API Client
 * Handles all shopping cart API operations
 */
export class CartAPI extends BaseAPIClient {
  private sessionToken?: string;

  constructor(request: APIRequestContext) {
    super(request);
  }

  /**
   * Set session token
   */
  setSessionToken(token: string): void {
    this.sessionToken = token;
  }

  /**
   * Get cart contents
   */
  async getCart(): Promise<APIResponse> {
    this.logRequest('GET', '/cart');
    
    const response = await this.get('/index.php?route=checkout/cart', {
      headers: this.getAuthHeaders(),
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Add item to cart
   */
  async addToCart(productId: string | number, quantity: number = 1, options?: any): Promise<APIResponse> {
    this.logRequest('POST', '/cart/add', { productId, quantity });
    
    const response = await this.post('/index.php?route=checkout/cart/add', {
      data: {
        product_id: productId,
        quantity: quantity,
        option: options || {},
      },
      headers: this.getAuthHeaders(),
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    cartItemId: string,
    quantity: number
  ): Promise<APIResponse> {
    this.logRequest('PUT', `/cart/${cartItemId}`, { quantity });
    
    const response = await this.post('/index.php?route=checkout/cart/edit', {
      data: {
        key: cartItemId,
        quantity: quantity,
      },
      headers: this.getAuthHeaders(),
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId: string): Promise<APIResponse> {
    this.logRequest('DELETE', `/cart/${cartItemId}`);
    
    const response = await this.get('/index.php?route=checkout/cart/remove', {
      params: { key: cartItemId },
      headers: this.getAuthHeaders(),
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Clear cart
   */
  async clearCart(): Promise<APIResponse> {
    this.logRequest('POST', '/cart/clear');
    
    const response = await this.get('/index.php?route=checkout/cart/remove', {
      headers: this.getAuthHeaders(),
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Apply coupon code
   */
  async applyCoupon(couponCode: string): Promise<APIResponse> {
    this.logRequest('POST', '/cart/coupon', { couponCode });
    
    const response = await this.post('/index.php?route=extension/total/coupon/coupon', {
      data: { coupon: couponCode },
      headers: this.getAuthHeaders(),
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Remove coupon
   */
  async removeCoupon(): Promise<APIResponse> {
    this.logRequest('DELETE', '/cart/coupon');
    
    const response = await this.get('/index.php?route=extension/total/coupon/coupon', {
      headers: this.getAuthHeaders(),
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Get cart totals
   */
  async getCartTotals(): Promise<APIResponse> {
    this.logRequest('GET', '/cart/totals');
    
    const response = await this.get('/index.php?route=checkout/cart', {
      headers: this.getAuthHeaders(),
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Calculate shipping
   */
  async calculateShipping(shippingData: {
    country_id: string;
    zone_id: string;
    postcode: string;
  }): Promise<APIResponse> {
    this.logRequest('POST', '/cart/shipping', shippingData);
    
    const response = await this.post('/index.php?route=extension/total/shipping/shipping', {
      data: shippingData,
      headers: this.getAuthHeaders(),
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Get shipping methods
   */
  async getShippingMethods(): Promise<APIResponse> {
    this.logRequest('GET', '/cart/shipping-methods');
    
    const response = await this.get('/index.php?route=extension/total/shipping/quote', {
      headers: this.getAuthHeaders(),
    });
    
    await this.logResponse(response);
    return response;
  }

  /**
   * Verify cart structure
   */
  async verifyCartStructure(response: APIResponse): Promise<void> {
    const body = await response.json();
    
    // Basic cart structure validation
    if (body.products && Array.isArray(body.products)) {
      if (body.products.length > 0) {
        const product = body.products[0];
        await this.verifyJSONSchema(response, {
          cart_id: 'string',
          product_id: 'string',
          name: 'string',
          quantity: 'number',
          price: 'string',
        });
      }
    }
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    
    if (this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }
    
    return headers;
  }
}
