import { validationResult } from 'express-validator';

/**
 * Middleware: Check express-validator results.
 * If there are errors, respond with 422 and the first error message.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

export default validate;
