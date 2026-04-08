const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware that checks express-validator results and returns
 * a clean array of field-level error messages on failure.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const fieldErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return sendError(res, 400, 'Validation failed', fieldErrors);
  }

  return next();
};

module.exports = validate;
