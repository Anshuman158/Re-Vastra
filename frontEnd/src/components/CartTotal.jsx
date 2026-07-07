import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { FaInfoCircle } from 'react-icons/fa';
import Title from './Title';
import { Zap, Shield } from 'lucide-react';

const CartTotal = ({ customSubtotal, urgentFee = 0, securityDeposit = 0, pricingBreakdowns = [] }) => {
  const { currency, delivery_fee, getCartAmount, washingFee, includeWashing, toggleWashingFee } = useContext(ShopContext);
  const [showInfo, setShowInfo] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showDepositInfo, setShowDepositInfo] = useState(false);

  // Use custom subtotal from Cart.jsx if provided (tiered pricing), otherwise use simple calculation
  const subtotal = customSubtotal !== undefined ? customSubtotal : getCartAmount();

  // Calculate total price dynamically (excluding security deposit - it's refundable)
  const rentalTotal = subtotal + delivery_fee + (includeWashing ? washingFee : 0) + urgentFee;

  // Total to pay now (rental + deposit)
  const totalToPay = rentalTotal + securityDeposit;

  return (
    <div className="w-full bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6 relative">
      {/* Title */}
      <div className="text-center mb-6">
        <Title text1="CART" text2="TOTALS" />
      </div>

      {/* Totals Content */}
      <div className="flex flex-col gap-4 text-sm">
        {/* Subtotal with Tiered Breakdown */}
        <div className="border-b dark:border-neutral-700 pb-3">
          <div className="flex justify-between items-center">
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">Rental Subtotal</p>
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">{currency} {subtotal.toFixed(0)}</p>
          </div>

          {/* Expandable Tiered Breakdown */}
          {pricingBreakdowns.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                {showBreakdown ? 'Hide' : 'View'} pricing breakdown
              </button>

              {showBreakdown && (
                <div className="mt-2 space-y-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg max-h-40 overflow-y-auto">
                  {pricingBreakdowns.map((item, idx) => (
                    <div key={idx} className="text-xs">
                      <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        {item.productName} ({item.size}) - {item.days} days = {currency}{item.total}
                      </p>
                      <div className="space-y-0.5 text-neutral-500 dark:text-neutral-400 pl-2">
                        {item.breakdown.map((dayData, i) => (
                          <div key={i} className="flex justify-between">
                            <span>
                              Day {dayData.day}: {currency}{dayData.rate}
                              {dayData.increasePercent && <span className="text-amber-600 ml-1">(+{dayData.increasePercent}%)</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Platform Charge */}
        <div className="flex justify-between items-center border-b dark:border-neutral-700 pb-2">
          <p className="text-neutral-600 dark:text-neutral-400 font-medium">Platform Charge</p>
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">{currency} {delivery_fee}.00</p>
        </div>

        {/* Urgent Fee */}
        {urgentFee > 0 && (
          <div className="flex justify-between items-center border-b dark:border-neutral-700 pb-2">
            <p className="text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-1">
              <Zap size={14} /> Urgent Delivery
            </p>
            <p className="font-semibold text-yellow-600 dark:text-yellow-400">{currency} {urgentFee}.00</p>
          </div>
        )}

        {/* Washing Fee Checkbox with Info Icon */}
        <div className="flex justify-between items-center border-b dark:border-neutral-700 pb-2 relative">
          <label className="text-neutral-600 dark:text-neutral-400 font-medium flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="mr-2 w-4 h-4 cursor-pointer"
              checked={includeWashing}
              onChange={toggleWashingFee}
            />
            Add Washing Service ({currency}{washingFee}.00)
          </label>

          {/* Info Icon */}
          <FaInfoCircle
            className="text-neutral-500 dark:text-neutral-400 ml-2 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300"
            onClick={() => setShowInfo(!showInfo)}
          />

          {/* Tooltip for Washing Fee Details */}
          {showInfo && (
            <div className="absolute right-0 top-8 w-60 p-3 bg-white dark:bg-neutral-700 border dark:border-neutral-600 rounded-lg shadow-lg text-neutral-700 dark:text-neutral-300 text-sm z-10">
              🧼 <strong>Washing Service Includes:</strong>
              <ul className="mt-1 ml-4 list-disc text-xs">
                <li>Gentle wash & stain removal</li>
                <li>Ironing & fabric care</li>
                <li>Ready-to-wear condition</li>
                <li>Eco-friendly detergents 🌱</li>
              </ul>
              <button
                className="text-red-500 mt-2 text-xs underline"
                onClick={() => setShowInfo(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Rental Total */}
        <div className="flex justify-between items-center border-b dark:border-neutral-700 pb-2">
          <p className="text-neutral-700 dark:text-neutral-300 font-semibold">Rental Total</p>
          <p className="font-bold text-neutral-800 dark:text-neutral-200">{currency} {rentalTotal.toFixed(0)}</p>
        </div>

        {/* Security Deposit */}
        {securityDeposit > 0 && (
          <div className="flex justify-between items-center border-b dark:border-neutral-700 pb-2 relative">
            <div className="flex items-center gap-1">
              <Shield size={14} className="text-blue-500" />
              <p className="text-blue-600 dark:text-blue-400 font-medium">Security Deposit</p>
              <FaInfoCircle
                className="text-blue-400 text-xs cursor-pointer hover:text-blue-600"
                onClick={() => setShowDepositInfo(!showDepositInfo)}
              />
            </div>
            <p className="font-semibold text-blue-600 dark:text-blue-400">{currency} {securityDeposit.toFixed(0)}</p>

            {showDepositInfo && (
              <div className="absolute right-0 top-8 w-64 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg shadow-lg text-blue-800 dark:text-blue-200 text-xs z-10">
                <strong>🔒 Refundable Security Deposit</strong>
                <p className="mt-1">40% of product value, held during rental period. Fully refunded within 3-5 days after successful return of item in good condition.</p>
                <button
                  className="text-blue-600 mt-2 text-xs underline"
                  onClick={() => setShowDepositInfo(false)}
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        )}

        {/* Total to Pay */}
        <div className="flex justify-between items-center pt-2 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 -mx-2 px-2 py-3 rounded-lg">
          <div>
            <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Total to Pay</p>
            {securityDeposit > 0 && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                (incl. {currency}{securityDeposit.toFixed(0)} refundable deposit)
              </p>
            )}
          </div>
          <p className="text-xl font-bold text-[#E63946]">
            {currency} {totalToPay.toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
