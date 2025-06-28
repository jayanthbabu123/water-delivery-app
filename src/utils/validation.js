// Utility for Indian mobile number validation
export function isValidIndianMobile(number) {
  // Remove any non-digit characters
  const cleaned = number.replace(/\D/g, "");
  // Indian numbers: 10 digits, start with 6-9
  return /^([6-9][0-9]{9})$/.test(cleaned);
}
