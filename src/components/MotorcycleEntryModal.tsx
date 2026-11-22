import React, { useState, useMemo, useRef } from 'react';
import {
  Bike,
  Plus,
  Trash2,
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Search,
  Layers,
} from 'lucide-react';
import { MotorcycleModel } from '../types';
import { MOTORCYCLE_BRANDS_LIST } from '../data/motostradaData';
import { formatPHP } from '../utils/calculator';
import {
  downloadMotorcycleMassExcelTemplate,
  parseUploadedMotorcycleFile,
  MASS_TEMPLATE_TAB_TEXT,
} from '../utils/excelTemplate';

export type MotorcycleModalTab = 'manual' | 'mass' | 'delete';

interface MotorcycleEntryModalProps {
  isOpen: boolean;
  initialTab?: MotorcycleModalTab;
  onClose: () => void;
  existingSeries: string[];
  allVisibleBikes: MotorcycleModel[];
  customMotorcycles: MotorcycleModel[];
  deletedModels: string[];
  onAddMotorcycles: (bikes: MotorcycleModel[]) => void;
  onDeleteMotorcycles: (modelNames: string[]) => void;
  onRestoreDefaults: () => void;
  onSelectAddedBike?: (series: string, model: string, srp: number) => void;
}

interface ParsedRowResult {
  lineNumber: number;
  raw: string;
  valid: boolean;
  error?: string;
  bike?: MotorcycleModel;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  if (delimiter !== ',') {
    return line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ''));
  }
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseMassMotorcycleText(input: string): ParsedRowResult[] {
  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const results: ParsedRowResult[] = [];

  lines.forEach((rawLine, index) => {
    const lineNum = index + 1;
    // Detect delimiter per line (tab > pipe > semicolon > comma)
    const delimiter = rawLine.includes('\t')
      ? '\t'
      : rawLine.includes('|')
      ? '|'
      : rawLine.includes(';')
      ? ';'
      : ',';

    const cols = parseCsvLine(rawLine, delimiter);

    // Skip header row automatically
    if (
      index === 0 &&
      cols.length >= 2 &&
      cols.some((c) =>
        /^(motorcyclebrand|brand|model|price\/srp.*|srp|price|lineup\/series|lineup|series|displacement.*|cc|category)$/i.test(
          c.replace(/[\s()*₱]/g, '')
        )
      )
    ) {
      return;
    }

    // Column order:
    // 0: Motorcycle Brand
    // 1: Model
    // 2: Price / SRP (₱) *
    // 3: Lineup / Series (optional, defaults to `${brand} Lineup`)
    // 4: Displacement (CC) (optional)
    // 5: Category (optional)
    let brand = '';
    let model = '';
    let srpRaw = '';
    let series = '';
    let displacement = 'Standard';
    let category = 'Motorcycle';

    if (cols.length >= 3) {
      brand = cols[0] || 'Custom Brand';
      model = cols[1] || '';
      srpRaw = cols[2] || '';
      series = cols[3] || `${brand} Lineup`;
      displacement = cols[4] || 'Standard';
      category = cols[5] || 'Motorcycle';
    } else if (cols.length === 1) {
      // Single column (e.g. model name only — usable for Mass Delete)
      results.push({
        lineNumber: lineNum,
        raw: rawLine,
        valid: false,
        error: 'Need at least: Motorcycle Brand, Model, Price / SRP (₱) *',
        bike: {
          brand: 'Custom',
          series: 'Custom Lineup',
          model: cols[0],
          srp: 0,
          category: 'Motorcycle',
          displacement: 'Standard',
          isCustom: true,
        },
      });
      return;
    } else {
      results.push({
        lineNumber: lineNum,
        raw: rawLine,
        valid: false,
        error: 'Incomplete columns (need Motorcycle Brand, Model, Price / SRP)',
      });
      return;
    }

    const cleanedSrp = Number(srpRaw.replace(/[₱,\s]/g, ''));
    if (!model) {
      results.push({
        lineNumber: lineNum,
        raw: rawLine,
        valid: false,
        error: 'Missing Model name',
      });
      return;
    }
    if (!Number.isFinite(cleanedSrp) || cleanedSrp <= 0) {
      results.push({
        lineNumber: lineNum,
        raw: rawLine,
        valid: false,
        error: `Invalid SRP "${srpRaw}"`,
        bike: {
          brand,
          series,
          model,
          srp: 0,
          category,
          displacement,
          isCustom: true,
        },
      });
      return;
    }

    results.push({
      lineNumber: lineNum,
      raw: rawLine,
      valid: true,
      bike: {
        brand,
        series,
        model,
        srp: Math.round(cleanedSrp),
        category,
        displacement,
        isCustom: true,
      },
    });
  });

  return results;
}

