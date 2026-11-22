import { FeeLine, LoanCalculationResult } from '../types';
import { LOAN_SETTINGS } from '../data/motostradaData';

export function calculateLoan({
  srp,
  downPaymentPercent,
  termMonths,
  monthlyRatePercent,
  feeLines,
  ltoCash = LOAN_SETTINGS.lto_registration_cash,
}: {
  srp: number;
  downPaymentPercent: number;
  termMonths: number;
  monthlyRatePercent: number;
  feeLines: FeeLine[];
  ltoCash?: number;
}): LoanCalculationResult {
  const safeSrp = Math.max(0, srp);
  const safeDpPercent = Math.max(0, Math.min(100, downPaymentPercent));
  const downPaymentAmount = Math.round((safeSrp * safeDpPercent) / 100);
  const principal = Math.max(0, safeSrp - downPaymentAmount);

  // Calculate fees
  let addedToLoanFeesTotal = 0;
  let cashOutrightFeesTotal = 0;

  const feeBreakdown = feeLines.map((fee) => {
    let amount = 0;
    if (fee.basis === '% of approved loan') {
      // Basis is % of principal (approved loan before added fees)
      amount = Math.round((principal * (fee.value || 0)) / 100);
    } else {
      amount = Math.round(fee.value || 0);
    }

    if (fee.treatment === 'Add to Loan') {
      addedToLoanFeesTotal += amount;
    } else {
      cashOutrightFeesTotal += amount;
    }

    return {
      type: fee.type,
      treatment: fee.treatment,
      basis: fee.basis,
      rateOrFixed: fee.value,
      amount,
    };
  });

  // Financed Amount = Principal + Fees marked 'Add to Loan'
  const financedAmount = principal + addedToLoanFeesTotal;

  // Add-on Interest = Financed Amount × Monthly Rate × Term
  const monthlyRateDecimal = (monthlyRatePercent || 0) / 100;
  const addOnInterest = Math.round(financedAmount * monthlyRateDecimal * termMonths);

  // Total Loan Amount with Interest
  const totalLoanAmountWithInterest = financedAmount + addOnInterest;

  // Monthly Amortization = (Financed Amount + Financed Amount × Monthly Rate × Term) / Term
  const monthlyAmortization =
    termMonths > 0 ? Math.round(totalLoanAmountWithInterest / termMonths) : 0;

  // Total Cash Out = Down Payment + Cash Outright Fees + LTO Registration (₱5,500 fixed)
  const totalCashOut = downPaymentAmount + cashOutrightFeesTotal + (ltoCash || 0);

  // Total Cost = Total Cash Out + (Monthly Amortization * Term) (automatically includes LTO Registration)
  const totalCostOfMotorcycle = totalCashOut + (monthlyAmortization * termMonths);

  return {
    srp: safeSrp,
    downPaymentPercent: safeDpPercent,
    downPaymentAmount,
    principal,
    addedToLoanFeesTotal,
    cashOutrightFeesTotal,
    ltoCash,
    financedAmount,
    monthlyRatePercent,
    termMonths,
    addOnInterest,
    totalLoanAmountWithInterest,
    monthlyAmortization,
    totalCashOut,
    totalCostOfMotorcycle,
    feeBreakdown,
  };
}

export function formatPHP(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-PH').format(value);
}
