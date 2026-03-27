/**
 * Password Validation Utility
 * Enforces strong password rules for NEW account registrations and password updates
 * IMPORTANT: Does NOT validate passwords during login (backward compatibility)
 */

// Strong password regex pattern:
// - At least 8 characters
// - At least 1 uppercase letter (A-Z)
// - At least 1 lowercase letter (a-z)
// - At least 1 digit (0-9)
// - At least 1 special character (!@#$%^&*)
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

/**
 * Validates if a password meets strong password requirements
 * @param {string} password - The password to validate
 * @returns {object} - { isValid: boolean, errors: array of missing requirements }
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required']
    };
  }

  // Check length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  // Check for digit
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  // Check for special character
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets detailed validation feedback for frontend display
 * @param {string} password - The password to validate
 * @returns {object} - { isValid: boolean, requirements: array of requirement status }
 */
function getPasswordValidationFeedback(password) {
  if (!password) {
    return {
      isValid: false,
      requirements: [
        { rule: 'At least 8 characters', satisfied: false },
        { rule: 'One uppercase letter (A-Z)', satisfied: false },
        { rule: 'One lowercase letter (a-z)', satisfied: false },
        { rule: 'One number (0-9)', satisfied: false },
        { rule: 'One special character (!@#$%^&*)', satisfied: false }
      ]
    };
  }

  const requirements = [
    {
      rule: 'At least 8 characters',
      satisfied: password.length >= 8
    },
    {
      rule: 'One uppercase letter (A-Z)',
      satisfied: /[A-Z]/.test(password)
    },
    {
      rule: 'One lowercase letter (a-z)',
      satisfied: /[a-z]/.test(password)
    },
    {
      rule: 'One number (0-9)',
      satisfied: /\d/.test(password)
    },
    {
      rule: 'One special character (!@#$%^&*)',
      satisfied: /[@$!%*?&]/.test(password)
    }
  ];

  const isValid = requirements.every(req => req.satisfied);

  return {
    isValid,
    requirements
  };
}

/**
 * Throws an error if password doesn't meet strong password requirements
 * Used in backend validation
 * @param {string} password - The password to validate
 * @throws {Error} - If password doesn't meet requirements
 */
function validateStrongPassword(password) {
  const validation = validatePasswordStrength(password);
  if (!validation.isValid) {
    throw new Error(
      `Password must be at least 8 characters long and include uppercase, lowercase, number, and special character (!@#$%^&*). Issues: ${validation.errors.join('; ')}`
    );
  }
}

module.exports = {
  STRONG_PASSWORD_REGEX,
  validatePasswordStrength,
  getPasswordValidationFeedback,
  validateStrongPassword
};
