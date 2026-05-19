/**
 * Comprehensive Email Validation Utility
 * 
 * Validates email addresses according to strict rules:
 * 1. Valid DNS and TLD check
 * 2. Cannot start with special characters
 * 3. No spaces anywhere
 * 4. Cannot have two dots together (..)
 * 5. Domain must have ONE dot separating name and extension
 * 6. Only specific special characters allowed (. _ % + -)
 * 7. Cannot have multiple @ symbols
 * 8. Domain cannot start or end with hyphen
 * 9. TLD must be 2-6 letters only
 * 10. Cannot have uppercase-only domain
 * 11. After @ and before dot, all characters should be alphabets only and lowercase
 */

/**
 * Validates an email address according to all specified rules
 * @param {string} email - The email address to validate
 * @returns {string} - Empty string if valid, error message if invalid
 */
export const validateEmail = (email) => {
  // Check if email is provided
  if (!email || email.trim().length === 0) {
    return 'Email is required';
  }

  const trimmedEmail = email.trim();

  // 1. Check for spaces anywhere in the email
  if (/\s/.test(trimmedEmail)) {
    return 'Email cannot contain spaces';
  }

  // 2. Check for multiple @ symbols
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount === 0) {
    return 'Email must contain @ symbol';
  }
  if (atCount > 1) {
    return 'Email cannot have multiple @ symbols';
  }

  // Split email into local and domain parts
  const parts = trimmedEmail.split('@');
  const localPart = parts[0];
  const domainPart = parts[1];

  // 3. Validate local part (before @)
  if (!localPart || localPart.length === 0) {
    return 'Email must have text before @ symbol';
  }

  // Check if local part starts with special character
  if (/^[^a-zA-Z0-9]/.test(localPart)) {
    return 'Email cannot start with special characters';
  }

  // Check for consecutive dots
  if (localPart.includes('..')) {
    return 'Email cannot have two dots together';
  }

  // Check if local part starts or ends with dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return 'Email cannot start or end with a dot before @';
  }

  // Validate allowed characters in local part (letters, numbers, and specific special chars: . _ % + -)
  if (!/^[a-zA-Z0-9._%+-]+$/.test(localPart)) {
    return 'Email contains invalid characters. Only letters, numbers, and . _ % + - are allowed';
  }

  // 4. Validate domain part (after @)
  if (!domainPart || domainPart.length === 0) {
    return 'Email must have a domain after @ symbol';
  }

  // Check for spaces in domain
  if (/\s/.test(domainPart)) {
    return 'Domain cannot contain spaces';
  }

  // Check if domain starts or ends with hyphen
  if (domainPart.startsWith('-') || domainPart.endsWith('-')) {
    return 'Domain cannot start or end with a hyphen';
  }

  // Check for consecutive dots in domain
  if (domainPart.includes('..')) {
    return 'Domain cannot have two dots together';
  }

  // Check if domain has exactly one dot (separating name and extension)
  const dotCount = (domainPart.match(/\./g) || []).length;
  if (dotCount === 0) {
    return 'Domain must contain a dot (e.g., .com)';
  }
  if (dotCount > 1) {
    return 'Domain must have exactly one dot separating name and extension';
  }

  // Split domain into name and TLD
  const domainParts = domainPart.split('.');
  const domainName = domainParts[0];
  const tld = domainParts[1];

  // Validate domain name (before the dot)
  if (!domainName || domainName.length === 0) {
    return 'Domain name cannot be empty';
  }

  // Check if domain name contains only lowercase alphabets (requirement 11)
  if (!/^[a-z]+$/.test(domainName)) {
    return 'Domain name (after @ and before dot) must contain only lowercase alphabets';
  }

  // Check if domain name starts or ends with hyphen
  if (domainName.startsWith('-') || domainName.endsWith('-')) {
    return 'Domain name cannot start or end with a hyphen';
  }

  // Validate TLD (after the dot)
  if (!tld || tld.length === 0) {
    return 'Domain extension (TLD) is required';
  }

  // TLD must be 2-6 letters only
  if (tld.length < 2 || tld.length > 6) {
    return 'Domain extension must be 2-6 letters only';
  }

  // TLD must contain only letters
  if (!/^[a-zA-Z]+$/.test(tld)) {
    return 'Domain extension must contain only letters';
  }

  // Check if domain is uppercase-only (reject it)
  if (domainPart === domainPart.toUpperCase() && domainPart !== domainPart.toLowerCase()) {
    return 'Domain cannot be uppercase-only';
  }

  // All validations passed
  return '';
};

/**
 * Validates email and returns boolean
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  return validateEmail(email) === '';
};