export const MotorcycleEntryModal: React.FC<MotorcycleEntryModalProps> = ({
  isOpen,
  initialTab = 'manual',
  onClose,
  existingSeries,
  allVisibleBikes,
  customMotorcycles,
  deletedModels,
  onAddMotorcycles,
  onDeleteMotorcycles,
  onRestoreDefaults,
  onSelectAddedBike,
}) => {
  const [activeTab, setActiveTab] = useState<MotorcycleModalTab>(initialTab);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync tab when reopened
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStatusNotice(null);
    }
  }, [isOpen, initialTab]);

  // Manual Entry State
  const [manualBrand, setManualBrand] = useState<string>('Honda');
  const [customBrandInput, setCustomBrandInput] = useState<string>('');
  const [manualSeries, setManualSeries] = useState<string>('Honda Lineup');
  const [manualModel, setManualModel] = useState<string>('');
  const [manualSrp, setManualSrp] = useState<string>('');
  const [manualCategory, setManualCategory] = useState<string>('Motorcycle');
  const [manualDisplacement, setManualDisplacement] = useState<string>('');

  // Mass Entry / Mass Upload State
  const [massText, setMassText] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete / Manage List State
  const [manageSearch, setManageSearch] = useState<string>('');
  const [manageBrandFilter, setManageBrandFilter] = useState<string>('All');
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  const parsedRows = useMemo(() => parseMassMotorcycleText(massText), [massText]);
  const validParsedBikes = useMemo(
    () => parsedRows.filter((r) => r.valid && r.bike).map((r) => r.bike as MotorcycleModel),
    [parsedRows]
  );
  const deletableParsedModels = useMemo(() => {
    const models: string[] = [];
    parsedRows.forEach((r) => {
      if (r.bike?.model) models.push(r.bike.model);
    });
    return Array.from(new Set(models));
  }, [parsedRows]);

  // Filtered bikes for Delete / Manage tab
  const uniqueBrands = useMemo(() => {
    const brands = Array.from(new Set(allVisibleBikes.map((b) => b.brand || 'CFMOTO')));
    return ['All', ...brands];
  }, [allVisibleBikes]);

  const filteredManageBikes = useMemo(() => {
    const q = manageSearch.trim().toLowerCase();
    return allVisibleBikes.filter((b) => {
      const bBrand = b.brand || 'CFMOTO';
      const matchesBrand = manageBrandFilter === 'All' || bBrand === manageBrandFilter;
      const matchesSearch =
        !q ||
        b.model.toLowerCase().includes(q) ||
        bBrand.toLowerCase().includes(q) ||
        b.series.toLowerCase().includes(q);
      return matchesBrand && matchesSearch;
    });
  }, [allVisibleBikes, manageSearch, manageBrandFilter]);

  if (!isOpen) return null;

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusNotice({ type, text });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleManualBrandChange = (val: string) => {
    setManualBrand(val);
    if (val !== 'Other Motorcycle Brand') {
      setManualSeries(`${val} Lineup`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedBrand =
      manualBrand === 'Other Motorcycle Brand' ? customBrandInput.trim() : manualBrand.trim();
    const resolvedSeries = manualSeries.trim() || `${resolvedBrand || 'Custom'} Lineup`;
    const resolvedModel = manualModel.trim();
    const resolvedSrp = Number(manualSrp.replace(/[₱,\s]/g, ''));

    if (!resolvedBrand) {
      showToast('error', 'Please enter a Motorcycle Brand.');
      return;
    }
    if (!resolvedModel) {
      showToast('error', 'Please enter a Motorcycle Model name.');
      return;
    }
    if (!Number.isFinite(resolvedSrp) || resolvedSrp <= 0) {
      showToast('error', 'Please enter a valid SRP amount.');
      return;
    }

    const newBike: MotorcycleModel = {
      brand: resolvedBrand,
      series: resolvedSeries,
      model: resolvedModel,
      srp: Math.round(resolvedSrp),
      category: manualCategory.trim() || 'Motorcycle',
      displacement: manualDisplacement.trim() || 'Standard',
      isCustom: true,
    };

    onAddMotorcycles([newBike]);
    onSelectAddedBike?.(newBike.series, newBike.model, newBike.srp);

    setManualModel('');
    setManualSrp('');
    setManualDisplacement('');
    showToast('success', `Added "${newBike.brand} ${newBike.model}" (${formatPHP(newBike.srp)})`);
  };

  const handleDownloadMassTemplate = () => {
    try {
      downloadMotorcycleMassExcelTemplate();
      showToast('success', 'Downloaded Excel Mass Template (.xlsx)');
    } catch {
      showToast('error', 'Unable to download Excel template file.');
    }
  };

  const handleLoadSampleTemplate = () => {
    setMassText(MASS_TEMPLATE_TAB_TEXT);
    setUploadedFileName('');
    showToast('success', 'Sample Excel template rows loaded into editor.');
  };

  const handleMassFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    try {
      const content = await parseUploadedMotorcycleFile(file);
      setMassText(content);
      const rows = parseMassMotorcycleText(content);
      const validCount = rows.filter((r) => r.valid).length;
      showToast('success', `Loaded "${file.name}" (${validCount} valid entries detected)`);
    } catch {
      showToast('error', 'Failed to read uploaded Excel / spreadsheet file.');
    } finally {
      e.target.value = '';
    }
  };

  const handleMassAdd = () => {
    if (validParsedBikes.length === 0) {
      showToast('error', 'No valid motorcycle rows found to upload.');
      return;
    }
    onAddMotorcycles(validParsedBikes);
    const first = validParsedBikes[0];
    onSelectAddedBike?.(first.series, first.model, first.srp);
    showToast('success', `Mass added ${validParsedBikes.length} motorcycle model(s) to lineup!`);
  };

  const handleMassDeleteByText = () => {
    if (deletableParsedModels.length === 0) {
      showToast('error', 'Enter or upload rows containing Model names to mass delete.');
      return;
    }
    onDeleteMotorcycles(deletableParsedModels);
    showToast('success', `Removed ${deletableParsedModels.length} matching model(s) from lineup.`);
  };

  const toggleSelectModel = (model: string) => {
    setSelectedForDelete((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredModels = filteredManageBikes.map((b) => b.model);
    const allSelected =
      filteredModels.length > 0 && filteredModels.every((m) => selectedForDelete.includes(m));
    if (allSelected) {
      setSelectedForDelete((prev) => prev.filter((m) => !filteredModels.includes(m)));
    } else {
      setSelectedForDelete((prev) => Array.from(new Set([...prev, ...filteredModels])));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedForDelete.length === 0) {
      showToast('error', 'Select at least one model to delete.');
      return;
    }
    onDeleteMotorcycles(selectedForDelete);
    showToast('success', `Deleted ${selectedForDelete.length} selected model(s).`);
    setSelectedForDelete([]);
  };

  const handleDeleteBrandLineup = () => {
    if (manageBrandFilter === 'All') {
      showToast('error', 'Select a specific Brand filter first to delete an entire brand.');
      return;
    }
    const brandModels = allVisibleBikes
      .filter((b) => (b.brand || 'CFMOTO') === manageBrandFilter)
      .map((b) => b.model);
    if (brandModels.length === 0) return;
    onDeleteMotorcycles(brandModels);
    setSelectedForDelete([]);
    setManageBrandFilter('All');
    showToast('success', `Deleted all ${brandModels.length} model(s) under ${manageBrandFilter}.`);
  };

  const handleDeleteAllCustom = () => {
    if (customMotorcycles.length === 0) {
      showToast('error', 'There are no custom / mass-uploaded models to remove.');
      return;
    }
    const names = customMotorcycles.map((b) => b.model);
    onDeleteMotorcycles(names);
    setSelectedForDelete([]);
    showToast('success', `Removed all ${names.length} custom / mass-uploaded model(s).`);
  };

  return (
    <div className="fixed inset-0 z-50 th-overlay backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="th-card-strong border-2 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="th-hero border-b th-border px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl th-btn-primary flex items-center justify-center shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black th-heading">
                Motorcycle Brand / Lineup &amp; Model Manager
              </h3>
              <p className="text-[11px] th-text-muted">
                Upload manual new entry, mass upload / delete models, or download mass template
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="th-text-muted hover:opacity-80 p-1.5 rounded-lg th-subpanel transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="th-subpanel border-b th-border px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
              activeTab === 'manual'
                ? 'th-btn-primary border-transparent shadow-sm font-black'
                : 'th-card hover:opacity-90'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual New Entry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mass')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
              activeTab === 'mass'
                ? 'th-btn-primary border-transparent shadow-sm font-black'
                : 'th-card hover:opacity-90'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Mass Entry &amp; Upload</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('delete')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
              activeTab === 'delete'
                ? 'th-btn-primary border-transparent shadow-sm font-black'
                : 'th-card hover:opacity-90'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete / Manage ({allVisibleBikes.length})</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMassTemplate}
            className="ml-auto flex items-center gap-1.5 th-badge border px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer hover:opacity-90 transition-all"
            title="Download Excel (.xlsx) template for mass upload"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Mass Template (.xlsx)</span>
          </button>
        </div>

        {/* Status Toast */}
        {statusNotice && (
          <div
            className={`mx-4 sm:mx-6 mt-3 px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              statusNotice.type === 'success'
                ? 'th-badge-alt'
                : 'th-badge'
            }`}
          >
            {statusNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusNotice.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: MANUAL NEW ENTRY */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider th-accent mb-1.5">
                    Motorcycle Brand *
                  </label>
                  <select
                    value={manualBrand}
                    onChange={(e) => handleManualBrandChange(e.target.value)}
                    className="w-full th-input border rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                  >
                    {MOTORCYCLE_BRANDS_LIST.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  {manualBrand === 'Other Motorcycle Brand' && (
                    <input
                      type="text"
                      value={customBrandInput}
                      onChange={(e) => {
                        setCustomBrandInput(e.target.value);
                        if (e.target.value.trim()) {
                          setManualSeries(`${e.target.value.trim()} Lineup`);
                        }
                      }}
                      placeholder="Type Brand Name (e.g. Bristol, Rusi, Moto Morini)"
                      className="mt-2 w-full th-input border rounded-xl px-3.5 py-2 text-sm font-semibold"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider th-accent mb-1.5">
                    Lineup / Series *
                  </label>
                  <input
                    type="text"
                    list="existing-series-suggestions"
                    value={manualSeries}
                    onChange={(e) => setManualSeries(e.target.value)}
                    placeholder="e.g. Honda Lineup, MT Series, ADV Series"
                    className="w-full th-input border rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                  />
                  <datalist id="existing-series-suggestions">
                    {existingSeries.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider th-accent mb-1.5">
                    Motorcycle Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualModel}
                    onChange={(e) => setManualModel(e.target.value)}
                    placeholder="e.g. ADV 160, Click 125i, Ninja ZX-4RR"
                    className="w-full th-input border rounded-xl px-3.5 py-2.5 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider th-accent mb-1.5">
                    Price / SRP (₱) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 th-accent font-bold">₱</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={manualSrp}
                      onChange={(e) => setManualSrp(e.target.value)}
                      placeholder="e.g. 166900"
                      className="w-full th-input border rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold th-accent-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider th-accent mb-1.5">
                    Displacement (CC)
                  </label>
                  <input
                    type="text"
                    value={manualDisplacement}
                    onChange={(e) => setManualDisplacement(e.target.value)}
                    placeholder="e.g. 157cc, 449cc"
                    className="w-full th-input border rounded-xl px-3.5 py-2.5 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider th-accent mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    placeholder="e.g. Adventure, Scooter, Naked Sport"
                    className="w-full th-input border rounded-xl px-3.5 py-2.5 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t th-border-subtle">
                <button
                  type="button"
                  onClick={() => setActiveTab('mass')}
                  className="th-btn-secondary border px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Switch to Mass Entry
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 th-btn-primary font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Motorcycle Entry</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MASS ENTRY / MASS UPLOAD */}
          {activeTab === 'mass' && (
            <div className="space-y-4">
              {/* Mass Template & File Upload Row */}
              <div className="th-subpanel border rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadMassTemplate}
                    className="flex items-center gap-1.5 th-btn-secondary border px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 th-accent" />
                    <span>Download Mass Template (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSampleTemplate}
                    className="flex items-center gap-1.5 th-badge border px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Insert Sample Rows</span>
                  </button>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.xlsm,.ods,.csv,.txt,.tsv"
                    onChange={handleMassFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 th-btn-primary px-3.5 py-2 rounded-xl text-xs font-black shadow-sm cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Excel (.xlsx / .xls)</span>
                  </button>
                </div>
              </div>

              {uploadedFileName && (
                <div className="text-[11px] th-accent font-semibold">
                  Loaded file: <span className="font-mono font-bold">{uploadedFileName}</span>
                </div>
              )}

              {/* Paste / Edit Mass Entry Textarea */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider th-accent">
                    Mass Entry Rows (Excel Copy/Paste, .xlsx Upload, or Comma/Pipe Separated)
                  </label>
                  <span className="text-[10px] th-text-muted font-mono">
                    Motorcycle Brand | Model | Price / SRP (₱) * | Lineup / Series | Displacement (CC) | Category
                  </span>
                </div>
                <textarea
                  value={massText}
                  onChange={(e) => setMassText(e.target.value)}
                  rows={6}
                  placeholder={`Paste Excel rows here or click "Insert Sample Rows" / "Upload Excel (.xlsx / .xls)":\nHonda\tADV 160\t166900\tHonda Scooter\t157cc\tAdventure Scooter\nYamaha\tNMAX 155\t151900\tYamaha MAXI\t155cc\tMaxi Scooter`}
                  className="w-full th-notepad-box border rounded-xl p-3 font-mono text-xs leading-relaxed resize-y focus:outline-none"
                />
              </div>

              {/* Parsed Preview */}
              {parsedRows.length > 0 && (
                <div className="th-subpanel border rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="th-heading">
                      Parsed Preview: {validParsedBikes.length} valid / {parsedRows.length} total row(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMassText('');
                        setUploadedFileName('');
                      }}
                      className="text-[11px] th-text-muted hover:opacity-80 underline cursor-pointer"
                    >
                      Clear Box
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 text-xs font-mono">
                    {parsedRows.map((r) => (
                      <div
                        key={r.lineNumber}
                        className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2 ${
                          r.valid ? 'th-card' : 'th-badge'
                        }`}
                      >
                        {r.valid && r.bike ? (
                          <>
                            <span className="truncate font-semibold">
                              <span className="th-accent">{r.bike.brand}</span> / {r.bike.series} —{' '}
                              <strong className="th-heading">{r.bike.model}</strong>
                            </span>
                            <span className="th-accent-2 font-bold shrink-0">
                              {formatPHP(r.bike.srp)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px]">
                            Line {r.lineNumber}: {r.error}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mass Add & Mass Delete Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t th-border-subtle">
                <button
                  type="button"
                  onClick={handleMassDeleteByText}
                  disabled={deletableParsedModels.length === 0}
                  className="flex items-center gap-1.5 th-badge border px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Delete all models matching the rows above from Brand / Lineup & Model"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Mass Delete Matching ({deletableParsedModels.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleMassAdd}
                  disabled={validParsedBikes.length === 0}
                  className="flex items-center gap-1.5 th-btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Mass Add / Upload ({validParsedBikes.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DELETE / MANAGE LIST */}
          {activeTab === 'delete' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 th-accent absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={manageSearch}
                    onChange={(e) => setManageSearch(e.target.value)}
                    placeholder="Search Brand, Lineup, or Model..."
                    className="w-full th-input border rounded-xl pl-9 pr-3 py-2 text-xs font-medium"
                  />
                </div>
                <select
                  value={manageBrandFilter}
                  onChange={(e) => setManageBrandFilter(e.target.value)}
                  className="th-input border rounded-xl px-3 py-2 text-xs font-bold"
                >
                  {uniqueBrands.map((b) => (
                    <option key={b} value={b}>
                      {b === 'All' ? 'All Brands' : b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulk Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 th-subpanel border rounded-xl p-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="th-btn-secondary border px-2.5 py-1.5 rounded-lg font-bold cursor-pointer"
                  >
                    Select / Unselect Visible ({filteredManageBikes.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={selectedForDelete.length === 0}
                    className="flex items-center gap-1 th-badge border px-3 py-1.5 rounded-lg font-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Mass Delete Selected ({selectedForDelete.length})</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {manageBrandFilter !== 'All' && (
                    <button
                      type="button"
                      onClick={handleDeleteBrandLineup}
                      className="flex items-center gap-1 th-badge border px-2.5 py-1.5 rounded-lg font-bold cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Delete {manageBrandFilter}</span>
                    </button>
                  )}
                  {customMotorcycles.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeleteAllCustom}
                      className="th-btn-secondary border px-2.5 py-1.5 rounded-lg font-bold cursor-pointer"
                    >
                      Clear Added ({customMotorcycles.length})
                    </button>
                  )}
                  {deletedModels.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onRestoreDefaults();
                        showToast('success', 'Restored all default catalog motorcycles.');
                      }}
                      className="flex items-center gap-1 th-badge-alt border px-2.5 py-1.5 rounded-lg font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Defaults ({deletedModels.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Models List with Individual Delete */}
              <div className="max-h-72 overflow-y-auto border th-border rounded-xl divide-y th-border-subtle">
                {filteredManageBikes.length === 0 ? (
                  <div className="p-6 text-center text-xs th-text-muted">
                    No motorcycle models match your filter.
                  </div>
                ) : (
                  filteredManageBikes.map((bike) => {
                    const checked = selectedForDelete.includes(bike.model);
                    return (
                      <div
                        key={`${bike.series}-${bike.model}`}
                        className="px-3 py-2 flex items-center justify-between gap-2 text-xs th-card hover:opacity-95"
                      >
                        <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelectModel(bike.model)}
                            className="rounded cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="font-bold th-heading truncate flex items-center gap-1.5">
                              <span>{bike.model}</span>
                              {bike.isCustom && (
                                <span className="text-[9px] th-badge-alt border px-1.5 py-0.5 rounded font-bold">
                                  Added
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] th-text-muted truncate">
                              {bike.brand || 'CFMOTO'} • {bike.series}
                            </div>
                          </div>
                        </label>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="font-mono font-bold th-accent-2">
                            {formatPHP(bike.srp)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteMotorcycles([bike.model]);
                              setSelectedForDelete((prev) => prev.filter((m) => m !== bike.model));
                              showToast('success', `Deleted "${bike.model}"`);
                            }}
                            className="p-1.5 rounded-lg th-badge border hover:opacity-80 cursor-pointer"
                            title={`Delete ${bike.model}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
