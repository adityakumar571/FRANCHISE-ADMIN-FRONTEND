/* eslint-disable prettier/prettier */
/**
 * Scheme Calculator - Calculate effective rates with schemes
 * Supports: Buy X Get Y, Percentage discounts, Flat discounts
 */

/**
 * Parse and calculate effective PTR after applying scheme
 * @param {number} ptr - Base PTR
 * @param {string} scheme - Scheme text (e.g., "10+2", "5%", "Buy 10 Get 2 Free")
 * @returns {object} { effectivePTR, savings, schemeType, details }
 */
export const calculateEffectiveRate = (ptr, scheme) => {
  if (!scheme || !ptr || ptr === 0) {
    return {
      effectivePTR: ptr,
      savings: 0,
      schemeType: 'none',
      details: null,
    }
  }

  const ptrNum = Number(ptr)
  if (isNaN(ptrNum)) {
    return {
      effectivePTR: ptr,
      savings: 0,
      schemeType: 'invalid',
      details: null,
    }
  }

  const schemeStr = String(scheme).trim()

  // Pattern 1: "10+2" or "Buy 10 Get 2" format
  const plusPattern = /(\d+)\s*\+\s*(\d+)/
  const buyGetPattern = /buy\s+(\d+)\s+get\s+(\d+)/i
  const getPattern = /(\d+)\s*get\s*(\d+)/i

  if (plusPattern.test(schemeStr)) {
    const [, buy, free] = schemeStr.match(plusPattern)
    return calculateBuyGetScheme(ptrNum, parseInt(buy), parseInt(free))
  }

  if (buyGetPattern.test(schemeStr)) {
    const [, buy, free] = schemeStr.match(buyGetPattern)
    return calculateBuyGetScheme(ptrNum, parseInt(buy), parseInt(free))
  }

  if (getPattern.test(schemeStr)) {
    const [, buy, free] = schemeStr.match(getPattern)
    return calculateBuyGetScheme(ptrNum, parseInt(buy), parseInt(free))
  }

  // Pattern 2: "5%" or "5% discount" format
  const percentPattern = /(\d+(?:\.\d+)?)\s*%/
  if (percentPattern.test(schemeStr)) {
    const [, percent] = schemeStr.match(percentPattern)
    return calculatePercentDiscount(ptrNum, parseFloat(percent))
  }

  // Pattern 3: "₹50 off" or "Flat ₹50" format
  const flatPattern = /(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)/i
  if (flatPattern.test(schemeStr)) {
    const [, amount] = schemeStr.match(flatPattern)
    return calculateFlatDiscount(ptrNum, parseFloat(amount))
  }

  // Pattern 4: "MRP to Retailer" or "Net Rate" - no additional discount
  if (/mrp|net|rate/i.test(schemeStr)) {
    return {
      effectivePTR: ptrNum,
      savings: 0,
      schemeType: 'net_rate',
      details: {
        description: 'Net rate - no additional scheme',
      },
    }
  }

  // Unable to parse - return original PTR
  return {
    effectivePTR: ptrNum,
    savings: 0,
    schemeType: 'unparsed',
    details: {
      original: schemeStr,
      note: 'Unable to calculate scheme',
    },
  }
}

/**
 * Calculate Buy X Get Y scheme
 */
const calculateBuyGetScheme = (ptr, buy, free) => {
  if (buy <= 0 || free <= 0) {
    return {
      effectivePTR: ptr,
      savings: 0,
      schemeType: 'invalid_buy_get',
      details: null,
    }
  }

  const totalUnits = buy + free
  const effectivePTR = (ptr * buy) / totalUnits
  const savings = ptr - effectivePTR
  const savingsPercent = (savings / ptr) * 100

  return {
    effectivePTR: Number(effectivePTR.toFixed(2)),
    savings: Number(savings.toFixed(2)),
    savingsPercent: Number(savingsPercent.toFixed(2)),
    schemeType: 'buy_get',
    details: {
      buy,
      free,
      totalUnits,
      description: `Buy ${buy} Get ${free} Free`,
      perUnitSaving: Number((savings).toFixed(2)),
    },
  }
}

/**
 * Calculate percentage discount
 */
const calculatePercentDiscount = (ptr, percent) => {
  if (percent <= 0 || percent >= 100) {
    return {
      effectivePTR: ptr,
      savings: 0,
      schemeType: 'invalid_percent',
      details: null,
    }
  }

  const discount = ptr * (percent / 100)
  const effectivePTR = ptr - discount

  return {
    effectivePTR: Number(effectivePTR.toFixed(2)),
    savings: Number(discount.toFixed(2)),
    savingsPercent: Number(percent.toFixed(2)),
    schemeType: 'percent',
    details: {
      percent,
      description: `${percent}% discount`,
    },
  }
}

/**
 * Calculate flat discount
 */
const calculateFlatDiscount = (ptr, amount) => {
  if (amount <= 0 || amount >= ptr) {
    return {
      effectivePTR: ptr,
      savings: 0,
      schemeType: 'invalid_flat',
      details: null,
    }
  }

  const effectivePTR = ptr - amount
  const savingsPercent = (amount / ptr) * 100

  return {
    effectivePTR: Number(effectivePTR.toFixed(2)),
    savings: Number(amount.toFixed(2)),
    savingsPercent: Number(savingsPercent.toFixed(2)),
    schemeType: 'flat',
    details: {
      amount,
      description: `₹${amount} off`,
    },
  }
}

