import React from 'react';
import {
  Box,
  Eye,
  Ruler,
  Sun,
  Layers,
  Compass,
  Camera,
  Maximize2,
  Grid,
  ShieldCheck,
  Building2,
  FileText,
  Sliders,
  Sparkles,
  Armchair,
  Map,
  ChevronDown,
  Home,
  RotateCw,
  Footprints,
  Wand2,
  Database,
  Save
} from 'lucide-react';
import { ViewSettings, CameraPreset, RenderMode, HousePlan, HouseRoom } from '../types';
import { formatDimension } from '../utils/constants';
import { HOUSE_PRESETS } from '../utils/houseTemplates';
import { analyzeRoomSuggestions } from '../utils/suggestionsEngine';

interface ToolbarProps {
  settings: ViewSettings;
  house: HousePlan;
  activeRoom: HouseRoom;
  onUpdateSettings: (updater: Partial<ViewSettings>) => void;
  onUpdateHouse: (house: HousePlan) => void;
  onSelectRoom: (roomId: string) => void;
  onCaptureSnapshot: () => void;
  onOpenExpanderModal: () => void;
  onOpenTakeoffModal: () => void;
  onOpenMeasurementInspector: () => void;
  onOpenRoomManager: () => void;
  onOpenDatabaseModal: () => void;
  onOpenSiteModal: () => void;
  activeDrawer: 'specs' | 'lighting' | 'sightline' | 'editor' | 'suggestions' | 'furniture' | null;
  onToggleDrawer: (drawer: 'specs' | 'lighting' | 'sightline' | 'editor' | 'suggestions' | 'furniture' | null) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  settings,
  house,
  activeRoom,
  onUpdateSettings,
  onUpdateHouse,
  onSelectRoom,
  onCaptureSnapshot,
  onOpenExpanderModal,
  onOpenTakeoffModal,
  onOpenMeasurementInspector,
  onOpenRoomManager,
  onOpenDatabaseModal,
  onOpenSiteModal,
  activeDrawer,
  onToggleDrawer
}) => {
  const specs = activeRoom.specs;

  // Calculate total pending suggestions count across the house
  let pendingSuggestionsCount = 0;
  house.rooms.forEach((r) => {
    pendingSuggestionsCount += analyzeRoomSuggestions(r, house).length;
  });

  const cameraPresets: { id: CameraPreset; label: string; icon: React.ReactNode }[] = [
    { id: 'isometric', label: 'Isometric 3D', icon: <Box className="w-3.5 h-3.5" /> },
    { id: 'doorway_eye', label: 'Doorway Eye', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'first_person', label: 'Walk-In 3D', icon: <Footprints className="w-3.5 h-3.5 text-[#10B981]" /> },
    { id: 'top_down', label: 'Top-Down', icon: <Grid className="w-3.5 h-3.5" /> },
    { id: 'inside_qibla', label: 'Qibla / Front', icon: <Compass className="w-3.5 h-3.5" /> }
  ];

  const renderModes: { id: RenderMode; label: string }[] = [
    { id: 'raw_drywall', label: 'Realistic Finishes' },
    { id: 'blueprint', label: 'Blueprint CAD' },
    { id: 'clay', label: 'Clay Model' },
    { id: 'xray', label: 'X-Ray Wireframe' },
    { id: 'studs_exposed', label: 'Framing Studs' }
  ];

  const handleSelectPresetHouse = (presetId: string) => {
    const found = HOUSE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onUpdateHouse(JSON.parse(JSON.stringify(found)));
    }
  };

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-7xl mx-auto px-4 py-3 select-none pointer-events-auto">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md text-[#141414] px-4 py-3 rounded-2xl border border-[#141414]/15 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        {/* Brand & House Selector */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#141414] text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={house.id}
                onChange={(e) => handleSelectPresetHouse(e.target.value)}
                className="text-sm font-serif font-bold tracking-tight text-[#141414] bg-transparent border-b border-dashed border-[#141414]/30 focus:outline-none cursor-pointer pr-4"
              >
                {HOUSE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[11px] text-[#5A5A58] flex items-center gap-2 mt-0.5">
              <span>{house.rooms.length} Rooms</span>
              <span>•</span>
              <span className="font-semibold text-[#0284C7]">{activeRoom.name}</span>
            </div>
          </div>
        </div>

        {/* Primary View Modes (Whole House 3D vs Single Room 3D vs 2D CAD Map) */}
        <div className="flex items-center bg-[#FAF9F5] p-1 rounded-xl border border-[#141414]/10">
          <button
            onClick={() => {
              onUpdateSettings({ viewMode: 'whole_house' });
              if (settings.cameraPreset === 'first_person') {
                onUpdateSettings({ cameraPreset: 'isometric' });
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              settings.viewMode === 'whole_house'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Whole House 3D</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ viewMode: 'single_room' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              settings.viewMode === 'single_room'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Single Room 3D</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ viewMode: 'map_2d' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              settings.viewMode === 'map_2d'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>2D CAD Planner</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* EXPAND 1-BEDROOM TO FULL HOUSE HERO BUTTON */}
          <button
            id="expand-house-btn"
            onClick={onOpenExpanderModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white shadow-md transition cursor-pointer border border-[#0284C7]/40"
            title="Expand this bedroom into a full multi-room furnished house"
          >
            <Building2 className="w-3.5 h-3.5 text-white" />
            <span>Expand to Full House</span>
            <span className="ml-1 px-1.5 py-0.2 bg-white/25 rounded text-[10px] font-mono">
              +Rooms
            </span>
          </button>

          {/* Smart Suggestions */}
          <button
            id="suggestions-drawer-btn"
            onClick={() => onToggleDrawer(activeDrawer === 'suggestions' ? null : 'suggestions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              activeDrawer === 'suggestions'
                ? 'bg-[#D97706] text-white border-[#D97706] shadow-sm'
                : 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border-[#F59E0B]/40'
            }`}
            title="Open Smart Suggestions & Automated Layout Recommendations"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Suggestions</span>
            {pendingSuggestionsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-[#DC2626] text-white text-[10px] rounded-full font-mono font-bold">
                {pendingSuggestionsCount}
              </span>
            )}
          </button>

          {/* Furnishings Catalog */}
          <button
            id="furniture-drawer-btn"
            onClick={() => onToggleDrawer(activeDrawer === 'furniture' ? null : 'furniture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              activeDrawer === 'furniture'
                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm'
                : 'bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#7C3AED] border-[#DDD6FE]'
            }`}
            title="Open 3D Furniture Catalog"
          >
            <Armchair className="w-3.5 h-3.5" />
            <span>Furnishings</span>
          </button>

          {/* Design Studio */}
          <button
            id="editor-drawer-btn"
            onClick={() => onToggleDrawer(activeDrawer === 'editor' ? null : 'editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              activeDrawer === 'editor'
                ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                : 'bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] border-[#7DD3FC]'
            }`}
            title="Open Design & Edit Studio"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          {/* Architectural Spec Sheet / Takeoff */}
          <button
            id="takeoff-modal-btn"
            onClick={onOpenTakeoffModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#141414] border border-[#141414]/15 transition cursor-pointer"
            title="Open Architectural Spec Sheet & Bill of Materials"
          >
            <FileText className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Spec Sheet</span>
          </button>

          {/* Clearance & Measurement Inspector */}
          <button
            id="measurement-modal-btn"
            onClick={onOpenMeasurementInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#141414] border border-[#141414]/15 transition cursor-pointer"
            title="Inspect Doorway & Circulation Clearances"
          >
            <Ruler className="w-3.5 h-3.5 text-[#B45309]" />
            <span>Clearances</span>
          </button>

          {/* Site, Roads & Surrounding Buildings */}
          <button
            id="site-modal-btn"
            onClick={onOpenSiteModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#141414] border border-[#141414]/15 transition cursor-pointer"
            title="Configure Roads, Plot Boundaries, and Surrounding Buildings"
          >
            <Building2 className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Site &amp; Surroundings</span>
            {(house.siteEnvironment?.surroundingBuildings?.length ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 bg-[#0284C7] text-white text-[10px] rounded-full font-mono font-bold">
                {house.siteEnvironment?.surroundingBuildings?.length}
              </span>
            )}
          </button>

          {/* Sightline Privacy Analysis */}
          <button
            id="sightline-drawer-btn"
            onClick={() => onToggleDrawer(activeDrawer === 'sightline' ? null : 'sightline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              activeDrawer === 'sightline'
                ? 'bg-[#15803D] text-white border-[#15803D] shadow-sm'
                : 'bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
            }`}
            title="Doorway Sightline & Privacy Inspection"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sightlines</span>
          </button>

          {/* Unit Toggle */}
          <button
            id="unit-toggle-btn"
            onClick={() =>
              onUpdateSettings({ unit: settings.unit === 'imperial' ? 'metric' : 'imperial' })
            }
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E3] text-xs font-mono font-medium text-[#141414] border border-[#141414]/15 transition cursor-pointer"
            title="Toggle between Imperial and Metric"
          >
            <span>{settings.unit === 'imperial' ? 'ft/in' : 'm'}</span>
          </button>

          {/* Lighting & Sun */}
          <button
            id="lighting-drawer-btn"
            onClick={() => onToggleDrawer(activeDrawer === 'lighting' ? null : 'lighting')}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              activeDrawer === 'lighting'
                ? 'bg-[#141414] text-white border-[#141414]'
                : 'bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#5A5A58] hover:text-[#141414] border-[#141414]/15'
            }`}
            title="Sun & Daylight Simulation"
          >
            <Sun className="w-4 h-4" />
          </button>

          {/* Database & Memory Manager */}
          <button
            id="database-modal-btn"
            onClick={onOpenDatabaseModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] transition cursor-pointer shadow-xs"
            title="Project Memory Database: Save, Load, Duplicate, Backup & Restore"
          >
            <Database className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="hidden sm:inline">Memory: Saved</span>
            <span className="sm:hidden">Memory</span>
          </button>

          {/* Snapshot Button */}
          <button
            id="snapshot-btn"
            onClick={onCaptureSnapshot}
            className="p-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#141414] border border-[#141414]/15 transition cursor-pointer"
            title="Save 3D Visual Snapshot PNG"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-Bar: Room Quick Tabs, 3D Material Mode & Camera Angle Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#141414]/15 shadow-sm">
        {/* Room Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-lg py-0.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#717170] px-1 font-semibold flex-shrink-0">
            Rooms:
          </span>
          {house.rooms.map((room) => {
            const isSelected = room.id === activeRoom.id;
            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0284C7] text-white font-semibold shadow-sm'
                    : 'bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#5A5A58] hover:text-[#141414]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: room.colorTag || '#0284C7' }}
                />
                <span>{room.name}</span>
              </button>
            );
          })}
          <button
            onClick={onOpenRoomManager}
            className="px-2 py-1 rounded-lg text-xs font-semibold bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] border border-[#7DD3FC] whitespace-nowrap transition cursor-pointer flex items-center gap-1"
            title="Add, rename, or manage rooms in this house"
          >
            <span>+ Manage Rooms</span>
          </button>
        </div>

        {/* 3D Material / Render Style Selector */}
        <div className="flex items-center gap-1 bg-[#FAF9F5] px-2 py-1 rounded-xl border border-[#141414]/10">
          <span className="text-[10px] font-mono text-[#717170] mr-1">3D Style:</span>
          <select
            value={settings.renderMode}
            onChange={(e) => onUpdateSettings({ renderMode: e.target.value as RenderMode })}
            className="text-xs font-mono font-medium text-[#141414] bg-transparent focus:outline-none cursor-pointer"
          >
            {renderModes.map((rm) => (
              <option key={rm.id} value={rm.id}>
                {rm.label}
              </option>
            ))}
          </select>
        </div>

        {/* Camera Views (Isometric, Walk-In 3D, Doorway, Top-Down) */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {cameraPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onUpdateSettings({ cameraPreset: preset.id })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                settings.cameraPreset === preset.id
                  ? 'bg-[#141414] text-white shadow-sm'
                  : 'bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#5A5A58] hover:text-[#141414]'
              }`}
            >
              {preset.icon}
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
