import { MotorcycleModel, FeeBasis, FeeTreatment } from '../types';

export const SYSTEM_INFO = {
  name: 'Motorcycle Financing & Loan Calculators',
  title: 'Motorcycle Loan System',
  description: 'Motorcycle Loan & Sales Quotation',
  demo_login: {
    username: 'admin',
    password: 'admin123',
  },
};

export const SALES_QUOTATION_CONFIG = {
  head_office: '141 8th Street, corner 11th Avenue, Grace Park East, Caloocan City',
  contact_number: '(+63) 917 123 4567 / (02) 8361-8888',
  email: 'sales@motorcycleloans.ph',
  default_brand: 'Motorcycle Brand',
  freebies: [
    '1st PMS Labor (500-1500KM/1mo)',
    'Official T-Shirt',
    'Riding Tube Mask',
    'Dealership Tote Bag',
  ],
  default_note: 'Please ask your sales agent for complete terms and conditions.',
};

export const LOAN_SETTINGS = {
  default_down_payment_percent: 20,
  minimum_down_payment_percent: 5,
  terms_months: [12, 15, 18, 24, 30, 36, 48, 60],
  monthly_add_on_interest_rates_percent: [
    1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 1.99, 2.0, 2.05, 2.1, 2.15, 2.2, 2.25,
    2.3, 2.35, 2.4, 2.45, 2.5, 2.55, 2.6, 2.65, 2.7, 2.75, 2.8, 2.85, 2.9,
    2.95, 3.0,
  ],
  lto_registration_cash: 5500,
  maximum_fee_lines: 5,
  fee_types: [
    'Processing Fees',
    'Comprehensive Insurance',
    'PN Documentary Stamps',
    'Other',
  ],
  fee_basis: ['% of approved loan', 'Fixed (₱)'] as FeeBasis[],
  fee_treatment: ['Add to Loan', 'Cash Outright'] as FeeTreatment[],
};

export const DEFAULT_FINANCING_PARTNERS = [
  'Sumisho Motor Finance',
  'ORIX Metro Leasing & Finance',
  'SB Finance (Security Bank)',
  'CitySavings Bank Motorcycle Loan',
  'BDO Consumer Lending',
  'BPI Motorcycle Loans',
  'Maybank Philippines',
  'In-House Dealership Financing',
];

export const STORAGE_KEYS = {
  login_key: 'ms_login',
  applications_key: 'ms_apps',
  settings_key: 'ms_company_settings',
  agent_key: 'ms_saved_agents',
  uploads_key: 'ms_uploaded_requirements',
  financing_partners_key: 'ms_custom_financing_partners',
  custom_motorcycles_key: 'ms_custom_motorcycles',
  deleted_motorcycles_key: 'ms_deleted_motorcycles',
  user_account_key: 'ms_user_account',
  auth_session_key: 'ms_auth_session',
};

export const MOTORCYCLE_BRANDS_LIST = [
  'CFMOTO',
  'MV Agusta',
  'Peugeot Motocycles',
  'Honda',
  'Yamaha',
  'Kawasaki',
  'Suzuki',
  'KTM',
  'Ducati',
  'BMW Motorrad',
  'Triumph',
  'Royal Enfield',
  'Benelli',
  'Harley-Davidson',
  'Kymco',
  'SYM',
  'Vespa',
  'Other Motorcycle Brand',
];

