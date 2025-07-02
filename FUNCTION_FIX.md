# Fix for Shopify Function API Import Issue

## Problem
The Shopify Function `extensions/wholesale-pricing/src/index.js` was trying to import types from `../generated/api` which didn't exist, causing the error:
```
Cannot find module '../generated/api' or its corresponding type declarations.
```

## Solution
Replaced the external import statements with inline TypeScript JSDoc type definitions that match the actual function implementation.

### Before:
```javascript
/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").CartOperation} CartOperation
 */
```

### After:
```javascript
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
```

## Result
- ✅ No more import errors
- ✅ TypeScript checks pass
- ✅ Function builds successfully
- ✅ Main project builds successfully

The Shopify Function now has proper type definitions that match its actual implementation for applying wholesale pricing discounts.
