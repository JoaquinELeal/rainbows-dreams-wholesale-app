// @ts-check

/**
 * @typedef {Object} Customer
 * @property {string[]} tags - Customer tags array
 */

/**
 * @typedef {Object} BuyerIdentity  
 * @property {Customer} [customer] - Optional customer object
 */

/**
 * @typedef {Object} CartLine
 * @property {string} id - Cart line ID
 * @property {number} quantity - Line quantity
 * @property {Object} merchandise - Product/variant information
 * @property {string} merchandise.id - Product variant ID
 */

/**
 * @typedef {Object} Cart
 * @property {BuyerIdentity} [buyerIdentity] - Optional buyer identity
 * @property {CartLine[]} lines - Array of cart lines
 */

/**
 * @typedef {Object} RunInput
 * @property {Cart} cart - The shopping cart
 */

/**
 * @typedef {Object} DiscountApplication
 * @property {string} title - Discount title
 * @property {Object} value - Discount value
 * @property {string} value.percentage - Percentage discount (e.g., "10.0")
 * @property {string[]} targets - Array of cart line IDs to apply discount to
 */

/**
 * @typedef {Object} CartOperation
 * @property {string} update - Operation type (e.g., "updateDiscountApplications")
 * @property {DiscountApplication[]} discountApplications - Array of discount applications
 */

/**
 * @typedef {Object} FunctionRunResult
 * @property {CartOperation[]} operations - Array of cart operations
 */

export {};