export const CFMOTO_SERIES_MAP: Record<string, Array<{ model: string; srp: number; category?: string; displacement?: string; brand?: string }>> = {
  // CFMOTO Lineup
  'CL Series': [
    { model: '300CL-X', srp: 146900, category: 'Modern Classic / Neo-Retro', displacement: '292cc', brand: 'CFMOTO' },
    { model: '450CL-C Bobber', srp: 299900, category: 'Cruiser / Bobber', displacement: '449cc', brand: 'CFMOTO' },
    { model: '450CL-C Manual', srp: 299900, category: 'Cruiser / Manual', displacement: '449cc', brand: 'CFMOTO' },
    { model: '450CL-C AMT', srp: 328900, category: 'Automatic Cruiser', displacement: '449cc', brand: 'CFMOTO' },
    { model: '700CL-X Heritage', srp: 328900, category: 'Neo-Retro Scrambler', displacement: '693cc', brand: 'CFMOTO' },
    { model: '700CL-X Adventure', srp: 349900, category: 'Scrambler Adventure', displacement: '693cc', brand: 'CFMOTO' },
    { model: '700CL-X Sport', srp: 349900, category: 'Cafe Racer / Sport', displacement: '693cc', brand: 'CFMOTO' },
  ],
  'GT Series': [
    { model: '650GT', srp: 298900, category: 'Grand Tourer', displacement: '649cc', brand: 'CFMOTO' },
  ],
  'EV Series': [
    { model: 'CX-2E', srp: 88800, category: 'Youth Electric Dirt Bike', displacement: '1200W Electric', brand: 'CFMOTO' },
    { model: 'CFX-5E', srp: 99900, category: 'Youth Electric Motocross', displacement: '1500W Electric', brand: 'CFMOTO' },
  ],
  'NK Series': [
    { model: '150NK', srp: 100900, category: 'Naked Streetfighter', displacement: '149.8cc', brand: 'CFMOTO' },
    { model: '300NK', srp: 146900, category: 'Naked Streetfighter', displacement: '292cc', brand: 'CFMOTO' },
    { model: '450NK', srp: 275900, category: 'Naked Streetfighter', displacement: '449cc', brand: 'CFMOTO' },
    { model: '650NK', srp: 279900, category: 'Naked Streetfighter', displacement: '649cc', brand: 'CFMOTO' },
    { model: '675NK', srp: 409900, category: 'Triple Cylinder Streetfighter', displacement: '675cc', brand: 'CFMOTO' },
    { model: '800NK', srp: 458900, category: 'High-Performance Naked', displacement: '799cc', brand: 'CFMOTO' },
  ],
  'AURA Series': [
    { model: '150 AURA', srp: 131700, category: 'Premium Urban Scooter', displacement: '149.6cc', brand: 'CFMOTO' },
  ],
  'SC Series': [
    { model: '150 SC', srp: 98900, category: 'City Commuter Scooter', displacement: '149cc', brand: 'CFMOTO' },
  ],
  'PAPIO Series': [
    { model: '125 ST PAPIO', srp: 90900, category: 'Mini Fun Bike', displacement: '126cc', brand: 'CFMOTO' },
    { model: '125 PAPIO RACER', srp: 110900, category: 'Retro Mini Racer', displacement: '126cc', brand: 'CFMOTO' },
    { model: '125 PAPIO TRAIL V2', srp: 118900, category: 'Mini Scrambler / Trail', displacement: '126cc', brand: 'CFMOTO' },
    { model: '125 PAPIO RACER V2', srp: 128900, category: 'Sport Mini Racer V2', displacement: '126cc', brand: 'CFMOTO' },
  ],
  'SR Series': [
    { model: '450SR', srp: 284900, category: 'Supersport', displacement: '449cc', brand: 'CFMOTO' },
    { model: '450SR-S', srp: 303900, category: 'Single-Swingarm Supersport', displacement: '449cc', brand: 'CFMOTO' },
    { model: '500SR', srp: 333900, category: 'Inline-4 Supersport', displacement: '500cc', brand: 'CFMOTO' },
    { model: '675SR-R', srp: 438900, category: 'Triple Cylinder Supersport', displacement: '675cc', brand: 'CFMOTO' },
    { model: '750SR-S', srp: 566900, category: 'Flagship Supersport', displacement: '750cc', brand: 'CFMOTO' },
  ],
  'MT Series': [
    { model: '450MT', srp: 338900, category: 'Dual-Sport Adventure', displacement: '449cc', brand: 'CFMOTO' },
    { model: '650MT', srp: 298900, category: 'Adventure Tourer', displacement: '649cc', brand: 'CFMOTO' },
    { model: '700MT', srp: 388800, category: 'Adventure Tourer', displacement: '693cc', brand: 'CFMOTO' },
    { model: '800MT Explore', srp: 616900, category: 'Flagship Adventure Tourer', displacement: '799cc', brand: 'CFMOTO' },
    { model: '800MT Sport', srp: 535900, category: 'Sport Touring Adventure', displacement: '799cc', brand: 'CFMOTO' },
    { model: '800MT-X', srp: 676900, category: 'Rally Adventure', displacement: '799cc', brand: 'CFMOTO' },
    { model: '1000MT-X', srp: 745900, category: 'Heavyweight Rally Adventure', displacement: '998cc', brand: 'CFMOTO' },
  ],
  'CFLITE Series': [
    { model: '230 DUAL', srp: 99900, category: 'Dual Sport / Offroad', displacement: '230cc', brand: 'CFMOTO' },
    { model: '250SR LITE', srp: 138900, category: 'Entry Sportbike', displacement: '249cc', brand: 'CFMOTO' },
    { model: '250NK LITE', srp: 131900, category: 'Entry Naked Bike', displacement: '249cc', brand: 'CFMOTO' },
    { model: '250 DUAL Carb', srp: 128900, category: 'Dual Sport Carbureted', displacement: '249cc', brand: 'CFMOTO' },
    { model: '250 DUAL FI', srp: 141900, category: 'Dual Sport Electronic Fuel Injection', displacement: '249cc', brand: 'CFMOTO' },
  ],

  // MV Agusta Philippines — Motorcycle Models and Prices
  'MV Agusta - Brutale': [
    { model: 'Brutale R', srp: 1100000, category: 'Naked Sport', displacement: '798cc', brand: 'MV Agusta' },
    { model: 'Brutale RR', srp: 1250000, category: 'High-Performance Naked', displacement: '798cc', brand: 'MV Agusta' },
    { model: 'Brutale Ottantesimo', srp: 1500000, category: 'Limited Edition Naked', displacement: '798cc', brand: 'MV Agusta' },
  ],
  'MV Agusta - Dragster': [
    { model: 'Dragster RR SCS', srp: 1550000, category: 'Streetfighter SCS', displacement: '798cc', brand: 'MV Agusta' },
    { model: 'Dragster America', srp: 2200000, category: 'Special Edition Naked', displacement: '798cc', brand: 'MV Agusta' },
    { model: 'Dragster R', srp: 1300000, category: 'Naked Streetfighter', displacement: '798cc', brand: 'MV Agusta' },
    { model: 'Dragster Ottantesimo', srp: 1800000, category: 'Limited Edition Streetfighter', displacement: '798cc', brand: 'MV Agusta' },
  ],
  'MV Agusta - Enduro': [
    { model: 'Enduro Veloce', srp: 1500000, category: 'Luxury Adventure Tourer', displacement: '931cc', brand: 'MV Agusta' },
  ],
  'MV Agusta - Turismo': [
    { model: 'Turismo Veloce R', srp: 1200000, category: 'Sport Tourer', displacement: '798cc', brand: 'MV Agusta' },
    { model: 'Turismo Veloce Lusso SCS', srp: 1500000, category: 'Luxury Sport Tourer SCS', displacement: '798cc', brand: 'MV Agusta' },
  ],
  'MV Agusta - F3': [
    { model: 'F3 R', srp: 1200000, category: 'Supersport', displacement: '798cc', brand: 'MV Agusta' },
    { model: 'F3 RR', srp: 1750000, category: 'Track-Ready Supersport', displacement: '798cc', brand: 'MV Agusta' },
  ],
  'MV Agusta - Superveloce': [
    { model: 'Superveloce', srp: 1550000, category: 'Neo-Retro Supersport', displacement: '798cc', brand: 'MV Agusta' },
    { model: 'Superveloce S', srp: 1850000, category: 'Premium Neo-Retro Supersport', displacement: '798cc', brand: 'MV Agusta' },
    { model: 'Superveloce 98', srp: 2500000, category: "Collector's Edition Neo-Retro", displacement: '798cc', brand: 'MV Agusta' },
  ],
  'MV Agusta - Brutale 1000': [
    { model: 'Brutale 1000 RS', srp: 1700000, category: 'Hypernaked', displacement: '998cc', brand: 'MV Agusta' },
    { model: 'Brutale 1000 RR', srp: 2200000, category: 'Flagship Hypernaked', displacement: '998cc', brand: 'MV Agusta' },
  ],
  'MV Agusta - RC Range': [
    { model: 'F3 RC', srp: 1850000, category: 'Reparto Corse Supersport', displacement: '798cc', brand: 'MV Agusta' },
    { model: 'Dragster RC', srp: 1750000, category: 'Reparto Corse Streetfighter', displacement: '798cc', brand: 'MV Agusta' },
    { model: 'Turismo Veloce RC', srp: 1750000, category: 'Reparto Corse Sport Tourer', displacement: '798cc', brand: 'MV Agusta' },
  ],

  // Peugeot Motocycles Philippines
  'Peugeot Motocycles Philippines': [
    { model: 'XP400 GT', srp: 555900, category: 'Adventure Maxiscooter', displacement: '400cc', brand: 'Peugeot Motocycles' },
    { model: 'Django Classic 150', srp: 131700, category: 'Neo-Retro Urban Scooter', displacement: '150cc', brand: 'Peugeot Motocycles' },
    { model: 'Django Sports 150', srp: 212900, category: 'Sport Neo-Retro Scooter', displacement: '150cc', brand: 'Peugeot Motocycles' },
  ],
};

