import React, { useState, useMemo } from 'react';
import {
  Bike,
  Search,
  Calculator,
  Zap,
  ArrowRight,
  Gauge,
  Layers,
} from 'lucide-react';
import { ALL_MOTORCYCLES } from '../data/motostradaData';
import { MotorcycleModel } from '../types';
import { formatPHP } from '../utils/calculator';

interface MotorcycleCatalogProps {
  onSelectBikeForLoan: (series: string, model: string) => void;
  onAskAIAboutBike?: (model: string, series: string, srp: number) => void;
  customMotorcycles?: MotorcycleModel[];
  deletedModels?: string[];
}

export const MotorcycleCatalog: React.FC<MotorcycleCatalogProps> = ({
  onSelectBikeForLoan,
  customMotorcycles = [],
  deletedModels = [],
}) => {
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('All');
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Combined motorcycles
  const allBikes = useMemo(() => {
    const deletedSet = new Set(deletedModels.map((m) => m.toLowerCase()));
    const customNames = new Set(customMotorcycles.map((c) => c.model.toLowerCase()));
    const defaults = ALL_MOTORCYCLES.filter(
      (b) => !deletedSet.has(b.model.toLowerCase()) && !customNames.has(b.model.toLowerCase())
    );
    const customs = customMotorcycles.filter((b) => !deletedSet.has(b.model.toLowerCase()));
    return [...customs, ...defaults];
  }, [customMotorcycles, deletedModels]);

  // Unique brands
  const brandList = useMemo(() => {
    return ['All', ...Array.from(new Set(allBikes.map((b) => b.brand || 'CFMOTO')))];
  }, [allBikes]);

  // Unique series
  const seriesList = useMemo(() => {
    return ['All', ...Array.from(new Set(allBikes.map((b) => b.series)))];
  }, [allBikes]);

  const filteredBikes = useMemo(() => {
    return allBikes.filter((bike) => {
      const bBrand = bike.brand || 'CFMOTO';
      const matchesBrand =
        selectedBrandFilter === 'All' || bBrand.toLowerCase() === selectedBrandFilter.toLowerCase();
      const matchesSeries =
        selectedSeriesFilter === 'All' || bike.series === selectedSeriesFilter;
      const matchesSearch =
        bike.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.series.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bike.category && bike.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (bike.displacement && bike.displacement.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesBrand && matchesSeries && matchesSearch;
    });
  }, [allBikes, selectedBrandFilter, selectedSeriesFilter, searchQuery]);

  // Helper to estimate a 36-month installment (20% DP, 1.99% monthly add-on)
  const estimate36MoPayment = (srp: number) => {
    const dp = srp * 0.2;
    const principal = srp - dp;
    const interest = principal * 0.0199 * 36;
    return Math.round((principal + interest) / 36);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-8 font-sans">
      {/* Hero Header */}
      <div className="th-hero border-2 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 th-badge border text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Complete Motorcycle Brand Catalog</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black th-heading tracking-tight">
            Explore All {allBikes.length} Motorcycle Brands &amp; Models
          </h2>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="th-card border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 th-accent absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand, model or CC (e.g. 450MT, CBR, NMAX)..."
              className="w-full th-input border rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm"
            />
          </div>

          {/* Brand Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs th-accent font-semibold whitespace-nowrap">Filter Brand:</span>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="th-input border text-xs font-bold rounded-xl px-3 py-2"
            >
              {brandList.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === 'All' ? 'All Brands' : brand}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs th-text-muted font-medium whitespace-nowrap">
            Showing <span className="font-bold th-accent-2">{filteredBikes.length}</span> of{' '}
            {allBikes.length} motorcycles
          </div>
        </div>

        {/* Series Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold th-accent uppercase tracking-wider pr-1">Series:</span>
          {seriesList.slice(0, 12).map((series) => (
            <button
              key={series}
              onClick={() => setSelectedSeriesFilter(series)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedSeriesFilter === series
                  ? 'th-btn-primary border-transparent font-black shadow-md'
                  : 'th-btn-secondary'
              }`}
            >
              {series}
            </button>
          ))}
        </div>
      </div>

      {/* Motorcycle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBikes.map((bike) => {
          const estimatedMonthly = estimate36MoPayment(bike.srp);
          const bBrand = bike.brand || 'CFMOTO';

          return (
            <div
              key={bike.model}
              className="th-card border hover:opacity-95 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between group"
            >
              {/* Card Header & Brand Badge */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black th-accent-2 uppercase tracking-wider">
                        {bBrand}
                      </span>
                      {bike.isCustom && (
                        <span className="text-[9px] th-badge-alt border px-1.5 py-0.5 rounded font-bold">
                          Custom
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black th-heading tracking-tight transition-colors">
                      {bike.model}
                    </h3>
                    <p className="text-xs th-text-muted mt-0.5">
                      {bike.category || bike.series}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl th-subpanel border flex items-center justify-center th-accent transition-colors shrink-0">
                    <Bike className="w-5 h-5" />
                  </div>
                </div>

                {/* Specs Badges */}
                <div className="flex items-center gap-2 text-[11px] pt-2 border-t th-border-subtle">
                  <div className="flex items-center gap-1 th-badge-alt border px-2.5 py-1 rounded-lg">
                    <Gauge className="w-3 h-3" />
                    <span>{bike.displacement || 'Displacement'}</span>
                  </div>
                  <div className="flex items-center gap-1 th-badge border px-2.5 py-1 rounded-lg">
                    <Layers className="w-3 h-3" />
                    <span>{bike.series}</span>
                  </div>
                </div>

                {/* Pricing Block */}
                <div className="th-hero p-4 rounded-2xl border space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] uppercase tracking-wider th-accent font-bold">
                      SRP Price
                    </span>
                    <span className="text-2xl font-black th-heading font-mono">
                      {formatPHP(bike.srp)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs pt-1 border-t th-border-subtle">
                    <span className="th-text-muted">Est. 36 Mos @ 20% DP:</span>
                    <span className="font-mono font-bold th-accent-2">
                      {formatPHP(estimatedMonthly)} / mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={() => onSelectBikeForLoan(bike.series, bike.model)}
                  className="w-full flex items-center justify-center gap-2 th-btn-primary font-black text-xs py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Compute Loan &amp; Quotation</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
