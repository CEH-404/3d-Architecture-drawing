import React, { useState } from 'react';
import { HousePlan, HouseRoom, RoomType } from '../types';
import { EXPANSION_PRESETS, expandBedroomToFullHouse, expandCustomModularHouse } from '../utils/houseExpander';
import {
  Sparkles,
  Building2,
  Home,
  Check,
  Layers,
  Sliders,
  X,
  ArrowRight,
  Armchair,
  Maximize2,
  CheckCircle2
} from 'lucide-react';

interface OneBedToFullHouseModalProps {
  currentRoom: HouseRoom;
  onApplyExpandedHouse: (expandedHouse: HousePlan) => void;
  onClose: () => void;
}

export const OneBedToFullHouseModal: React.FC<OneBedToFullHouseModalProps> = ({
  currentRoom,
  onApplyExpandedHouse,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('executive_3bed');
  const [customHouseName, setCustomHouseName] = useState<string>('My Dream Residence');

  // Custom modular room selection
  const [selectedModularRooms, setSelectedModularRooms] = useState<RoomType[]>([
    'living_room',
    'kitchen',
    'dining_room',
    'guest_bedroom',
    'prayer_room',
    'bathroom'
  ]);

  const availableModularRooms: { type: RoomType; label: string; icon: string; desc: string }[] = [
    { type: 'living_room', label: 'Grand Living Room', icon: '🛋️', desc: 'Sectional sofa, coffee table & 75" TV console' },
    { type: 'kitchen', label: 'Chef Island Kitchen', icon: '🍳', desc: 'Cabinets, quartz island, barstools & appliances' },
    { type: 'dining_room', label: 'Formal Dining Suite', icon: '🍷', desc: 'Dining table with 6 upholstered chairs' },
    { type: 'guest_bedroom', label: 'Guest Bedroom', icon: '🛏️', desc: 'Queen bed, nightstands & wardrobe storage' },
    { type: 'kids_room', label: 'Kids / Study Bedroom', icon: '🧸', desc: 'Single bed, study desk & bookshelf' },
    { type: 'prayer_room', label: 'Tranquil Musalla (Sanctuary)', icon: '🕌', desc: 'Emerald prayer carpets, mashrabiya partition & Quran shelf' },
    { type: 'home_office', label: 'Executive Home Office', icon: '💼', desc: 'Executive desk, ergonomic chair & library shelves' },
    { type: 'bathroom', label: 'Spa Bathroom', icon: '🛁', desc: 'Freestanding bathtub, vanity & walk-in shower' },
    { type: 'balcony', label: 'Outdoor Garden Terrace', icon: '🌿', desc: 'Outdoor teak seating, deck flooring & planters' },
    { type: 'foyer', label: 'Entry Foyer', icon: '🚪', desc: 'Console table, mirror & shoe storage bench' }
  ];

  const handleToggleModularRoom = (type: RoomType) => {
    setSelectedModularRooms((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleApplyPreset = (presetId: string) => {
    const expanded = expandBedroomToFullHouse(currentRoom, presetId, customHouseName);
    onApplyExpandedHouse(expanded);
    onClose();
  };

  const handleApplyCustom = () => {
    const expanded = expandCustomModularHouse(currentRoom, selectedModularRooms, customHouseName);
    onApplyExpandedHouse(expanded);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#FAF9F5] text-[#141414] w-full max-w-4xl max-h-[90vh] rounded-3xl border border-[#141414]/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/10 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold tracking-tight text-[#141414] flex items-center gap-2">
                <span>Expand 1-Bedroom to Full House</span>
                <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30 rounded-full text-[10px] font-mono uppercase font-semibold">
                  Furnished & Connected
                </span>
              </h2>
              <p className="text-xs text-[#5A5A58] mt-0.5">
                Automatically transforms <span className="font-semibold text-[#0284C7]">"{currentRoom.name}"</span> into a complete, multi-room architectural home with matching furniture.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#717170] hover:text-[#141414] hover:bg-[#EAE8E3] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#141414]/10 bg-[#F5F4F0] px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'presets'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Architectural Presets (2, 3, 4 Bedrooms)</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'custom'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Custom Room-by-Room Expander</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'presets' ? (
            <div className="space-y-4">
              <div className="text-xs text-[#5A5A58]">
                Select an architectural style. All rooms are generated with optimized wall layouts, doorway connections, and complete 3D furniture sets:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXPANSION_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`relative p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#0284C7] bg-white shadow-md ring-2 ring-[#0284C7]/20'
                          : 'border-[#141414]/10 bg-white/70 hover:bg-white hover:border-[#141414]/20'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-sm font-bold font-serif text-[#141414]">
                              {preset.name}
                            </span>
                            <div className="text-[11px] text-[#0284C7] font-medium mt-0.5">
                              {preset.subtitle}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#0284C7] text-white flex items-center justify-center flex-shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-[#5A5A58] line-clamp-2">
                          {preset.description}
                        </p>

                        {/* Stats Pill */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                          <span className="px-2 py-0.5 bg-[#FAF9F5] border border-[#141414]/10 rounded-md text-[#141414] font-medium">
                            🛏️ {preset.totalBedrooms} Beds
                          </span>
                          <span className="px-2 py-0.5 bg-[#FAF9F5] border border-[#141414]/10 rounded-md text-[#141414] font-medium">
                            🛁 {preset.totalBathrooms} Baths
                          </span>
                          <span className="px-2 py-0.5 bg-[#FAF9F5] border border-[#141414]/10 rounded-md text-[#0284C7] font-bold">
                            📐 ~{preset.estimatedSqFt} sq ft
                          </span>
                        </div>

                        {/* Included Rooms Chips */}
                        <div className="pt-2 border-t border-[#141414]/10">
                          <div className="text-[10px] uppercase font-mono tracking-wider text-[#717170] mb-1.5 font-semibold">
                            Included Spaces:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {preset.includedRooms.map((r, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-[#FAF9F5] text-[#5A5A58] rounded text-[10px] border border-[#141414]/10"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyPreset(preset.id);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-sm'
                              : 'bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#141414] border border-[#141414]/15'
                          }`}
                        >
                          <span>Generate This House</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Custom Modular Tab */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#141414] mb-1">
                  Custom Residence Name
                </label>
                <input
                  type="text"
                  value={customHouseName}
                  onChange={(e) => setCustomHouseName(e.target.value)}
                  placeholder="e.g., Mountain View Sanctuary Villa"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[#141414]/20 focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#141414]">
                    Select Spaces to Connect with "{currentRoom.name}":
                  </span>
                  <span className="text-[11px] font-mono text-[#0284C7] font-bold">
                    {selectedModularRooms.length + 1} Total Rooms
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableModularRooms.map((room) => {
                    const isChecked = selectedModularRooms.includes(room.type);
                    return (
                      <div
                        key={room.type}
                        onClick={() => handleToggleModularRoom(room.type)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                          isChecked
                            ? 'bg-white border-[#0284C7] shadow-sm'
                            : 'bg-white/60 hover:bg-white border-[#141414]/10'
                        }`}
                      >
                        <div className="text-xl">{room.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#141414]">
                              {room.label}
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="accent-[#0284C7] cursor-pointer"
                            />
                          </div>
                          <p className="text-[11px] text-[#5A5A58] mt-0.5">
                            {room.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#141414]/10 bg-white flex items-center justify-between">
          <div className="text-xs text-[#5A5A58] flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span>Includes complete 3D procedural furnishings, doors & materials.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#5A5A58] hover:text-[#141414] hover:bg-[#EAE8E3] rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (activeTab === 'presets') {
                  handleApplyPreset(selectedPresetId);
                } else {
                  handleApplyCustom();
                }
              }}
              className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Expand to Full House Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
