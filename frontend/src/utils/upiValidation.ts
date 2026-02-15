// UPI validation utilities

/**
 * Valid UPI handles
 */
const VALID_UPI_HANDLES = [
  'paytm',
  'gpay',
  'phonepe',
  'ybl',
  'okaxis',
  'okhdfcbank',
  'okicici',
  'oksbi',
  'ibl',
  'axl',
  'upi',
];

/**
 * Validate UPI ID format
 * Format: name@bank or mobilenumber@bank
 */
export const validateUPI = (upiId: string): boolean => {
  const upiRegex = /^[\w\.-]+@[a-zA-Z]{2,}$/;
  
  if (!upiRegex.test(upiId)) {
    return false;
  }

  const [_, handle] = upiId.split('@');
  
  // Check if handle is in valid list
  return VALID_UPI_HANDLES.includes(handle.toLowerCase());
};

/**
 * Get UPI provider from handle
 */
export const getUPIProvider = (upiId: string): string => {
  const handle = upiId.split('@')[1]?.toLowerCase();
  
  const providers: { [key: string]: string } = {
    paytm: 'Paytm',
    gpay: 'Google Pay',
    phonepe: 'PhonePe',
    ybl: 'PhonePe',
    okaxis: 'Axis Bank',
    okhdfcbank: 'HDFC Bank',
    okicici: 'ICICI Bank',
    oksbi: 'SBI',
    ibl: 'IDBI Bank',
    axl: 'Axis Bank',
    upi: 'Generic UPI',
  };

  return providers[handle] || 'UPI';
};

/**
 * Test UPI IDs for development
 */
export const TEST_UPI_IDS = {
  SUCCESS: 'test@paytm',
  GPAY: 'success@gpay',
  PHONEPE: 'test@phonepe',
  DECLINED: 'fail@paytm',
};

/**
 * Check if UPI ID is a test ID
 */
export const isTestUPI = (upiId: string): boolean => {
  return Object.values(TEST_UPI_IDS).includes(upiId.toLowerCase());
};
