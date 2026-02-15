// Card validation utilities

/**
 * Luhn algorithm for card number validation
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Detect card type from card number
 */
export const getCardType = (cardNumber: string): string => {
  const digits = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  if (/^35/.test(digits)) return 'JCB';
  if (/^(5018|5020|5038|6304|6759|676[1-3])/.test(digits)) return 'Maestro';
  
  return 'Unknown';
};

/**
 * Format card number with spaces
 */
export const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\s/g, '');
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : digits;
};

/**
 * Format expiry date as MM/YY
 */
export const formatExpiryDate = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  
  return digits;
};

/**
 * Validate expiry date (must be future date)
 */
export const validateExpiryDate = (expiry: string): boolean => {
  const [month, year] = expiry.split('/');
  
  if (!month || !year || month.length !== 2 || year.length !== 2) {
    return false;
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(`20${year}`, 10);

  if (monthNum < 1 || monthNum > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (yearNum < currentYear) {
    return false;
  }

  if (yearNum === currentYear && monthNum < currentMonth) {
    return false;
  }

  return true;
};

/**
 * Validate CVV (3 or 4 digits)
 */
export const validateCVV = (cvv: string, cardType: string): boolean => {
  const expectedLength = cardType === 'American Express' ? 4 : 3;
  return /^\d+$/.test(cvv) && cvv.length === expectedLength;
};

/**
 * Validate cardholder name
 */
export const validateCardholderName = (name: string): boolean => {
  return /^[a-zA-Z\s]{2,}$/.test(name.trim());
};

/**
 * Test card numbers for development
 */
export const TEST_CARDS = {
  VISA_SUCCESS: '4111111111111111',
  MASTERCARD_SUCCESS: '5555555555554444',
  AMEX_SUCCESS: '378282246310005',
  CARD_DECLINED: '4000000000000002',
};

/**
 * Check if card is a test card
 */
export const isTestCard = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\s/g, '');
  return Object.values(TEST_CARDS).includes(digits);
};
