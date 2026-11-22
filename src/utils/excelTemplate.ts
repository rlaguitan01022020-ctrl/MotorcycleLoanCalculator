import * as XLSX from 'xlsx';

export const MASS_TEMPLATE_ROWS: Array<Array<string | number>> = [
  ['Motorcycle Brand', 'Model', 'Price / SRP (₱) *', 'Lineup / Series', 'Displacement (CC)', 'Category'],
  ['Honda', 'ADV 160', 166900, 'Honda Scooter', '157cc', 'Adventure Scooter'],
  ['Yamaha', 'NMAX 155', 151900, 'Yamaha MAXI', '155cc', 'Maxi Scooter'],
  ['Kawasaki', 'Ninja 400', 340900, 'Kawasaki Ninja', '399cc', 'Sportbike'],
];

export const MASS_TEMPLATE_TAB_TEXT = MASS_TEMPLATE_ROWS.map((row) => row.join('\t')).join('\n');

export function downloadMotorcycleMassExcelTemplate(): void {
  const worksheet = XLSX.utils.aoa_to_sheet(MASS_TEMPLATE_ROWS);
  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 22 },
    { wch: 20 },
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Motorcycle_Mass_Template');

  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Motorcycle_Brand_Lineup_Model_Mass_Template.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function parseUploadedMotorcycleFile(file: File): Promise<string> {
  const lower = file.name.toLowerCase();
  const isSpreadsheet =
    lower.endsWith('.xlsx') ||
    lower.endsWith('.xls') ||
    lower.endsWith('.xlsm') ||
    lower.endsWith('.xlsb') ||
    lower.endsWith('.ods');

  if (!isSpreadsheet) {
    return await file.text();
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return '';

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Array<string | number | boolean | null>>(sheet, {
    header: 1,
    defval: '',
    raw: true,
  });

  return rows
    .filter((row) => Array.isArray(row) && row.some((cell) => String(cell ?? '').trim() !== ''))
    .map((row) => row.map((cell) => String(cell ?? '').replace(/\t/g, ' ').trim()).join('\t'))
    .join('\n');
}
