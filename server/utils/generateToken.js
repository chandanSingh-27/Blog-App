import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for the given user ID.
 * @param {string} userId - The MongoDB user ID
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export default generateToken;