/**
 * Format scheme for display
 * @param {string} scheme - Raw scheme string
 * @returns {string} Formatted scheme
 */
export const formatScheme = (scheme) => {
  if (!scheme) return '—'

  const schemeStr = String(scheme).trim()

  // Standardize common formats
  const plusPattern = /(\d+)\s*\+\s*(\d+)/
  if (plusPattern.test(schemeStr)) {
    const [, buy, free] = schemeStr.match(plusPattern)
    return `Buy ${buy} Get ${free} Free`
  }

  const buyGetPattern = /buy\s+(\d+)\s+get\s+(\d+)/i
  if (buyGetPattern.test(schemeStr)) {
    const [, buy, free] = schemeStr.match(buyGetPattern)
    return `Buy ${buy} Get ${free} Free`
  }

  const percentPattern = /(\d+(?:\.\d+)?)\s*%/
  if (percentPattern.test(schemeStr)) {
    const [, percent] = schemeStr.match(percentPattern)
    return `${percent}% Discount`
  }

  const flatPattern = /(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)/i
  if (flatPattern.test(schemeStr)) {
    const [, amount] = schemeStr.match(flatPattern)
    return `₹${amount} Off`
  }

  // Return as-is if can't parse
  return schemeStr
}

/**
 * Calculate margin with scheme applied
 * @param {number} ptr - Base PTR
 * @param {number} mrp - MRP
 * @param {string} scheme - Scheme description
 * @returns {object} { basicMargin, effectiveMargin, additionalProfit }
 */
export const calculateMarginWithScheme = (ptr, mrp, scheme) => {
  const ptrNum = Number(ptr)
  const mrpNum = Number(mrp)

  if (!mrp || isNaN(ptrNum) || isNaN(mrpNum) || mrpNum === 0) {
    return {
      basicMargin: 0,
      effectiveMargin: 0,
      additionalProfit: 0,
      profitPerUnit: 0,
      effectiveProfitPerUnit: 0,
    }
  }

  // Basic margin without scheme
  const basicMargin = ((mrpNum - ptrNum) / mrpNum) * 100
  const profitPerUnit = mrpNum - ptrNum

  // Calculate with scheme
  const schemeResult = calculateEffectiveRate(ptrNum, scheme)
  const effectivePTR = schemeResult.effectivePTR
  const effectiveMargin = ((mrpNum - effectivePTR) / mrpNum) * 100
  const effectiveProfitPerUnit = mrpNum - effectivePTR
  const additionalProfit = effectiveProfitPerUnit - profitPerUnit

  return {
    basicMargin: Number(basicMargin.toFixed(2)),
    effectiveMargin: Number(effectiveMargin.toFixed(2)),
    additionalProfit: Number(additionalProfit.toFixed(2)),
    profitPerUnit: Number(profitPerUnit.toFixed(2)),
    effectiveProfitPerUnit: Number(effectiveProfitPerUnit.toFixed(2)),
    savingsPercent: schemeResult.savingsPercent || 0,
  }
}

/**
 * Compare schemes between suppliers
 * @param {array} suppliers - Array of { name, ptr, scheme, mrp }
 * @returns {array} Sorted suppliers with effective rates
 */
export const compareSchemes = (suppliers) => {
  return suppliers
    .map((supplier) => {
      const schemeResult = calculateEffectiveRate(supplier.ptr, supplier.scheme)
      const margins = calculateMarginWithScheme(supplier.ptr, supplier.mrp, supplier.scheme)

      return {
        ...supplier,
        effectivePTR: schemeResult.effectivePTR,
        savings: schemeResult.savings,
        ...margins,
      }
    })
    .sort((a, b) => a.effectivePTR - b.effectivePTR) // Sort by best effective rate
}

/**
 * Calculate total cost with scheme
 * @param {number} ptr - Base PTR
 * @param {number} quantity - Quantity ordered
 * @param {string} scheme - Scheme description
 * @returns {object} { baseCost, effectiveCost, totalSavings, freeUnits }
 */
export const calculateTotalCost = (ptr, quantity, scheme) => {
  const schemeResult = calculateEffectiveRate(ptr, scheme)
  const baseCost = ptr * quantity
  const effectiveCost = schemeResult.effectivePTR * quantity
  const totalSavings = baseCost - effectiveCost

  let freeUnits = 0
  if (schemeResult.schemeType === 'buy_get' && schemeResult.details) {
    const { buy, free } = schemeResult.details
    const sets = Math.floor(quantity / buy)
    freeUnits = sets * free
  }

  return {
    baseCost: Number(baseCost.toFixed(2)),
    effectiveCost: Number(effectiveCost.toFixed(2)),
    totalSavings: Number(totalSavings.toFixed(2)),
    freeUnits,
    effectivePTR: schemeResult.effectivePTR,
  }
}

export default {
  calculateEffectiveRate,
  formatScheme,
  calculateMarginWithScheme,
  compareSchemes,
  calculateTotalCost,
}
