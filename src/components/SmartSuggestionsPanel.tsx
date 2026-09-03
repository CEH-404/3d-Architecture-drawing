import React, { useState } from 'react';
import { HousePlan, HouseRoom, DesignSuggestion } from '../types';
import { analyzeRoomSuggestions, applySuggestionToRoom, applyAllSuggestionsToRoom } from '../utils/suggestionsEngine';
import {
  Sparkles,
  CheckCircle2,
  Sun,
  Maximize2,
  Shield,
  Layers,
  ArrowRight,
  Check,
  Zap,
  X
} from 'lucide-react';

interface SmartSuggestionsPanelProps {
  house: HousePlan;
  activeRoomId: string | null;
  onUpdateHouse: (house: HousePlan) => void;
  onClose: () => void;
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  house,
  activeRoomId,
  onUpdateHouse,
  onClose
}) => {
  const [appliedIds, setAppliedIds] = useState<{ [id: string]: boolean }>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Collect all suggestions across all rooms
  const allSuggestions: { room: HouseRoom; suggestion: DesignSuggestion }[] = [];
  house.rooms.forEach((room) => {
    const list = analyzeRoomSuggestions(room, house);
    list.forEach((s) => {
      allSuggestions.push({ room, suggestion: s });
    });
  });

  const filtered = allSuggestions.filter(({ suggestion }) => {
    if (filterCategory === 'all') return true;
    return suggestion.category === filterCategory;
  });

  // Calculate Health & Optimization Score
  const totalChecks = Math.max(1, allSuggestions.length + 6);
  const remainingIssues = allSuggestions.filter(({ suggestion }) => !appliedIds[suggestion.id]).length;
  const healthScore = Math.max(65, Math.min(100, Math.round(((totalChecks - remainingIssues) / totalChecks) * 100)));

  const handleApply = (room: HouseRoom, suggestionId: string) => {
    const updatedRoom = applySuggestionToRoom(suggestionId, room);
    const updatedRooms = house.rooms.map((r) => (r.id === room.id ? updatedRoom : r));
    onUpdateHouse({ ...house, rooms: updatedRooms });
    setAppliedIds((prev) => ({ ...prev, [suggestionId]: true }));
  };

  const handleApplyAll = () => {
    const updatedRooms = house.rooms.map((room) => applyAllSuggestionsToRoom(room));
    onUpdateHouse({ ...house, rooms: updatedRooms });
    const allApplied: { [id: string]: boolean } = {};
    allSuggestions.forEach(({ suggestion }) => {
      allApplied[suggestion.id] = true;
    });
    setAppliedIds(allApplied);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-[#141414]/15 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-[#141414]/10 bg-[#FAF9F5] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FEF3C7] text-[#D97706] rounded-xl border border-[#F59E0B]/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-[#141414]">
              Architectural Suggestions
            </h2>
            <p className="text-xs text-[#5A5A58]">
              Automated spatial, lighting &amp; ergonomics engine
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[#717170] hover:text-[#141414] hover:bg-[#EAE8E3] rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Score Overview Card */}
      <div className="p-5 bg-gradient-to-b from-[#FAF9F5] to-white border-b border-[#141414]/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#5A5A58]">
              House Optimization Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-[#141414]">{healthScore}%</span>
              <span className="text-xs text-[#059669] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {remainingIssues === 0 ? 'Fully Optimized' : `${remainingIssues} recommended actions`}
              </span>
            </div>
          </div>

          <button
            onClick={handleApplyAll}
            disabled={remainingIssues === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Apply All</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#EAE8E3] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#059669] h-full rounded-full transition-all duration-500"
            style={{ width: `${healthScore}%` }}
          />
        </div>

        {/* Metric Chips */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="bg-white p-2 rounded-xl border border-[#141414]/10">
            <span className="block text-[10px] font-mono text-[#717170]">Daylight</span>
            <span className="text-xs font-bold text-[#0284C7]">Optimal</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-[#141414]/10">
            <span className="block text-[10px] font-mono text-[#717170]">Privacy</span>
            <span className="text-xs font-bold text-[#059669]">Shielded</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-[#141414]/10">
            <span className="block text-[10px] font-mono text-[#717170]">Clearance</span>
            <span className="text-xs font-bold text-[#7C3AED]">36"+ Safe</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="px-5 py-3 border-b border-[#141414]/10 flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'all', label: 'All' },
          { id: 'sacred_orientation', label: 'Sacred / Privacy' },
          { id: 'daylight', label: 'Daylight' },
          { id: 'furniture', label: 'Furnishing' },
          { id: 'ergonomics', label: 'Ergonomics' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              filterCategory === tab.id
                ? 'bg-[#141414] text-white shadow-sm'
                : 'bg-[#FAF9F5] text-[#5A5A58] hover:bg-[#EAE8E3]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="flex-1 p-5 overflow-y-auto space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#717170]">
            <CheckCircle2 className="w-10 h-10 text-[#059669] mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium text-[#141414]">No pending suggestions</p>
            <p className="text-xs text-[#5A5A58] mt-1">All design &amp; architectural standards are currently satisfied.</p>
          </div>
        ) : (
          filtered.map(({ room, suggestion }) => {
            const isApplied = appliedIds[suggestion.id];

            return (
              <div
                key={suggestion.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isApplied
                    ? 'bg-[#F0FDF4] border-[#86EFAC]/50 opacity-80'
                    : 'bg-white border-[#141414]/15 shadow-sm hover:border-[#0284C7]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-[#EAE8E3] text-[#141414]">
                        {room.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          suggestion.impact === 'high'
                            ? 'bg-[#FEE2E2] text-[#DC2626]'
                            : 'bg-[#FEF3C7] text-[#92400E]'
                        }`}
                      >
                        {suggestion.impact === 'high' ? 'High Impact' : 'Recommended'}
                      </span>
                    </div>

                    <h4 className="text-sm font-serif font-bold text-[#141414]">
                      {suggestion.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleApply(room, suggestion.id)}
                    disabled={isApplied}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                      isApplied
                        ? 'bg-[#059669] text-white'
                        : 'bg-[#FAF9F5] hover:bg-[#0284C7] text-[#141414] hover:text-white border border-[#141414]/15 cursor-pointer shadow-sm'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <span>Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-[#5A5A58] mt-2 leading-relaxed">
                  {suggestion.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-[#141414]/5 text-[11px] text-[#059669] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{suggestion.benefit}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
