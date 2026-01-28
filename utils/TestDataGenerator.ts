import * as faker from 'faker';

/**
 * Test Data Generator
 * Generates random test data for various test scenarios
 */
export class TestDataGenerator {
  /**
   * Generate random user data
   */
  static generateUser() {
    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email().toLowerCase(),
      password: this.generatePassword(),
      telephone: faker.phone.phoneNumber('##########'),
      company: faker.company.companyName(),
      address1: faker.address.streetAddress(),
      address2: faker.address.secondaryAddress(),
      city: faker.address.city(),
      postCode: faker.address.zipCode(),
      country: 'United States',
      region: faker.address.state(),
    };
  }

  /**
   * Generate secure password
   */
  static generatePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'A'; // Uppercase
    password += 'a'; // Lowercase
    password += '1'; // Number
    password += '!'; // Special char
    
    // Fill remaining characters
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Generate random product search term
   */
  static generateProductSearchTerm(): string {
    const terms = ['laptop', 'phone', 'camera', 'tablet', 'monitor', 'keyboard', 'mouse'];
    return faker.random.arrayElement(terms);
  }

  /**
   * Generate random credit card data (for testing only - not real)
   */
  static generateCreditCard() {
    return {
      cardNumber: '4111111111111111', // Test Visa card
      cardHolder: faker.name.findName(),
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
    };
  }

  /**
   * Generate random review data
   */
  static generateReview() {
    return {
      name: faker.name.findName(),
      review: faker.lorem.paragraph(),
      rating: Math.floor(Math.random() * 5) + 1, // 1-5 stars
    };
  }

  /**
   * Generate unique email with timestamp
   */
  static generateUniqueEmail(): string {
    const timestamp = Date.now();
    return `test.${timestamp}@example.com`;
  }
}
