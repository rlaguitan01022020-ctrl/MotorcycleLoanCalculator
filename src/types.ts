export interface MotorcycleModel {
  model: string;
  srp: number;
  series: string;
  brand?: string; // e.g. CFMOTO, Honda, Yamaha, Kawasaki, Suzuki, etc.
  category?: string;
  displacement?: string; // CC (e.g. 450cc, 155cc)
  description?: string;
  imageUrl?: string;
  isCustom?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string; // Gmail account
  city: string;
  contact: string;
  registeredAt: string;
  authProvider?: 'gmail' | 'manual';
}

export type FeeBasis = '% of approved loan' | 'Fixed (₱)';
export type FeeTreatment = 'Add to Loan' | 'Cash Outright';

export interface FeeLine {
  id: string;
  type: string;
  basis: FeeBasis;
  value: number; // percentage (e.g., 2) or fixed amount (e.g., 2500)
  treatment: FeeTreatment;
}

export interface LoanCalculationResult {
  srp: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  principal: number; // SRP - Down Payment
  addedToLoanFeesTotal: number;
  cashOutrightFeesTotal: number;
  ltoCash: number;
  financedAmount: number; // Principal + Fees marked 'Add to Loan'
  monthlyRatePercent: number;
  termMonths: number;
  addOnInterest: number; // Financed Amount * (monthlyRate/100) * termMonths
  totalLoanAmountWithInterest: number; // Financed Amount + Add-on Interest
  monthlyAmortization: number; // (Financed Amount + Add-on Interest) / termMonths
  totalCashOut: number; // Down Payment + Cash Outright Fees + LTO Cash
  totalCostOfMotorcycle: number; // Total Cash Out + (Monthly Amortization * Term)
  feeBreakdown: Array<{
    type: string;
    treatment: FeeTreatment;
    basis: FeeBasis;
    rateOrFixed: number;
    amount: number;
  }>;
}

export type AppTheme = 'teal-pink' | 'dark' | 'black-yellow';

export interface CompanySettings {
  companyName: string;
  address: string;
  contactNumber: string;
  email: string;
  logoUrl?: string; // Base64 data URL or external image URL
  theme?: AppTheme;
}

export interface UploadedRequirementFile {
  id: string;
  name: string;
  category: string;
  requirementKey?: string; // ID of the specific requirement slot
  dataUrl: string;
  size: number;
  uploadedAt: string;
}

export interface LoanApplicationData {
  id: string;
  createdAt: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  notes?: string;

  // Selected vehicle & calculation snapshot
  modelName: string;
  seriesName: string;
  srp: number;
  downPayment: number;
  downPaymentPercent: number;
  monthlyAmortization: number;
  totalCashOut: number;

  // Agent Information
  agentName?: string;

  // 1. LOAN DETAILS
  amountApplied: string;
  terms: string;
  purpose: string;

  // 2. PERSONAL INFORMATION
  lastName: string;
  firstName: string;
  middleName: string;
  birthday: string;
  birthplace: string;
  age: number | string;
  nationality: string;
  civilStatus: string;
  contactNumber: string;
  housing: string; // "Own House" | "Renting"
  rentAddress?: string;
  rentLength?: string;
  permanentAddress: string;
  permLength: string;

  // 3. PARENTS' INFORMATION
  mother: string;
  motherAge: number | string;
  father: string;
  fatherAge: number | string;

  // 4. DEPENDENTS / CHILDREN
  dependents: number | string;
  dep1Name?: string;
  dep1Age?: number | string;
  dep1School?: string;
  dep2Name?: string;
  dep2Age?: number | string;
  dep2School?: string;

  // 5. SPOUSE / CO-BORROWER
  spSurname?: string;
  spFirst?: string;
  spMiddle?: string;
  spBirthday?: string;
  spAge?: number | string;
  spContact?: string;
  spouseLastName?: string;
  spouseFirstName?: string;
  spouseContact?: string;

  // 6. EMPLOYMENT / BUSINESS DETAILS
  employer: string;
  position: string;
  nature: string;
  yearsBusiness: string;
  yearsService?: string;
  office: string;
  salary?: number | string;
  otherIncome?: number | string;
  totalIncome?: number | string;
  livingExpenses?: number | string;
  bankName?: string;
  bankBranch?: string;
  accountType?: string;
  employerAddress?: string;
  employerContact?: string;

  // 7. CONTACT PERSONS
  cp1Name: string;
  cp1Contact: string;
  cp1Position: string;
  cp2Name: string;
  cp2Contact: string;
  cp2Position: string;

  // 8. THREE (3) CHARACTER REFERENCES
  ref1Name: string;
  ref1Rel: string;
  ref1Contact: string;
  ref1Address: string;

  ref2Name: string;
  ref2Rel: string;
  ref2Contact: string;
  ref2Address: string;

  ref3Name: string;
  ref3Rel: string;
  ref3Contact: string;
  ref3Address: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  audioUrl?: string;
}
