/**
 * Phone Validation Utilities for Indian Mobile Numbers
 *
 * This utility provides comprehensive validation and formatting
 * for Indian mobile numbers supporting various input formats.
 */

// Indian mobile number patterns
const INDIAN_MOBILE_PATTERNS = {
  // Standard 10-digit mobile number starting with 6, 7, 8, or 9
  BASIC: /^[6-9]\d{9}$/,

  // With leading zero: 09876543210
  WITH_ZERO: /^0[6-9]\d{9}$/,

  // With country code 91: 919876543210
  WITH_91: /^91[6-9]\d{9}$/,

  // With country code +91: +919876543210
  WITH_PLUS_91: /^\+91[6-9]\d{9}$/,

  // With spaces/hyphens: +91 98765 43210, +91-98765-43210, etc.
  WITH_SEPARATORS: /^(\+91[\s\-]?|91[\s\-]?|0[\s\-]?)?[6-9][\s\-]?\d{4}[\s\-]?\d{5}$/,
};

// Valid starting digits for Indian mobile numbers
const VALID_STARTING_DIGITS = ['6', '7', '8', '9'];

// Telecom operator prefixes (first 4-5 digits after country code)
const TELECOM_OPERATORS = {
  // Airtel
  AIRTEL: ['9040', '9439', '9738', '9831', '9956', '9733', '9883', '9932', '7077', '7008'],

  // Jio
  JIO: ['8902', '8297', '8655', '9977', '9825', '8460', '8619', '9119', '7619', '6299'],

  // Vi (Vodafone Idea)
  VI: ['9827', '9826', '9425', '9893', '9303', '9584', '9785', '8435', '7869', '6264'],

  // BSNL/MTNL
  BSNL: ['9415', '9936', '9454', '9935', '8318', '8400', '7499', '6395', '6390', '6393'],
};

/**
 * Clean phone number by removing all non-digit characters
 * @param {string} phoneNumber - Input phone number
 * @returns {string} - Cleaned phone number with only digits
 */
export const cleanPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  return phoneNumber.toString().replace(/\D/g, '');
};

/**
 * Extract 10-digit mobile number from various input formats
 * @param {string} phoneNumber - Input phone number in any format
 * @returns {string} - 10-digit mobile number or empty string if invalid
 */
export const extractMobileNumber = (phoneNumber) => {
  const cleaned = cleanPhoneNumber(phoneNumber);

  // Handle different length scenarios
  if (cleaned.length === 10) {
    // Direct 10-digit number: 9876543210
    return cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // With leading zero: 09876543210
    return cleaned.substring(1);
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // With country code: 919876543210
    return cleaned.substring(2);
  } else if (cleaned.length === 13 && cleaned.startsWith('91')) {
    // Edge case: sometimes +91 becomes 91 with extra digit
    return cleaned.substring(2, 12);
  }

  return '';
};

/**
 * Validate if the phone number is a valid Indian mobile number
 * @param {string} phoneNumber - Phone number to validate
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateIndianMobileNumber = (phoneNumber) => {
  const result = {
    isValid: false,
    error: null,
    formattedNumber: null,
    displayNumber: null,
  };

  // Check if phone number is provided
  if (!phoneNumber || phoneNumber.trim() === '') {
    result.error = 'Phone number is required';
    return result;
  }

  // Extract 10-digit number
  const mobileNumber = extractMobileNumber(phoneNumber);

  // Check if we got a valid 10-digit number
  if (!mobileNumber || mobileNumber.length !== 10) {
    result.error = 'Please enter a valid 10-digit Indian mobile number';
    return result;
  }

  // Check if it starts with valid digits (6, 7, 8, 9)
  if (!VALID_STARTING_DIGITS.includes(mobileNumber[0])) {
    result.error = 'Indian mobile numbers must start with 6, 7, 8, or 9';
    return result;
  }

  // Additional validation: check for obviously invalid patterns
  if (isInvalidPattern(mobileNumber)) {
    result.error = 'Please enter a valid mobile number';
    return result;
  }

  // All validations passed
  result.isValid = true;
  result.formattedNumber = `+91${mobileNumber}`;
  result.displayNumber = formatForDisplay(mobileNumber);

  return result;
};

/**
 * Check for obviously invalid patterns
 * @param {string} mobileNumber - 10-digit mobile number
 * @returns {boolean} - True if pattern is invalid
 */
const isInvalidPattern = (mobileNumber) => {
  // Check for repeated digits (e.g., 9999999999)
  if (/^(\d)\1{9}$/.test(mobileNumber)) {
    return true;
  }

  // Check for sequential patterns (e.g., 9876543210, 1234567890)
  if (isSequentialPattern(mobileNumber)) {
    return true;
  }

  // Check for alternating patterns (e.g., 9090909090)
  if (/^(\d)(\d)\1\2\1\2\1\2\1\2$/.test(mobileNumber)) {
    return true;
  }

  return false;
};

/**
 * Check if number follows sequential pattern
 * @param {string} number - 10-digit number
 * @returns {boolean} - True if sequential
 */
