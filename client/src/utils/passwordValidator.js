/**
 * Password Validation Utility for Frontend
 * Provides real-time password validation feedback
 */

/**
 * Validates password and returns detailed feedback
 * @param {string} password - The password to validate
 * @returns {object} - { isValid: boolean, requirements: array of requirement status }
 */
export function getPasswordValidationFeedback(password) {
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
 * Get password strength percentage (0-100)
 * @param {string} password - The password to check
 * @returns {number} - Strength percentage
 */
export function getPasswordStrengthPercentage(password) {
  const feedback = getPasswordValidationFeedback(password);
  const satisfied = feedback.requirements.filter(req => req.satisfied).length;
  return (satisfied / feedback.requirements.length) * 100;
}

/**
 * Get password strength level text
 * @param {string} password - The password to check
 * @returns {string} - 'Weak', 'Fair', 'Good', 'Strong'
 */
export function getPasswordStrengthLevel(password) {
  const percentage = getPasswordStrengthPercentage(password);
  if (percentage === 0) return '';
  if (percentage < 40) return 'Weak';
  if (percentage < 60) return 'Fair';
  if (percentage < 100) return 'Good';
  return 'Strong';
}
