import React, { useState } from 'react';
import {
  SelectedObjectInfo,
  HousePlan,
  HouseRoom,
  FurnitureItem,
  ViewSettings,
  RoomDimensions,
  FloorMaterialType,
  DoorType,
  WindowWallPlacement,
  PartitionStyle,
  SurroundingBuilding
} from '../types';
import { formatDimension } from '../utils/constants';
import {
  X,
  Eye,
  Trash2,
  Copy,
  RotateCw,
  Move,
  Palette,
  Maximize2,
  Sliders,
  Sparkles,
  Layers,
  Square,
  DoorOpen,
  AppWindow,
  Building2,
  Trees,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sun,
  ShieldAlert,
  Compass,
  CornerDownRight
} from 'lucide-react';

interface ObjectCustomizerPanelProps {
  selectedObject: SelectedObjectInfo | null;
  house: HousePlan;
  activeRoom: HouseRoom;
  settings: ViewSettings;
  onClose: () => void;
  onFocusObject: (obj: SelectedObjectInfo) => void;
  onUpdateFurniture: (roomId: string | undefined, updatedItem: FurnitureItem) => void;
  onDuplicateFurniture: (roomId: string | undefined, item: FurnitureItem) => void;
  onDeleteFurniture: (roomId: string | undefined, itemId: string) => void;
  onUpdateRoomSpecs: (roomId: string | undefined, updater: Partial<RoomDimensions>) => void;
  onUpdateSettings: (updater: Partial<ViewSettings>) => void;
  onUpdateHouse: (house: HousePlan) => void;
}

const FURNITURE_SWATCHES = [
  { name: 'Natural Oak', hex: '#b45309' },
  { name: 'Dark Walnut', hex: '#451a03' },
  { name: 'Carrara Marble', hex: '#f8fafc' },
  { name: 'Matte Slate', hex: '#475569' },
  { name: 'Midnight Charcoal', hex: '#18181b' },
  { name: 'Emerald Velvet', hex: '#047857' },
  { name: 'Terracotta', hex: '#c2410c' },
  { name: 'Royal Navy', hex: '#1e3a8a' },
  { name: 'Olive Sage', hex: '#65a30d' },
  { name: 'Champagne Brass', hex: '#d97706' },
  { name: 'Cream Linen', hex: '#f5f5dc' },
  { name: 'Alabaster White', hex: '#ffffff' }
];

const WALL_SWATCHES = [
  { name: 'Pure Alabaster', hex: '#FAF9F5' },
  { name: 'Warm Linen Greige', hex: '#EAE6DF' },
  { name: 'Desert Sand', hex: '#E5DACB' },
  { name: 'Sage Mist', hex: '#DEE4D8' },
  { name: 'Nordic Slate', hex: '#CBD5E1' },
  { name: 'Modern Charcoal', hex: '#334155' },
  { name: 'Moroccan Ochre', hex: '#D97706' },
  { name: 'Raw Plaster', hex: '#F0EFEB' }
];

const FLOOR_FINISHES: { id: FloorMaterialType; name: string; desc: string; iconBg: string }[] = [
  { id: 'hardwood', name: 'Oak Hardwood', desc: 'Warm horizontal grain planks', iconBg: 'bg-[#B45309]' },
  { id: 'marble', name: 'Carrara Marble', desc: 'Seamless polished white stone', iconBg: 'bg-[#F1F5F9]' },
  { id: 'terrazzo', name: 'Polished Terrazzo', desc: 'Artisanal mineral aggregate', iconBg: 'bg-[#94A3B8]' },
  { id: 'carpet', name: 'Plush Wool Carpet', desc: 'Acoustic soft weave textile', iconBg: 'bg-[#64748B]' },
  { id: 'concrete', name: 'Poured Concrete', desc: 'Industrial minimalist raw finish', iconBg: 'bg-[#78716C]' },
  { id: 'tile_slate', name: 'Dark Slate Tile', desc: 'Contemporary textured pavers', iconBg: 'bg-[#334155]' },
  { id: 'deck_wood', name: 'Teak Wood Deck', desc: 'Weather-resistant outdoor slatted deck', iconBg: 'bg-[#92400E]' }
];

