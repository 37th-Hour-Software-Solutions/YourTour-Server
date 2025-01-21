const { checkSchema, validationResult } = require("express-validator");

/**
 * Creates a validation middleware using express-validator
 * @param {Object} schema - The validation schema to check against
 * @returns {Array} Array of middleware functions for validation
 * @example
 * router.post('/route', validateFields(mySchema), (req, res) => {})
 */
const validateFields = (schema) => {
    return [
        checkSchema(schema),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // Format errors to match API response format
                const formattedErrors = errors.array().map(err => ({
                    [err.path]: err.msg
                }));

                return res.status(400).json({
                    error: true,
                    data: {
                        errors: formattedErrors
                    }
                });
            }
            next();
        }
    ];
};

module.exports = { validateFields };