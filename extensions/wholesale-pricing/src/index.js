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
 * @typedef {Object} PriceUpdate
 * @property {Object} percentageDecrease - Percentage decrease object
 * @property {number} percentageDecrease.value - Percentage value
 */

/**
 * @typedef {Object} CartLineUpdate
 * @property {string} cartLineId - Cart line ID to update
 * @property {PriceUpdate} price - Price update object
 */

/**
 * @typedef {Object} CartOperation
 * @property {CartLineUpdate} update - Update operation
 */

/**
 * @typedef {Object} FunctionRunResult
 * @property {CartOperation[]} operations - Array of cart operations
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const operations = [];

  // Check if customer has wholesale tag
  const customer = input.cart.buyerIdentity?.customer;
  if (!customer || !customer.tags.includes('wholesale')) {
    return NO_CHANGES;
  }

  // Apply tiered pricing based on quantity
  for (const line of input.cart.lines) {
    const quantity = line.quantity;
    let discountPercentage = 0;

    // Determine discount tier
    if (quantity >= 200) {
      discountPercentage = 20; // 20% off for 200+ units
    } else if (quantity >= 50) {
      discountPercentage = 15; // 15% off for 50-199 units
    } else if (quantity >= 10) {
      discountPercentage = 10; // 10% off for 10-49 units
    }

    // Apply discount if applicable
    if (discountPercentage > 0) {
      operations.push({
        update: {
          cartLineId: line.id,
          price: {
            percentageDecrease: {
              value: discountPercentage
            }
          }
        }
      });
    }
  }

  return {
    operations,
  };
}
