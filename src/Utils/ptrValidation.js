/* eslint-disable prettier/prettier */
/**
 * PTR (Price to Retailer) Validation Utilities
 * Central validation logic for wholesale rates
 */

/**
 * Validate PTR against MRP and business rules
 * @param {number} ptr - Price to Retailer
 * @param {number} mrp - Maximum Retail Price
 * @param {object} config - Optional configuration
 * @returns {object} { valid, errors, warnings, margin, details }
 */
export const validatePTR = (ptr, mrp, config = {}) => {
  const errors = []
  const warnings = []
  const details = {}

  // Configuration with defaults
  const {
    minMargin = 5,        // Minimum margin % (default 5%)
    maxMargin = 50,       // Maximum margin % (default 50%)
    warnThreshold = 10,   // Warn if margin < this % (default 10%)
    allowZero = false,    // Allow PTR = 0 for free items
  } = config

  // Basic validation
  if (ptr === null || ptr === undefined || ptr === '') {
    errors.push('PTR is required')
    return { valid: false, errors, warnings, margin: null, details }
  }

  const ptrNum = Number(ptr)
  const mrpNum = Number(mrp)

  // Check if PTR is a valid number
  if (isNaN(ptrNum)) {
    errors.push('PTR must be a valid number')
    return { valid: false, errors, warnings, margin: null, details }
  }

  // Check if PTR is positive (unless zero is allowed)
  if (ptrNum < 0) {
    errors.push('PTR cannot be negative')
    return { valid: false, errors, warnings, margin: null, details }
  }

  if (ptrNum === 0 && !allowZero) {
    errors.push('PTR cannot be zero')
    return { valid: false, errors, warnings, margin: null, details }
  }

  // If MRP is provided, validate against it
  if (mrp && !isNaN(mrpNum)) {
    // PTR must be less than MRP
    if (ptrNum >= mrpNum) {
      errors.push(`PTR (₹${ptrNum.toFixed(2)}) must be less than MRP (₹${mrpNum.toFixed(2)})`)
    }

    // Calculate margin
    const margin = ((mrpNum - ptrNum) / mrpNum) * 100
    details.margin = margin.toFixed(2)
    details.profitPerUnit = (mrpNum - ptrNum).toFixed(2)
    details.profitPercentage = margin.toFixed(2)

    // Margin validations
    if (margin < minMargin) {
      warnings.push(`Very low margin: ${margin.toFixed(1)}% (minimum recommended: ${minMargin}%)`)
    }

    if (margin < warnThreshold) {
      warnings.push(`Low margin alert: ${margin.toFixed(1)}%`)
    }

    if (margin > maxMargin) {
      warnings.push(`Unusually high margin: ${margin.toFixed(1)}% (maximum expected: ${maxMargin}%)`)
    }

    // Additional business logic warnings
    if (margin < 8) {
      warnings.push('⚠️ Margin too low - may not cover operational costs')
    }

    if (ptrNum > mrpNum * 0.95) {
      warnings.push('⚠️ PTR is very close to MRP - limited profit margin')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    margin: details.margin || null,
    details,
  }
}

/**
 * Calculate standard PTR based on category
 * @param {number} mrp - Maximum Retail Price
 * @param {string} category - Medicine category
 * @returns {number} Calculated PTR
 */
export const calculateStandardPTR = (mrp, category = 'Generic') => {
  if (!mrp || isNaN(mrp) || mrp <= 0) return 0

  // Standard margins by category (industry averages)
  const margins = {
    Generic: 0.2, // 20% margin
    Branded: 0.25, // 25% margin
    'Surgical Items': 0.3, // 30% margin
    OTC: 0.22, // 22% margin (Over The Counter)
    'Schedule H': 0.18, // 18% margin (prescription drugs - higher cost)
    'Schedule H1': 0.18, // 18% margin (strict prescription)
    Antibiotic: 0.18, // 18% margin
    'Controlled Drug': 0.15, // 15% margin (highly regulated)
    Ayurvedic: 0.28, // 28% margin
    Cosmetic: 0.35, // 35% margin
    'Baby Care': 0.3, // 30% margin
    Supplement: 0.32, // 32% margin
  }

  const margin = margins[category] || 0.25 // Default 25%
  return Number((mrp * (1 - margin)).toFixed(2))
}

/**
 * Compare PTR with last purchase rate
 * @param {number} currentPTR - Current PTR being entered
 * @param {number} lastPTR - Last purchase PTR
 * @returns {object} { changed, percentChange, message, severity }
 */
export const comparePTR = (currentPTR, lastPTR) => {
  if (!lastPTR || lastPTR === 0) {
    return {
      changed: false,
      percentChange: 0,
      message: 'No previous purchase data',
      severity: 'info',
    }
  }

  const current = Number(currentPTR)
  const last = Number(lastPTR)

  if (isNaN(current) || isNaN(last)) {
    return {
      changed: false,
      percentChange: 0,
      message: 'Invalid PTR values',
      severity: 'error',
    }
  }

  const change = current - last
  const percentChange = (change / last) * 100

  let severity = 'info'
  let message = ''

  if (Math.abs(percentChange) < 1) {
    // Less than 1% change - no significant change
    message = 'PTR unchanged'
    severity = 'info'
  } else if (percentChange > 0) {
    // Price increased
    if (percentChange > 10) {
      message = `⚠️ PTR increased by ${percentChange.toFixed(1)}% (₹${change.toFixed(2)})`
      severity = 'warning'
    } else if (percentChange > 5) {
      message = `PTR increased by ${percentChange.toFixed(1)}% (₹${change.toFixed(2)})`
      severity = 'info'
    } else {
      message = `PTR increased slightly by ${percentChange.toFixed(1)}%`
      severity = 'info'
    }
  } else {
    // Price decreased
    if (Math.abs(percentChange) > 10) {
      message = `✅ PTR decreased by ${Math.abs(percentChange).toFixed(1)}% (Save ₹${Math.abs(change).toFixed(2)})`
      severity = 'success'
    } else {
      message = `PTR decreased by ${Math.abs(percentChange).toFixed(1)}%`
      severity = 'success'
    }
  }

  return {
    changed: Math.abs(percentChange) >= 1,
    percentChange: percentChange.toFixed(2),
    change: change.toFixed(2),
    message,
    severity,
  }
}

/**
 * Format PTR validation result for display
 * @param {object} validation - Result from validatePTR
 * @returns {string} Formatted message
 */
export const formatValidationMessage = (validation) => {
  if (!validation) return ''

  const parts = []

  if (validation.errors.length > 0) {
    parts.push(`❌ Errors: ${validation.errors.join(', ')}`)
  }

  if (validation.warnings.length > 0) {
    parts.push(`⚠️ Warnings: ${validation.warnings.join(', ')}`)
  }

  if (validation.margin) {
    parts.push(`Margin: ${validation.margin}%`)
  }

  return parts.join(' | ')
}

/**
 * Batch validate multiple PTR entries
 * @param {array} items - Array of { ptr, mrp, name }
 * @returns {object} { valid, invalidItems, summary }
 */
export const batchValidatePTR = (items) => {
  const results = items.map((item, index) => {
    const validation = validatePTR(item.ptr, item.mrp)
    return {
      index,
      name: item.name || `Item ${index + 1}`,
      validation,
      ...item,
    }
  })

  const invalidItems = results.filter((r) => !r.validation.valid)
  const warningItems = results.filter((r) => r.validation.warnings.length > 0)

  return {
    valid: invalidItems.length === 0,
    invalidItems,
    warningItems,
    summary: {
      total: items.length,
      valid: results.length - invalidItems.length,
      invalid: invalidItems.length,
      warnings: warningItems.length,
    },
  }
}

export default {
  validatePTR,
  calculateStandardPTR,
  comparePTR,
  formatValidationMessage,
  batchValidatePTR,
}