export const ALL_MOTORCYCLES: MotorcycleModel[] = Object.entries(CFMOTO_SERIES_MAP).flatMap(
  ([series, models]) =>
    models.map((m) => ({
      brand:
        m.brand ||
        (series.startsWith('MV Agusta')
          ? 'MV Agusta'
          : series.startsWith('Peugeot')
          ? 'Peugeot Motocycles'
          : 'CFMOTO'),
      series,
      model: m.model,
      srp: m.srp,
      category: m.category,
      displacement: m.displacement,
    }))
);

export function getStoredCustomMotorcycles(): MotorcycleModel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.custom_motorcycles_key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomMotorcycle(newBike: MotorcycleModel): MotorcycleModel[] {
  const current = getStoredCustomMotorcycles();
  const updated = [newBike, ...current.filter((b) => b.model !== newBike.model)];
  try {
    localStorage.setItem(STORAGE_KEYS.custom_motorcycles_key, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom motorcycle:', err);
  }
  return updated;
}

export function deleteCustomMotorcycle(modelName: string): MotorcycleModel[] {
  const current = getStoredCustomMotorcycles();
  const updated = current.filter((b) => b.model !== modelName);
  try {
    localStorage.setItem(STORAGE_KEYS.custom_motorcycles_key, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete custom motorcycle:', err);
  }
  return updated;
}

export function getStoredDeletedMotorcycles(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.deleted_motorcycles_key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDeletedMotorcycles(models: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.deleted_motorcycles_key, JSON.stringify(models));
  } catch (err) {
    console.error('Failed to save deleted motorcycles:', err);
  }
}

export const LOAN_REQUIREMENTS_DATA = {
  applies_to: 'ALL BRANDS of Brand-New Motorcycles!',
  documentary_requirements: {
    identification: [
      'Duly Accomplished Loan Application Form',
      '2 Valid Government-Issued IDs (e.g. Passport, UMID, Driver’s License, Postal ID, PRC, National ID)',
      'Birth Certificate / Marriage Certificate (if married)',
    ],
    proof_of_residency: [
      'Electric or Water Bill (Latest 2 months)',
      'If the bill is not under your name or co-borrower’s name, submit a Barangay Clearance or Internet Bill instead',
    ],
    proof_of_income: {
      business_owners: [
        'DTI Registration (Certificate of Business Name Registration)',
        'Mayor’s Permit / Business Permit / Barangay Permit',
        'Latest 2 Months Bank Statement or Passbook with consistent cash flow',
      ],
      employed: [
        'Company ID with picture and signature',
        'Certificate of Employment (COE) with monthly compensation breakdown',
        'Latest 2 Months Payslip (itemized)',
        'Latest 2 Months Payroll Bank Statement or ATM Account Transaction History',
      ],
      tnvs_delivery_drivers: [
        'Professional Driver’s License',
        'Certificate (for Angkas / JoyRide / Move It accredited riders)',
        'Active Rider Profile Screenshot from Application (showing rating & registration)',
        'Latest 2 Months Screenshot of In-App Earnings and Trip Summaries',
      ],
    },
  },
};
