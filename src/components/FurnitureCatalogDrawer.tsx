import React, { useState } from 'react';
import { HousePlan, HouseRoom, FurnitureCategory, FurnitureItem, RoomType } from '../types';
import {
  Armchair,
  Bed,
  Utensils,
  BookOpen,
  Bath,
  Moon,
  Sparkles,
  Plus,
  Trash2,
  X,
  Check,
  RotateCw,
  Sliders,
  Copy,
  Wand2,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react';

interface FurnitureCatalogDrawerProps {
  house: HousePlan;
  activeRoomId: string | null;
  onUpdateHouse: (house: HousePlan) => void;
  onClose: () => void;
}

interface CatalogPreset {
  name: string;
  category: FurnitureCategory;
  itemType: string;
  defaultColor: string;
  description: string;
}

const CATALOG_ITEMS: CatalogPreset[] = [
  // Seating & Living
  { name: 'L-Shape Sectional Sofa', category: 'seating', itemType: 'sofa_sectional', defaultColor: '#475569', description: 'Plush corner sectional with deep chaise and throw pillows' },
  { name: 'Oak Coffee Table', category: 'seating', itemType: 'coffee_table', defaultColor: '#b45309', description: 'Solid European oak table with tapered steel legs' },
  { name: '75" TV Media Wall & Console', category: 'decor', itemType: 'tv_media_wall', defaultColor: '#18181b', description: 'Wall-mounted slim 4K screen with floating credenza' },
  { name: 'Balcony Bistro Set', category: 'seating', itemType: 'balcony_set', defaultColor: '#d97706', description: 'Teak round table with woven patio armchairs' },

  // Sleeping
  { name: 'King Bed with Headboard', category: 'sleeping', itemType: 'king_bed', defaultColor: '#334155', description: '2.0m King bed with padded headboard & duvet fold' },
  { name: 'Bedside Nightstand & Lamp', category: 'sleeping', itemType: 'nightstand', defaultColor: '#b45309', description: 'Wood nightstand with illuminated brass bedside lamp' },
  { name: 'Wardrobe Closet', category: 'storage', itemType: 'wardrobe', defaultColor: '#f1f5f9', description: 'Full-height 2-door wardrobe storage cabinet' },

  // Dining & Kitchen
  { name: 'Marble Waterfall Island', category: 'kitchen', itemType: 'kitchen_island', defaultColor: '#f8fafc', description: 'Calacatta marble island with sink & 3 barstools' },
  { name: 'Kitchen Counters & Cooktop', category: 'kitchen', itemType: 'kitchen_counters', defaultColor: '#0f172a', description: 'Base cabinets with cooktop & upper shelving' },
  { name: 'French Door Refrigerator', category: 'kitchen', itemType: 'refrigerator', defaultColor: '#94a3b8', description: 'Stainless steel dual refrigerator unit' },
  { name: '6-Seater Oak Dining Table', category: 'dining', itemType: 'dining_table', defaultColor: '#78350f', description: 'Solid wood table with 6 upholstered chairs' },

  // Office
  { name: 'Executive Desk Setup', category: 'office', itemType: 'desk_setup', defaultColor: '#451a03', description: 'Walnut workspace with dual monitors & desk pad' },
  { name: 'Ergonomic Swivel Chair', category: 'office', itemType: 'executive_chair', defaultColor: '#1e293b', description: 'High-back mesh ergonomic task chair' },
  { name: 'Library Bookshelf Wall', category: 'office', itemType: 'bookshelf_wall', defaultColor: '#78350f', description: 'Floor-to-ceiling display shelving for literature' },

  // Bath
  { name: 'Freestanding Bathtub', category: 'bath', itemType: 'bathtub', defaultColor: '#ffffff', description: 'Seamless acrylic oval soaking tub with floor spout' },
  { name: 'Floating Double Vanity', category: 'bath', itemType: 'vanity_mirror', defaultColor: '#334155', description: 'Wood cabinet with undermount basin & LED mirror' },
  { name: 'Modern Toilet', category: 'bath', itemType: 'toilet', defaultColor: '#f1f5f9', description: 'Wall-hung porcelain toilet' },

  // Sacred / Prayer
  { name: 'Emerald Sajjadah Carpet', category: 'prayer', itemType: 'prayer_rug', defaultColor: '#047857', description: 'Plush velvet prayer rug with Mihrab arch weave' },
  { name: 'Qibla Mihrab Arch Feature', category: 'prayer', itemType: 'mihrab_arch', defaultColor: '#d97706', description: 'Traditional arched wall focal niche' },
  { name: 'Rehal Quran Book Stand', category: 'prayer', itemType: 'quran_stand', defaultColor: '#92400e', description: 'Folding carved wood stand for sacred texts' },

  // Decor & Flora
  { name: 'Fiddle Leaf Fig Plant', category: 'decor', itemType: 'indoor_plant', defaultColor: '#15803d', description: 'Lush indoor plant in white ceramic cylinder planter' }
];

const PALETTE_COLORS = [
  { name: 'Walnut', hex: '#451a03' },
  { name: 'Oak', hex: '#b45309' },
  { name: 'Slate', hex: '#475569' },
  { name: 'Charcoal', hex: '#18181b' },
  { name: 'Marble White', hex: '#f8fafc' },
  { name: 'Emerald', hex: '#047857' },
  { name: 'Terracotta', hex: '#c2410c' },
  { name: 'Gold / Brass', hex: '#d97706' }
];

export const FurnitureCatalogDrawer: React.FC<FurnitureCatalogDrawerProps> = ({
  house,
  activeRoomId,
  onUpdateHouse,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'manage'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const targetRoom = house.rooms.find((r) => r.id === (activeRoomId || house.rooms[0]?.id));

  const filteredCatalog = CATALOG_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleAddItemToRoom = (preset: CatalogPreset) => {
    if (!targetRoom) return;

    const newItem: FurnitureItem = {
      id: `f-${preset.itemType}-${Date.now()}`,
      name: preset.name,
      category: preset.category,
      itemType: preset.itemType,
      x: 0,
      z: 0,
      rotation: 0,
      enabled: true,
      color: preset.defaultColor
    };

    const updatedRooms = house.rooms.map((r) => {
      if (r.id === targetRoom.id) {
        return { ...r, furniture: [...r.furniture, newItem] };
      }
      return r;
    });

    onUpdateHouse({ ...house, rooms: updatedRooms });
    setSelectedItemId(newItem.id);
  };

  const handleRemoveItem = (itemId: string) => {
    if (!targetRoom) return;
    const updatedRooms = house.rooms.map((r) => {
      if (r.id === targetRoom.id) {
        return { ...r, furniture: r.furniture.filter((f) => f.id !== itemId) };
      }
      return r;
    });
    onUpdateHouse({ ...house, rooms: updatedRooms });
    if (selectedItemId === itemId) setSelectedItemId(null);
  };

  const handleDuplicateItem = (item: FurnitureItem) => {
    if (!targetRoom) return;
    const dup: FurnitureItem = {
      ...JSON.parse(JSON.stringify(item)),
      id: `f-${item.itemType}-${Date.now()}`,
      name: `${item.name} (Copy)`,
      x: item.x + 12,
      z: item.z + 12
    };
    const updatedRooms = house.rooms.map((r) => {
      if (r.id === targetRoom.id) {
        return { ...r, furniture: [...r.furniture, dup] };
      }
      return r;
    });
    onUpdateHouse({ ...house, rooms: updatedRooms });
    setSelectedItemId(dup.id);
  };

  const handleAddCustomPiece = () => {
    if (!targetRoom) return;
    const newItem: FurnitureItem = {
      id: `custom-piece-${Date.now()}`,
      name: 'Custom Architectural Element',
      category: 'decor',
      itemType: 'coffee_table',
      x: 0,
      z: 0,
      y: 0,
      rotation: 0,
      width: 48,
      depth: 32,
      height: 30,
      color: '#0284C7',
      enabled: true
    };
    const updatedRooms = house.rooms.map((r) => {
      if (r.id === targetRoom.id) {
        return { ...r, furniture: [...r.furniture, newItem] };
      }
      return r;
    });
    onUpdateHouse({ ...house, rooms: updatedRooms });
    setSelectedItemId(newItem.id);
    setActiveTab('manage');
  };

  const handleUpdateItemProps = (itemId: string, updater: Partial<FurnitureItem>) => {
    if (!targetRoom) return;
    const updatedRooms = house.rooms.map((r) => {
      if (r.id === targetRoom.id) {
        return {
          ...r,
          furniture: r.furniture.map((item) => (item.id === itemId ? { ...item, ...updater } : item))
        };
      }
      return r;
    });
    onUpdateHouse({ ...house, rooms: updatedRooms });
  };

  const handleAutoFurnish = () => {
    if (!targetRoom) return;
    let autoItems: FurnitureItem[] = [];
    const type = targetRoom.type;

    if (type === 'master_bedroom' || type === 'guest_bedroom' || type === 'kids_room') {
      autoItems = [
        { id: `f-bed-${Date.now()}-1`, name: 'King Bed with Headboard', category: 'sleeping', itemType: 'king_bed', x: 0, z: -20, rotation: 0, enabled: true, color: '#334155' },
        { id: `f-nightstand-${Date.now()}-2`, name: 'Bedside Nightstand & Lamp (Left)', category: 'sleeping', itemType: 'nightstand', x: -50, z: -20, rotation: 0, enabled: true, color: '#b45309' },
        { id: `f-nightstand-${Date.now()}-3`, name: 'Bedside Nightstand & Lamp (Right)', category: 'sleeping', itemType: 'nightstand', x: 50, z: -20, rotation: 0, enabled: true, color: '#b45309' },
        { id: `f-wardrobe-${Date.now()}-4`, name: 'Wardrobe Closet', category: 'storage', itemType: 'wardrobe', x: 45, z: 40, rotation: -Math.PI / 2, enabled: true, color: '#f1f5f9' },
        { id: `f-plant-${Date.now()}-5`, name: 'Fiddle Leaf Fig Plant', category: 'decor', itemType: 'indoor_plant', x: -45, z: 45, rotation: 0, enabled: true, color: '#15803d' }
      ];
    } else if (type === 'living_room') {
      autoItems = [
        { id: `f-sofa-${Date.now()}-1`, name: 'L-Shape Sectional Sofa', category: 'seating', itemType: 'sofa_sectional', x: 0, z: -10, rotation: 0, enabled: true, color: '#475569' },
        { id: `f-table-${Date.now()}-2`, name: 'Oak Coffee Table', category: 'seating', itemType: 'coffee_table', x: 0, z: 20, rotation: 0, enabled: true, color: '#b45309' },
        { id: `f-tv-${Date.now()}-3`, name: '75" TV Media Wall & Console', category: 'decor', itemType: 'tv_media_wall', x: 0, z: 65, rotation: 0, enabled: true, color: '#18181b' },
        { id: `f-plant-${Date.now()}-4`, name: 'Fiddle Leaf Fig Plant', category: 'decor', itemType: 'indoor_plant', x: -55, z: -40, rotation: 0, enabled: true, color: '#15803d' }
      ];
    } else if (type === 'prayer_room') {
      autoItems = [
        { id: `f-mihrab-${Date.now()}-1`, name: 'Qibla Mihrab Arch Feature', category: 'prayer', itemType: 'mihrab_arch', x: 0, z: 65, rotation: 0, enabled: true, color: '#d97706' },
        { id: `f-rug-${Date.now()}-2`, name: 'Emerald Sajjadah Carpet', category: 'prayer', itemType: 'prayer_rug', x: 0, z: 20, rotation: 0, enabled: true, color: '#047857' },
        { id: `f-quran-${Date.now()}-3`, name: 'Rehal Quran Book Stand', category: 'prayer', itemType: 'quran_stand', x: -35, z: 50, rotation: 0, enabled: true, color: '#92400e' },
        { id: `f-plant-${Date.now()}-4`, name: 'Fiddle Leaf Fig Plant', category: 'decor', itemType: 'indoor_plant', x: 45, z: 50, rotation: 0, enabled: true, color: '#15803d' }
      ];
    } else if (type === 'home_office') {
      autoItems = [
        { id: `f-desk-${Date.now()}-1`, name: 'Executive Desk Setup', category: 'office', itemType: 'desk_setup', x: 0, z: -10, rotation: 0, enabled: true, color: '#451a03' },
        { id: `f-chair-${Date.now()}-2`, name: 'Ergonomic Swivel Chair', category: 'office', itemType: 'executive_chair', x: 0, z: 15, rotation: Math.PI, enabled: true, color: '#1e293b' },
        { id: `f-bookshelf-${Date.now()}-3`, name: 'Library Bookshelf Wall', category: 'office', itemType: 'bookshelf_wall', x: -50, z: 20, rotation: Math.PI / 2, enabled: true, color: '#78350f' },
        { id: `f-plant-${Date.now()}-4`, name: 'Fiddle Leaf Fig Plant', category: 'decor', itemType: 'indoor_plant', x: 45, z: -40, rotation: 0, enabled: true, color: '#15803d' }
      ];
    } else if (type === 'kitchen' || type === 'dining_room') {
      autoItems = [
        { id: `f-island-${Date.now()}-1`, name: 'Marble Waterfall Island', category: 'kitchen', itemType: 'kitchen_island', x: 0, z: 0, rotation: 0, enabled: true, color: '#f8fafc' },
        { id: `f-counters-${Date.now()}-2`, name: 'Kitchen Counters & Cooktop', category: 'kitchen', itemType: 'kitchen_counters', x: 0, z: -50, rotation: 0, enabled: true, color: '#0f172a' },
        { id: `f-fridge-${Date.now()}-3`, name: 'French Door Refrigerator', category: 'kitchen', itemType: 'refrigerator', x: 50, z: -50, rotation: 0, enabled: true, color: '#94a3b8' }
      ];
    } else if (type === 'bathroom') {
      autoItems = [
        { id: `f-vanity-${Date.now()}-1`, name: 'Floating Double Vanity', category: 'bath', itemType: 'vanity_mirror', x: -35, z: -40, rotation: 0, enabled: true, color: '#334155' },
        { id: `f-tub-${Date.now()}-2`, name: 'Freestanding Bathtub', category: 'bath', itemType: 'bathtub', x: 35, z: 20, rotation: 0, enabled: true, color: '#ffffff' },
        { id: `f-toilet-${Date.now()}-3`, name: 'Modern Toilet', category: 'bath', itemType: 'toilet', x: -40, z: 40, rotation: 0, enabled: true, color: '#f1f5f9' }
      ];
    }

    const updatedRooms = house.rooms.map((r) => {
      if (r.id === targetRoom.id) {
        return { ...r, furniture: autoItems };
      }
      return r;
    });

    onUpdateHouse({ ...house, rooms: updatedRooms });
  };

  const handleClearFurniture = () => {
    if (!targetRoom) return;
    const updatedRooms = house.rooms.map((r) => {
      if (r.id === targetRoom.id) {
        return { ...r, furniture: [] };
      }
      return r;
    });
    onUpdateHouse({ ...house, rooms: updatedRooms });
    setSelectedItemId(null);
  };

  const activeSelectedItem = targetRoom?.furniture.find((f) => f.id === selectedItemId);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-[#141414]/15 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-[#141414]/10 bg-[#FAF9F5] flex items-center justify-between">
        <div>
          <h2 className="text-base font-serif font-bold text-[#141414]">
            3D Furniture &amp; Fixtures
          </h2>
          <p className="text-xs text-[#5A5A58]">
            Active Room: <span className="font-semibold text-[#0284C7]">{targetRoom?.name || 'Selected Room'}</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[#717170] hover:text-[#141414] hover:bg-[#EAE8E3] rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#141414]/10 bg-[#F5F4F0] px-4 gap-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-[#5A5A58] hover:text-[#141414]'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add from Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`py-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeTab === 'manage'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-[#5A5A58] hover:text-[#141414]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Room Items ({targetRoom?.furniture.length || 0})</span>
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Categories */}
          <div className="px-4 py-2.5 border-b border-[#141414]/10 flex items-center gap-1.5 overflow-x-auto bg-white">
            {[
              { id: 'all', label: 'All' },
              { id: 'seating', label: 'Seating' },
              { id: 'sleeping', label: 'Bedroom' },
              { id: 'kitchen', label: 'Kitchen' },
              { id: 'dining', label: 'Dining' },
              { id: 'office', label: 'Office' },
              { id: 'bath', label: 'Bathroom' },
              { id: 'prayer', label: 'Prayer' },
              { id: 'decor', label: 'Decor' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#141414] text-white shadow-xs'
                    : 'bg-[#FAF9F5] text-[#5A5A58] hover:bg-[#EAE8E3]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {/* Quick Smart Actions */}
            <div className="flex items-center gap-2 pb-2 border-b border-[#141414]/10">
              <button
                onClick={handleAutoFurnish}
                className="flex-1 py-2 px-3 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Auto-Furnish</span>
              </button>

              <button
                onClick={handleAddCustomPiece}
                className="py-2 px-3 bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                title="Create a custom element with bespoke dimensions and color"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Custom Piece</span>
              </button>

              {targetRoom && targetRoom.furniture.length > 0 && (
                <button
                  onClick={handleClearFurniture}
                  className="py-2 px-3 bg-[#FEE2E2] hover:bg-[#FECACA] text-[#DC2626] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                  title="Remove all items"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {filteredCatalog.map((preset) => {
                return (
                  <div
                    key={preset.name}
                    className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#141414]/10 hover:border-[#0284C7]/40 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: preset.defaultColor }}
                        />
                        <h4 className="text-xs font-bold text-[#141414] truncate">
                          {preset.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#5A5A58] mt-0.5 line-clamp-1">
                        {preset.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddItemToRoom(preset)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#0284C7] text-[#141414] hover:text-white border border-[#141414]/15 shadow-xs transition flex items-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Manage Room Items Tab */
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {targetRoom && targetRoom.furniture.length > 0 ? (
            <>
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A5A58] font-mono">
                  Active Room Furniture List
                </h3>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {targetRoom.furniture.map((f) => {
                    const isSelected = selectedItemId === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedItemId(f.id)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-[#F0F9FF] border-[#0284C7]'
                            : 'bg-white border-[#141414]/10 hover:bg-[#FAF9F5]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 flex-shrink-0"
                            style={{ backgroundColor: f.color || '#475569' }}
                          />
                          <span className="text-xs font-semibold text-[#141414] truncate">{f.name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateItemProps(f.id, { enabled: !f.enabled });
                            }}
                            className="p-1 text-[#5A5A58] hover:text-[#141414] rounded"
                            title={f.enabled ? 'Hide in 3D' : 'Show in 3D'}
                          >
                            {f.enabled !== false ? <Eye className="w-3.5 h-3.5 text-[#059669]" /> : <EyeOff className="w-3.5 h-3.5 text-[#DC2626]" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateItem(f);
                            }}
                            className="p-1 text-[#5A5A58] hover:text-[#141414] rounded"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(f.id);
                            }}
                            className="p-1 text-[#DC2626] hover:bg-[#FEE2E2] rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Item Editor Controls */}
              {activeSelectedItem && (
                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#141414]/15 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#141414]/10">
                    <span className="text-xs font-serif font-bold text-[#141414]">
                      Edit Piece Properties
                    </span>
                    <span className="text-[10px] font-mono uppercase text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded font-semibold">
                      {activeSelectedItem.category}
                    </span>
                  </div>

                  {/* Custom Item Label */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#5A5A58] block">Item Name / Tag:</label>
                    <input
                      type="text"
                      value={activeSelectedItem.name}
                      onChange={(e) => handleUpdateItemProps(activeSelectedItem.id, { name: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#141414]/15 rounded-lg text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>

                  {/* Position X Slider & Steppers */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5A5A58] font-medium">Position X (Lateral)</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateItemProps(activeSelectedItem.id, { x: (activeSelectedItem.x || 0) - 6 })}
                          className="px-1.5 py-0.5 bg-white border border-[#141414]/20 rounded text-[10px] font-mono hover:bg-[#EAE8E3]"
                        >
                          -6&quot;
                        </button>
                        <span className="font-mono text-[#141414] font-semibold min-w-[32px] text-center">
                          {Math.round(activeSelectedItem.x || 0)}&quot;
                        </span>
                        <button
                          onClick={() => handleUpdateItemProps(activeSelectedItem.id, { x: (activeSelectedItem.x || 0) + 6 })}
                          className="px-1.5 py-0.5 bg-white border border-[#141414]/20 rounded text-[10px] font-mono hover:bg-[#EAE8E3]"
                        >
                          +6&quot;
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      step="1"
                      value={activeSelectedItem.x || 0}
                      onChange={(e) => handleUpdateItemProps(activeSelectedItem.id, { x: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                    />
                  </div>

                  {/* Position Z Slider & Steppers */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5A5A58] font-medium">Position Z (Depth)</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateItemProps(activeSelectedItem.id, { z: (activeSelectedItem.z || 0) - 6 })}
                          className="px-1.5 py-0.5 bg-white border border-[#141414]/20 rounded text-[10px] font-mono hover:bg-[#EAE8E3]"
                        >
                          -6&quot;
                        </button>
                        <span className="font-mono text-[#141414] font-semibold min-w-[32px] text-center">
                          {Math.round(activeSelectedItem.z || 0)}&quot;
                        </span>
                        <button
                          onClick={() => handleUpdateItemProps(activeSelectedItem.id, { z: (activeSelectedItem.z || 0) + 6 })}
                          className="px-1.5 py-0.5 bg-white border border-[#141414]/20 rounded text-[10px] font-mono hover:bg-[#EAE8E3]"
                        >
                          +6&quot;
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      step="1"
                      value={activeSelectedItem.z || 0}
                      onChange={(e) => handleUpdateItemProps(activeSelectedItem.id, { z: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                    />
                  </div>

                  {/* Elevation Y Slider (Height above floor) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5A5A58] font-medium">Elevation Y (Above Floor)</span>
                      <span className="font-mono text-[#141414] font-semibold">
                        {Math.round(activeSelectedItem.y || 0)}&quot;
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="1"
                      value={activeSelectedItem.y || 0}
                      onChange={(e) => handleUpdateItemProps(activeSelectedItem.id, { y: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                    />
                  </div>

                  {/* Free 360 Rotation Slider & Quick Snaps */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5A5A58] font-medium">Orientation / Rotation</span>
                      <span className="font-mono text-[#141414] font-semibold">
                        {Math.round((((activeSelectedItem.rotation || 0) * 180) / Math.PI) % 360)}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={Math.round((((activeSelectedItem.rotation || 0) * 180) / Math.PI) % 360)}
                      onChange={(e) =>
                        handleUpdateItemProps(activeSelectedItem.id, {
                          rotation: (parseFloat(e.target.value) * Math.PI) / 180
                        })
                      }
                      className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                    />

                    <div className="grid grid-cols-5 gap-1 pt-1">
                      {[
                        { label: '0°', val: 0 },
                        { label: '45°', val: Math.PI / 4 },
                        { label: '90°', val: Math.PI / 2 },
                        { label: '180°', val: Math.PI },
                        { label: '270°', val: (3 * Math.PI) / 2 }
                      ].map((rot) => {
                        const isRot = Math.abs((activeSelectedItem.rotation || 0) - rot.val) < 0.08;
                        return (
                          <button
                            key={rot.label}
                            onClick={() => handleUpdateItemProps(activeSelectedItem.id, { rotation: rot.val })}
                            className={`py-1 text-[11px] font-mono font-semibold rounded-lg border transition cursor-pointer ${
                              isRot
                                ? 'bg-[#141414] text-white border-[#141414]'
                                : 'bg-white text-[#5A5A58] hover:bg-[#EAE8E3] border-[#141414]/10'
                            }`}
                          >
                            {rot.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sizing Scale Multiplier */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5A5A58] font-medium">Scale Multiplier</span>
                      <span className="font-mono text-[#141414] font-semibold">
                        {(activeSelectedItem.width ? (activeSelectedItem.width / 48).toFixed(2) : '1.00')}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.8"
                      step="0.05"
                      value={activeSelectedItem.width ? activeSelectedItem.width / 48 : 1.0}
                      onChange={(e) => {
                        const factor = parseFloat(e.target.value);
                        handleUpdateItemProps(activeSelectedItem.id, {
                          width: Math.round(48 * factor),
                          depth: Math.round(36 * factor),
                          height: Math.round(30 * factor)
                        });
                      }}
                      className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                    />
                  </div>

                  {/* Color Palette & Custom Hex */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#5A5A58] font-medium flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5" />
                        <span>Finish Color</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-[#717170]">Hex:</span>
                        <input
                          type="text"
                          value={activeSelectedItem.color || '#475569'}
                          onChange={(e) => handleUpdateItemProps(activeSelectedItem.id, { color: e.target.value })}
                          className="w-16 px-1.5 py-0.5 bg-white border border-[#141414]/15 rounded font-mono text-[10px] text-[#141414]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {PALETTE_COLORS.map((c) => {
                        const isColor = activeSelectedItem.color === c.hex;
                        return (
                          <button
                            key={c.hex}
                            onClick={() => handleUpdateItemProps(activeSelectedItem.id, { color: c.hex })}
                            className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                              isColor
                                ? 'border-[#0284C7] scale-110 shadow-sm ring-2 ring-[#0284C7]/30'
                                : 'border-black/15 hover:scale-105'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-[#717170]">
              <Armchair className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No furniture items in this room yet.</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-3 px-3 py-1.5 bg-[#0284C7] text-white rounded-xl text-xs font-semibold hover:bg-[#0369A1] transition cursor-pointer"
              >
                Browse Furniture Catalog
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