const isSequentialPattern = (number) => {
  const digits = number.split('').map(Number);

  // Check ascending sequence
  let isAscending = true;
  let isDescending = true;

  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i-1] + 1) {
      isAscending = false;
    }
    if (digits[i] !== digits[i-1] - 1) {
      isDescending = false;
    }
  }

  return isAscending || isDescending;
};

/**
 * Format phone number for display
 * @param {string} mobileNumber - 10-digit mobile number
 * @returns {string} - Formatted display number (e.g., +91 98765 43210)
 */
export const formatForDisplay = (mobileNumber) => {
  if (!mobileNumber || mobileNumber.length !== 10) {
    return mobileNumber;
  }

  return `+91 ${mobileNumber.slice(0, 5)} ${mobileNumber.slice(5)}`;
};

/**
 * Format phone number for international use
 * @param {string} phoneNumber - Input phone number
 * @returns {string} - International format (+919876543210)
 */
export const formatForInternational = (phoneNumber) => {
  const validation = validateIndianMobileNumber(phoneNumber);
  return validation.isValid ? validation.formattedNumber : '';
};

/**
 * Get telecom operator based on mobile number prefix
 * @param {string} mobileNumber - 10-digit mobile number
 * @returns {string} - Operator name or 'Unknown'
 */
export const getTelecomOperator = (mobileNumber) => {
  if (!mobileNumber || mobileNumber.length !== 10) {
    return 'Unknown';
  }

  const prefix4 = mobileNumber.substring(0, 4);
  const prefix5 = mobileNumber.substring(0, 5);

  // Check 4-digit prefixes first, then 5-digit
  for (const [operator, prefixes] of Object.entries(TELECOM_OPERATORS)) {
    if (prefixes.includes(prefix4) || prefixes.includes(prefix5)) {
      return operator;
    }
  }

  return 'Unknown';
};

/**
 * Mask phone number for privacy (e.g., +91 98765 ***10)
 * @param {string} phoneNumber - Phone number to mask
 * @param {number} visibleDigits - Number of digits to show at the end (default: 2)
 * @returns {string} - Masked phone number
 */
export const maskPhoneNumber = (phoneNumber, visibleDigits = 2) => {
  const validation = validateIndianMobileNumber(phoneNumber);

  if (!validation.isValid) {
    return phoneNumber;
  }

  const mobileNumber = extractMobileNumber(phoneNumber);
  const maskedPart = '*'.repeat(10 - visibleDigits);
  const visiblePart = mobileNumber.slice(-visibleDigits);

  return `+91 ${maskedPart.slice(0, 5)} ${maskedPart.slice(5)}${visiblePart}`;
};

/**
 * Generate test phone numbers for development
 * @param {number} count - Number of test numbers to generate
 * @returns {Array} - Array of valid test phone numbers
 */
export const generateTestNumbers = (count = 5) => {
  const testNumbers = [];
  const startingDigits = ['6', '7', '8', '9'];

  for (let i = 0; i < count; i++) {
    const start = startingDigits[Math.floor(Math.random() * startingDigits.length)];
    const remaining = Math.floor(Math.random() * 900000000) + 100000000;
    testNumbers.push(`${start}${remaining.toString().padStart(9, '0')}`);
  }

  return testNumbers;
};

/**
 * Check if phone number belongs to a specific state/region
 * @param {string} mobileNumber - 10-digit mobile number
 * @returns {string} - State/region or 'Unknown'
 */
export const getRegionFromNumber = (mobileNumber) => {
  // This is a simplified mapping - actual implementation would require
  // comprehensive database of number series allocation
  if (!mobileNumber || mobileNumber.length !== 10) {
    return 'Unknown';
  }

  const prefix = mobileNumber.substring(0, 4);

  // Sample mappings (not exhaustive)
  const regionMappings = {
    '9040': 'Delhi',
    '9831': 'West Bengal',
    '9825': 'Gujarat',
    '9884': 'Tamil Nadu',
    '9449': 'Karnataka',
    '9823': 'Maharashtra',
    '9415': 'Uttar Pradesh',
    '9861': 'Odisha',
  };

  return regionMappings[prefix] || 'India';
};

/**
 * Comprehensive phone number validation with detailed response
 * @param {string} phoneNumber - Phone number to validate
 * @returns {Object} - Detailed validation result
 */
export const validateWithDetails = (phoneNumber) => {
  const basicValidation = validateIndianMobileNumber(phoneNumber);

  if (!basicValidation.isValid) {
    return basicValidation;
  }

  const mobileNumber = extractMobileNumber(phoneNumber);

  return {
    ...basicValidation,
    details: {
      operator: getTelecomOperator(mobileNumber),
      region: getRegionFromNumber(mobileNumber),
      maskedNumber: maskPhoneNumber(phoneNumber),
      internationalFormat: basicValidation.formattedNumber,
      localFormat: mobileNumber,
    },
  };
};

// Export default validation function for convenience
export default validateIndianMobileNumber;
