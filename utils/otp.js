/**
 * Generates a random numeric OTP of specified length
 * @param {number} length - Length of the OTP (default: 6)
 * @returns {string} - The generated OTP
 */
function generateOTP(length = 6) {
  // Generate a random number between 0 and 999999
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = Math.floor(min + Math.random() * (max - min + 1))
    .toString()
    .padStart(length, '0');
  
  return otp;
}

/**
 * Validates if the provided OTP matches the expected OTP
 * @param {string} providedOTP - The OTP provided by the user
 * @param {string} expectedOTP - The OTP that was generated
 * @returns {boolean} - Whether the OTPs match
 */
function validateOTP(providedOTP, expectedOTP) {
  return providedOTP === expectedOTP;
}

module.exports = {
  generateOTP,
  validateOTP
};
