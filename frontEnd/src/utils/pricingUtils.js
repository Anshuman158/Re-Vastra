/**
 * Pricing utility functions for rental pricing (Frontend)
 * 
 * Pricing Structure (cumulative - each day ADDS percentage of BASE to total):
 * - Day 1: Base price (e.g., ₹96)
 * - Days 2-3: Each day adds 30% of base to total
 * - Days 4-7: Each day adds 50% of base to total
 * - Day 8+: Each day adds 72% of base to total
 * 
 * Example (₹96 base):
 * - 1 day: ₹96
 * - 2 days: ₹96 + ₹28.8 = ₹124.8
 * - 3 days: ₹124.8 + ₹28.8 = ₹153.6
 * - 4 days: ₹153.6 + ₹48 = ₹201.6
 * 
 * Security Deposit: 40% of product's original price (refundable)
 */

// Pricing constants
export const URGENT_FEE = 50; // ₹50 for urgent delivery
export const URGENT_THRESHOLD_DAYS = 2; // Orders with delivery < 2 days are urgent
export const SECURITY_DEPOSIT_PERCENTAGE = 0.40; // 40% of product price

/**
 * Calculate cumulative rental price
 * 
 * @param {number} basePrice - Base rental price (Day 1 price)
 * @param {number} rentalDays - Total rental days
 * @returns {object} - Total and breakdown
 */
export const calculateTieredPrice = (basePrice, rentalDays) => {
    if (rentalDays <= 0 || basePrice <= 0) {
        return { total: 0, breakdown: [] };
    }

    let total = 0;
    const breakdown = [];

    for (let day = 1; day <= rentalDays; day++) {
        let addedAmount;
        let increasePercent = null;

        if (day === 1) {
            // Day 1: Base price
            addedAmount = basePrice;
        } else if (day <= 3) {
            // Days 2-3: Add 30% of base
            increasePercent = 30;
            addedAmount = basePrice * 0.30;
        } else if (day <= 7) {
            // Days 4-7: Add 50% of base
            increasePercent = 50;
            addedAmount = basePrice * 0.50;
        } else {
            // Day 8+: Add 72% of base
            increasePercent = 72;
            addedAmount = basePrice * 0.72;
        }

        total += addedAmount;

        breakdown.push({
            day,
            addedAmount: Math.round(addedAmount * 10) / 10,
            runningTotal: Math.round(total * 10) / 10,
            increasePercent,
            tier: day === 1 ? 'base' : (day <= 3 ? 'tier1' : (day <= 7 ? 'tier2' : 'tier3'))
        });
    }

    // Round total to 1 decimal place
    total = Math.round(total * 10) / 10;

    return { total, breakdown, rentalDays };
};

/**
 * Calculate security deposit (40% of original product price)
 * 
 * @param {number} productPrice - Original price of the product
 * @returns {number} - Security deposit amount
 */
export const calculateSecurityDeposit = (productPrice) => {
    if (!productPrice || productPrice <= 0) return 0;
    return Math.round(productPrice * SECURITY_DEPOSIT_PERCENTAGE);
};

/**
 * Check if delivery is urgent based on date difference
 */
export const isUrgentDelivery = (orderDate, deliveryDate) => {
    if (!orderDate || !deliveryDate) return false;

    const orderTime = new Date(orderDate).getTime();
    const deliveryTime = new Date(deliveryDate).getTime();
    const diffDays = (deliveryTime - orderTime) / (1000 * 60 * 60 * 24);

    return diffDays < URGENT_THRESHOLD_DAYS;
};

/**
 * Calculate days between two dates
 */
export const calculateRentalDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 0);
};

/**
 * Get minimum rental start date (tomorrow)
 */
export const getMinStartDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
};

/**
 * Get minimum rental end date based on start date
 */
export const getMinEndDate = (startDate) => {
    if (!startDate) return getMinStartDate();
    const minEnd = new Date(startDate);
    minEnd.setDate(minEnd.getDate() + 1);
    return minEnd;
};