export const ObjectCustomizerPanel: React.FC<ObjectCustomizerPanelProps> = ({
  selectedObject,
  house,
  activeRoom,
  settings,
  onClose,
  onFocusObject,
  onUpdateFurniture,
  onDuplicateFurniture,
  onDeleteFurniture,
  onUpdateRoomSpecs,
  onUpdateSettings,
  onUpdateHouse
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [nudgeStep, setNudgeStep] = useState<6 | 12>(6);

  if (!selectedObject) return null;

  // Resolve target room
  const targetRoom: HouseRoom =
    house.rooms.find((r) => r.id === selectedObject.roomId) || activeRoom;

  // Resolve furniture item if type is furniture
  const currentFurniture: FurnitureItem | undefined =
    selectedObject.type === 'furniture'
      ? targetRoom.furniture.find((f) => f.id === selectedObject.id) || selectedObject.furnitureItem
      : undefined;

  // Resolve surrounding building if type is site_building
  const currentBuilding: SurroundingBuilding | undefined =
    selectedObject.type === 'site_building'
      ? house.siteEnvironment?.surroundingBuildings.find((b) => b.id === selectedObject.id)
      : undefined;

  // Header icon
  const renderHeaderIcon = () => {
    switch (selectedObject.type) {
      case 'furniture':
        return <Square className="w-4 h-4 text-[#7C3AED]" />;
      case 'wall':
        return <Layers className="w-4 h-4 text-[#0284C7]" />;
      case 'floor':
        return <Maximize2 className="w-4 h-4 text-[#B45309]" />;
      case 'door':
        return <DoorOpen className="w-4 h-4 text-[#059669]" />;
      case 'window':
        return <AppWindow className="w-4 h-4 text-[#0284C7]" />;
      case 'partition':
        return <Sliders className="w-4 h-4 text-[#D97706]" />;
      case 'ceiling':
        return <Layers className="w-4 h-4 text-[#64748B]" />;
      case 'site_building':
        return <Building2 className="w-4 h-4 text-[#475569]" />;
      case 'site_road':
        return <Trees className="w-4 h-4 text-[#10B981]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#0284C7]" />;
    }
  };

  // ----------------------------------------------------
  // Furniture Handlers
  // ----------------------------------------------------
  const handleFurnitureColorChange = (hex: string) => {
    if (!currentFurniture) return;
    onUpdateFurniture(targetRoom.id, {
      ...currentFurniture,
      color: hex
    });
  };

  const handleFurnitureNudge = (deltaX: number, deltaZ: number) => {
    if (!currentFurniture) return;
    onUpdateFurniture(targetRoom.id, {
      ...currentFurniture,
      x: (currentFurniture.x || 0) + deltaX,
      z: (currentFurniture.z || 0) + deltaZ
    });
  };

  const handleFurnitureElevation = (deltaY: number) => {
    if (!currentFurniture) return;
    const newY = Math.max(0, (currentFurniture.y || 0) + deltaY);
    onUpdateFurniture(targetRoom.id, {
      ...currentFurniture,
      y: newY
    });
  };

  const handleFurnitureRotation = (deg: number) => {
    if (!currentFurniture) return;
    onUpdateFurniture(targetRoom.id, {
      ...currentFurniture,
      rotation: (deg + 360) % 360
    });
  };

  const handleFurnitureRotateDelta = (deltaDeg: number) => {
    if (!currentFurniture) return;
    const nextRot = ((currentFurniture.rotation || 0) + deltaDeg + 360) % 360;
    onUpdateFurniture(targetRoom.id, {
      ...currentFurniture,
      rotation: nextRot
    });
  };

  return (
    <div
      className="absolute top-28 right-6 z-30 pointer-events-auto select-none transition-all duration-200"
      style={{ width: '380px', maxWidth: 'calc(100vw - 32px)' }}
    >
      <div className="bg-[#FAF9F5]/95 backdrop-blur-xl rounded-2xl border border-[#141414]/15 shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
        {/* Card Header */}
        <div className="px-4 py-3 bg-[#FAF9F5] border-b border-[#141414]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#141414]/10 flex items-center justify-center shadow-xs shrink-0">
              {renderHeaderIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.5 rounded">
                  {selectedObject.type.replace('_', ' ')}
                </span>
                {selectedObject.roomName && (
                  <span className="text-[11px] font-medium text-[#5A5A58] truncate">
                    • {selectedObject.roomName}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-[#141414] truncate mt-0.5">
                {currentFurniture?.name || selectedObject.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onFocusObject(selectedObject)}
              title="Focus in 3D"
              className="p-1.5 rounded-lg hover:bg-[#EAE8E3] text-[#5A5A58] hover:text-[#0284C7] transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand" : "Collapse"}
              className="p-1.5 rounded-lg hover:bg-[#EAE8E3] text-[#5A5A58] transition-colors"
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Deselect"
              className="p-1.5 rounded-lg hover:bg-rose-50 text-[#5A5A58] hover:text-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Body */}
        {!isCollapsed && (
          <div className="p-4 overflow-y-auto space-y-4 text-xs">
            {/* ==================================================== */}
            {/* 1. FURNITURE CUSTOMIZATION */}
            {/* ==================================================== */}
            {selectedObject.type === 'furniture' && currentFurniture && (
              <div className="space-y-4">
                {/* Quick Actions (Duplicate, Toggle, Delete) */}
                <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-[#141414]/10">
                  <button
                    onClick={() => onFocusObject(selectedObject)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#FAF9F5] hover:bg-[#EAE8E3] font-medium text-[#141414] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#0284C7]" />
                    <span>Focus 3D</span>
                  </button>
                  <button
                    onClick={() => onDuplicateFurniture(targetRoom.id, currentFurniture)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#FAF9F5] hover:bg-[#EAE8E3] font-medium text-[#141414] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => onDeleteFurniture(targetRoom.id, currentFurniture.id)}
                    className="py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 font-medium text-rose-700 flex items-center justify-center transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Color & Material Finish Swatches */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#141414] flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#0284C7]" />
                      Color & Material Finish
                    </span>
                    <label className="flex items-center gap-1 text-[11px] font-mono text-[#5A5A58] cursor-pointer hover:text-[#141414]">
                      <span>Custom</span>
                      <input
                        type="color"
                        value={currentFurniture.color || '#475569'}
                        onChange={(e) => handleFurnitureColorChange(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border border-[#141414]/20 p-0"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {FURNITURE_SWATCHES.map((swatch) => {
                      const isCurrent = currentFurniture.color?.toLowerCase() === swatch.hex.toLowerCase();
                      return (
                        <button
                          key={swatch.hex}
                          onClick={() => handleFurnitureColorChange(swatch.hex)}
                          title={swatch.name}
                          className={`group relative aspect-square rounded-xl border flex items-center justify-center shadow-xs transition-transform active:scale-95 ${
                            isCurrent ? 'ring-2 ring-[#0284C7] ring-offset-2 border-transparent' : 'border-[#141414]/15 hover:scale-105'
                          }`}
                          style={{ backgroundColor: swatch.hex }}
                        >
                          {isCurrent && (
                            <Check className={`w-3.5 h-3.5 ${['#ffffff', '#f8fafc', '#f5f5dc'].includes(swatch.hex) ? 'text-[#141414]' : 'text-white'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3D Nudge & Position Transform */}
                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#141414] flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-[#0284C7]" />
                      Position & Alignment
                    </span>
                    <div className="flex items-center gap-1 bg-[#FAF9F5] p-0.5 rounded-lg border border-[#141414]/10 font-mono text-[10px]">
                      <button
                        onClick={() => setNudgeStep(6)}
                        className={`px-1.5 py-0.5 rounded ${nudgeStep === 6 ? 'bg-white font-semibold text-[#0284C7] shadow-xs' : 'text-[#5A5A58]'}`}
                      >
                        6″
                      </button>
                      <button
                        onClick={() => setNudgeStep(12)}
                        className={`px-1.5 py-0.5 rounded ${nudgeStep === 12 ? 'bg-white font-semibold text-[#0284C7] shadow-xs' : 'text-[#5A5A58]'}`}
                      >
                        12″
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* D-Pad Nudge */}
                    <div className="flex flex-col items-center justify-center p-2 bg-[#FAF9F5] rounded-xl border border-[#141414]/10">
                      <button
                        onClick={() => handleFurnitureNudge(0, -nudgeStep)}
                        title="Nudge Backward (North)"
                        className="p-2 rounded-lg bg-white hover:bg-[#EAE8E3] border border-[#141414]/10 active:scale-90 transition-transform shadow-xs"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-3 my-1">
                        <button
                          onClick={() => handleFurnitureNudge(-nudgeStep, 0)}
                          title="Nudge Left (West)"
                          className="p-2 rounded-lg bg-white hover:bg-[#EAE8E3] border border-[#141414]/10 active:scale-90 transition-transform shadow-xs"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onUpdateFurniture(targetRoom.id, {
                              ...currentFurniture,
                              x: 0,
                              z: 0
                            });
                          }}
                          title="Center in Room"
                          className="px-1.5 py-1 rounded bg-[#0284C7] text-white font-mono text-[9px] font-semibold"
                        >
                          CTR
                        </button>
                        <button
                          onClick={() => handleFurnitureNudge(nudgeStep, 0)}
                          title="Nudge Right (East)"
                          className="p-2 rounded-lg bg-white hover:bg-[#EAE8E3] border border-[#141414]/10 active:scale-90 transition-transform shadow-xs"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleFurnitureNudge(0, nudgeStep)}
                        title="Nudge Forward (South)"
                        className="p-2 rounded-lg bg-white hover:bg-[#EAE8E3] border border-[#141414]/10 active:scale-90 transition-transform shadow-xs"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Coordinates & Elevation */}
                    <div className="space-y-2 flex flex-col justify-center">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#5A5A58]">X Offset:</span>
                        <span className="font-mono font-medium text-[#141414]">
                          {Math.round(currentFurniture.x || 0)}″ ({Math.round(((currentFurniture.x || 0) * 2.54))} cm)
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#5A5A58]">Z Offset:</span>
                        <span className="font-mono font-medium text-[#141414]">
                          {Math.round(currentFurniture.z || 0)}″ ({Math.round(((currentFurniture.z || 0) * 2.54))} cm)
                        </span>
                      </div>
                      <div className="pt-1 border-t border-[#141414]/10">
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="text-[#5A5A58]">Elevation (Y):</span>
                          <span className="font-mono font-semibold text-[#0284C7]">
                            {Math.round(currentFurniture.y || 0)}″
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleFurnitureElevation(-3)}
                            className="flex-1 py-1 rounded bg-[#FAF9F5] hover:bg-[#EAE8E3] border border-[#141414]/10 font-mono text-[10px]"
                          >
                            -3″
                          </button>
                          <button
                            onClick={() => handleFurnitureElevation(3)}
                            className="flex-1 py-1 rounded bg-[#FAF9F5] hover:bg-[#EAE8E3] border border-[#141414]/10 font-mono text-[10px]"
                          >
                            +3″
                          </button>
                          <button
                            onClick={() => onUpdateFurniture(targetRoom.id, { ...currentFurniture, y: 0 })}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-mono text-[9px]"
                            title="Drop to floor"
                          >
                            Floor
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3D Rotation Controls */}
                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#141414] flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-[#0284C7]" />
                      Rotation Angle
                    </span>
                    <span className="font-mono font-bold text-[#0284C7]">
                      {Math.round(currentFurniture.rotation || 0)}°
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                    {[0, 90, 180, 270].map((angle) => (
                      <button
                        key={angle}
                        onClick={() => handleFurnitureRotation(angle)}
                        className={`py-1.5 rounded-lg border transition-colors ${
                          (currentFurniture.rotation || 0) === angle
                            ? 'bg-[#0284C7] text-white border-[#0284C7] font-semibold'
                            : 'bg-[#FAF9F5] text-[#141414] border-[#141414]/10 hover:bg-[#EAE8E3]'
                        }`}
                      >
                        {angle}°
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleFurnitureRotateDelta(-45)}
                      className="flex-1 py-1.5 rounded-lg bg-[#FAF9F5] hover:bg-[#EAE8E3] border border-[#141414]/10 font-mono text-[10px] text-[#5A5A58]"
                    >
                      ↺ -45°
                    </button>
                    <button
                      onClick={() => handleFurnitureRotateDelta(45)}
                      className="flex-1 py-1.5 rounded-lg bg-[#FAF9F5] hover:bg-[#EAE8E3] border border-[#141414]/10 font-mono text-[10px] text-[#5A5A58]"
                    >
                      ↻ +45°
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* 2. WALL CUSTOMIZATION */}
            {/* ==================================================== */}
            {selectedObject.type === 'wall' && (
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-xl border border-[#141414]/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#5A5A58]">Selected Segment:</span>
                    <span className="font-semibold text-[#0284C7] capitalize">
                      {selectedObject.wallPosition ? `${selectedObject.wallPosition} Wall` : 'Room Wall'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#5A5A58]">
                    <span>Room Ceiling Height:</span>
                    <span className="font-mono font-medium text-[#141414]">
                      {formatDimension(targetRoom.specs.height, settings.unit)}
                    </span>
                  </div>
                </div>

                {/* Wall Paint Color */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#141414] flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#0284C7]" />
                      Wall Paint & Finish
                    </span>
                    <label className="flex items-center gap-1 text-[11px] font-mono text-[#5A5A58] cursor-pointer">
                      <span>Custom</span>
                      <input
                        type="color"
                        value={targetRoom.specs.wallColor || '#FAF9F5'}
                        onChange={(e) => onUpdateRoomSpecs(targetRoom.id, { wallColor: e.target.value })}
                        className="w-5 h-5 rounded cursor-pointer border border-[#141414]/20 p-0"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {WALL_SWATCHES.map((swatch) => {
                      const isSelected = targetRoom.specs.wallColor?.toLowerCase() === swatch.hex.toLowerCase();
                      return (
                        <button
                          key={swatch.hex}
                          onClick={() => onUpdateRoomSpecs(targetRoom.id, { wallColor: swatch.hex })}
                          className={`p-2 rounded-xl border text-left flex flex-col justify-between h-14 transition-all ${
                            isSelected ? 'ring-2 ring-[#0284C7] border-transparent shadow-xs' : 'border-[#141414]/15 hover:border-[#141414]/30'
                          }`}
                          style={{ backgroundColor: swatch.hex }}
                        >
                          <span className={`text-[9px] font-semibold leading-tight ${['#FAF9F5', '#EAE6DF', '#E5DACB', '#DEE4D8', '#CBD5E1', '#F0EFEB'].includes(swatch.hex) ? 'text-[#141414]' : 'text-white'}`}>
                            {swatch.name}
                          </span>
                          {isSelected && (
                            <Check className={`w-3.5 h-3.5 self-end ${['#FAF9F5', '#EAE6DF', '#E5DACB', '#DEE4D8', '#CBD5E1', '#F0EFEB'].includes(swatch.hex) ? 'text-[#0284C7]' : 'text-white'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wall Height Adjuster */}
                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-2">
                  <span className="font-semibold text-[#141414] block">Wall & Ceiling Height</span>
                  <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                    {[108, 120, 132, 144].map((h) => (
                      <button
                        key={h}
                        onClick={() => onUpdateRoomSpecs(targetRoom.id, { height: h })}
                        className={`py-1.5 rounded-lg border ${
                          targetRoom.specs.height === h
                            ? 'bg-[#0284C7] text-white border-[#0284C7] font-semibold'
                            : 'bg-[#FAF9F5] text-[#141414] border-[#141414]/10 hover:bg-[#EAE8E3]'
                        }`}
                      >
                        {formatDimension(h, settings.unit)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wall Opacity & Stud Framing */}
                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-[#141414]">Wall Transparency / Opacity</span>
                      <span className="font-mono text-[#0284C7] font-semibold">
                        {Math.round(settings.wallOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.15"
                      max="1.0"
                      step="0.05"
                      value={settings.wallOpacity}
                      onChange={(e) => onUpdateSettings({ wallOpacity: parseFloat(e.target.value) })}
                      className="w-full accent-[#0284C7] cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#141414]/10 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#141414] block">Exposed Stud Framing</span>
                      <span className="text-[10px] text-[#5A5A58]">Show structural 2x4 framing studs</span>
                    </div>
                    <button
                      onClick={() => onUpdateSettings({ showStudFraming: !settings.showStudFraming })}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                        settings.showStudFraming
                          ? 'bg-[#0284C7] text-white'
                          : 'bg-[#FAF9F5] text-[#5A5A58] border border-[#141414]/15'
                      }`}
                    >
                      {settings.showStudFraming ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* 3. FLOOR CUSTOMIZATION */}
            {/* ==================================================== */}
            {selectedObject.type === 'floor' && (
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-xl border border-[#141414]/10 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#5A5A58] block">Total Floor Area</span>
                    <span className="font-bold text-sm text-[#141414]">
                      {Math.round((targetRoom.specs.width * targetRoom.specs.depth) / 144)} sq ft
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-[#5A5A58] block">Metric</span>
                    <span className="font-mono text-xs text-[#0284C7]">
                      {(((targetRoom.specs.width * targetRoom.specs.depth) / 144) * 0.0929).toFixed(1)} m²
                    </span>
                  </div>
                </div>

                {/* Floor Material Picker */}
                <div>
                  <span className="font-semibold text-[#141414] block mb-2">Architectural Floor Finish</span>
                  <div className="space-y-1.5">
                    {FLOOR_FINISHES.map((floor) => {
                      const isCurrent = (targetRoom.specs.floorMaterial || 'hardwood') === floor.id;
                      return (
                        <button
                          key={floor.id}
                          onClick={() => onUpdateRoomSpecs(targetRoom.id, { floorMaterial: floor.id })}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                            isCurrent
                              ? 'bg-[#FAF9F5] border-[#0284C7] ring-1 ring-[#0284C7] shadow-xs'
                              : 'bg-white border-[#141414]/10 hover:border-[#141414]/25'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg ${floor.iconBg} border border-[#141414]/20 shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-[#141414] block text-xs truncate">
                              {floor.name}
                            </span>
                            <span className="text-[10px] text-[#5A5A58] block truncate">
                              {floor.desc}
                            </span>
                          </div>
                          {isCurrent && <Check className="w-4 h-4 text-[#0284C7] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Room Size Adjusters */}
                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-3">
                  <span className="font-semibold text-[#141414] block">Expand / Contract Room Boundary</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-[#5A5A58] block mb-1">Width (X)</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateRoomSpecs(targetRoom.id, { width: Math.max(96, targetRoom.specs.width - 12) })}
                          className="flex-1 py-1 rounded bg-[#FAF9F5] hover:bg-[#EAE8E3] border border-[#141414]/10 font-mono font-bold"
                        >
                          -1′
                        </button>
                        <span className="px-2 font-mono font-semibold text-xs">
                          {formatDimension(targetRoom.specs.width, settings.unit)}
                        </span>
                        <button
                          onClick={() => onUpdateRoomSpecs(targetRoom.id, { width: targetRoom.specs.width + 12 })}
                          className="flex-1 py-1 rounded bg-[#FAF9F5] hover:bg-[#EAE8E3] border border-[#141414]/10 font-mono font-bold"
                        >
                          +1′
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#5A5A58] block mb-1">Depth (Z)</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateRoomSpecs(targetRoom.id, { depth: Math.max(96, targetRoom.specs.depth - 12) })}
                          className="flex-1 py-1 rounded bg-[#FAF9F5] hover:bg-[#EAE8E3] border border-[#141414]/10 font-mono font-bold"
                        >
                          -1′
                        </button>
                        <span className="px-2 font-mono font-semibold text-xs">
                          {formatDimension(targetRoom.specs.depth, settings.unit)}
                        </span>
                        <button
                          onClick={() => onUpdateRoomSpecs(targetRoom.id, { depth: targetRoom.specs.depth + 12 })}
                          className="flex-1 py-1 rounded bg-[#FAF9F5] hover:bg-[#EAE8E3] border border-[#141414]/10 font-mono font-bold"
                        >
                          +1′
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* 4. DOOR CUSTOMIZATION */}
            {/* ==================================================== */}
            {selectedObject.type === 'door' && (
              <div className="space-y-4">
                {/* Live Door Swing Angle Slider */}
                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#141414]">Live Door Swing (Open/Close)</span>
                    <span className="font-mono font-bold text-[#059669]">
                      {targetRoom.specs.doorOpenAngle || 0}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="110"
                    step="5"
                    value={targetRoom.specs.doorOpenAngle || 0}
                    onChange={(e) => onUpdateRoomSpecs(targetRoom.id, { doorOpenAngle: parseInt(e.target.value) })}
                    className="w-full accent-[#059669] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#5A5A58] font-mono">
                    <button
                      onClick={() => onUpdateRoomSpecs(targetRoom.id, { doorOpenAngle: 0 })}
                      className="hover:text-[#141414]"
                    >
                      0° (Shut)
                    </button>
                    <button
                      onClick={() => onUpdateRoomSpecs(targetRoom.id, { doorOpenAngle: 45 })}
                      className="hover:text-[#141414]"
                    >
                      45° (Ajar)
                    </button>
                    <button
                      onClick={() => onUpdateRoomSpecs(targetRoom.id, { doorOpenAngle: 90 })}
                      className="hover:text-[#141414]"
                    >
                      90° (Open)
                    </button>
                  </div>
                </div>

                {/* Door Type */}
                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-2">
                  <span className="font-semibold text-[#141414] block">Door Configuration</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {[
                      { id: 'single_swing', label: 'Single Swing' },
                      { id: 'double_swing', label: 'Double French' },
                      { id: 'sliding', label: 'Pocket Sliding' },
                      { id: 'open_arch', label: 'Open Archway' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => onUpdateRoomSpecs(targetRoom.id, { doorType: type.id as DoorType })}
                        className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                          targetRoom.specs.doorType === type.id
                            ? 'bg-[#059669] text-white border-[#059669] font-semibold'
                            : 'bg-[#FAF9F5] text-[#141414] border-[#141414]/10 hover:bg-[#EAE8E3]'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimensions & Hinge */}
                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#141414]">Door Width</span>
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      {[36, 42, 48].map((w) => (
                        <button
                          key={w}
                          onClick={() => onUpdateRoomSpecs(targetRoom.id, { doorWidth: w })}
                          className={`px-2 py-1 rounded border ${
                            targetRoom.specs.doorWidth === w
                              ? 'bg-[#059669] text-white border-[#059669] font-bold'
                              : 'bg-[#FAF9F5] text-[#141414] border-[#141414]/10'
                          }`}
                        >
                          {w}″
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#141414]/10 flex justify-between items-center">
                    <span className="font-medium text-[#141414]">Hinge Side</span>
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <button
                        onClick={() => onUpdateRoomSpecs(targetRoom.id, { doorHinge: 'left' })}
                        className={`px-3 py-1 rounded border ${
                          targetRoom.specs.doorHinge === 'left'
                            ? 'bg-[#059669] text-white border-[#059669] font-bold'
                            : 'bg-[#FAF9F5] text-[#141414] border-[#141414]/10'
                        }`}
                      >
                        Left
                      </button>
                      <button
                        onClick={() => onUpdateRoomSpecs(targetRoom.id, { doorHinge: 'right' })}
                        className={`px-3 py-1 rounded border ${
                          targetRoom.specs.doorHinge === 'right'
                            ? 'bg-[#059669] text-white border-[#059669] font-bold'
                            : 'bg-[#FAF9F5] text-[#141414] border-[#141414]/10'
                        }`}
                      >
                        Right
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* 5. WINDOW CUSTOMIZATION */}
            {/* ==================================================== */}
            {selectedObject.type === 'window' && (
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-2">
                  <span className="font-semibold text-[#141414] block">Window Wall Placement</span>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                    {(['left', 'back', 'right'] as WindowWallPlacement[]).map((wall) => (
                      <button
                        key={wall}
                        onClick={() => onUpdateRoomSpecs(targetRoom.id, { windowWall: wall })}
                        className={`py-1.5 rounded-lg border capitalize ${
                          targetRoom.specs.windowWall === wall
                            ? 'bg-[#0284C7] text-white border-[#0284C7] font-semibold'
                            : 'bg-[#FAF9F5] text-[#141414] border-[#141414]/10 hover:bg-[#EAE8E3]'
                        }`}
                      >
                        {wall} Wall
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#5A5A58]">Window Width</span>
                      <span className="font-mono font-semibold text-[#0284C7]">
                        {formatDimension(targetRoom.specs.windowWidth, settings.unit)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="36"
                      max="120"
                      step="6"
                      value={targetRoom.specs.windowWidth}
                      onChange={(e) => onUpdateRoomSpecs(targetRoom.id, { windowWidth: parseInt(e.target.value) })}
                      className="w-full accent-[#0284C7] cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#5A5A58]">Sill Height off Floor</span>
                      <span className="font-mono font-semibold text-[#0284C7]">
                        {formatDimension(targetRoom.specs.windowSillHeight, settings.unit)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="60"
                      step="6"
                      value={targetRoom.specs.windowSillHeight}
                      onChange={(e) => onUpdateRoomSpecs(targetRoom.id, { windowSillHeight: parseInt(e.target.value) })}
                      className="w-full accent-[#0284C7] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* 6. PRIVACY PARTITION CUSTOMIZATION */}
            {/* ==================================================== */}
            {selectedObject.type === 'partition' && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-[#141414] block mb-2">Partition Architectural Style</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {[
                      { id: 'timber_slats', label: 'Timber Slats' },
                      { id: 'fluted_glass', label: 'Fluted Glass' },
                      { id: 'mashrabiya', label: 'Mashrabiya' },
                      { id: 'drywall', label: 'Solid Drywall' },
                      { id: 'steel_frame', label: 'Steel & Glass' },
                      { id: 'acoustic_felt', label: 'Acoustic Felt' }
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => onUpdateRoomSpecs(targetRoom.id, { partitionStyle: style.id as PartitionStyle })}
                        className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                          targetRoom.specs.partitionStyle === style.id
                            ? 'bg-[#D97706] text-white border-[#D97706] font-semibold'
                            : 'bg-white text-[#141414] border-[#141414]/10 hover:bg-[#FAF9F5]'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#5A5A58]">Partition Screening Depth:</span>
                    <span className="font-mono font-semibold text-[#D97706]">
                      {formatDimension(targetRoom.specs.partitionDepth, settings.unit)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="72"
                    step="6"
                    value={targetRoom.specs.partitionDepth}
                    onChange={(e) => onUpdateRoomSpecs(targetRoom.id, { partitionDepth: parseInt(e.target.value) })}
                    className="w-full accent-[#D97706] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* 7. SURROUNDING BUILDING CUSTOMIZATION */}
            {/* ==================================================== */}
            {selectedObject.type === 'site_building' && currentBuilding && (
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#5A5A58]">Building Stories / Height:</span>
                    <span className="font-mono font-bold text-[#0284C7]">
                      {Math.round(currentBuilding.height / 120)} Stories ({Math.round(currentBuilding.height / 12)} ft)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="600"
                    step="60"
                    value={currentBuilding.height}
                    onChange={(e) => {
                      if (!house.siteEnvironment) return;
                      const nextH = parseInt(e.target.value);
                      const updatedBldgs = house.siteEnvironment.surroundingBuildings.map((b) =>
                        b.id === currentBuilding.id ? { ...b, height: nextH } : b
                      );
                      onUpdateHouse({
                        ...house,
                        siteEnvironment: {
                          ...house.siteEnvironment,
                          surroundingBuildings: updatedBldgs
                        }
                      });
                    }}
                    className="w-full accent-[#0284C7] cursor-pointer"
                  />
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#141414]/10 space-y-2">
                  <span className="font-semibold text-[#141414] block">Facade Architectural Style</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {['modern', 'brick', 'glass', 'classic'].map((style) => (
                      <button
                        key={style}
                        onClick={() => {
                          if (!house.siteEnvironment) return;
                          const updatedBldgs = house.siteEnvironment.surroundingBuildings.map((b) =>
                            b.id === currentBuilding.id ? { ...b, style: style as any } : b
                          );
                          onUpdateHouse({
                            ...house,
                            siteEnvironment: {
                              ...house.siteEnvironment,
                              surroundingBuildings: updatedBldgs
                            }
                          });
                        }}
                        className={`py-1.5 px-2 rounded-lg border capitalize ${
                          currentBuilding.style === style
                            ? 'bg-[#475569] text-white border-[#475569] font-semibold'
                            : 'bg-[#FAF9F5] text-[#141414] border-[#141414]/10 hover:bg-[#EAE8E3]'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
