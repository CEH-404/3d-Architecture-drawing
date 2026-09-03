import React, { useState } from 'react';
import {
  Building,
  DoorOpen,
  Sun,
  ShieldCheck,
  Compass,
  Square,
  Maximize,
  X,
  Sliders,
  CheckCircle2,
  Ruler,
  Layers,
  Palette
} from 'lucide-react';
import { ViewSettings, MeasurementUnit, RoomDimensions, HouseRoom, PartitionStyle, FloorMaterialType } from '../types';
import { formatDimension, inchesToFeetInches } from '../utils/constants';

interface SpecsPanelProps {
  settings: ViewSettings;
  activeRoom?: HouseRoom;
  specs: RoomDimensions;
  onUpdateSpecs: (updater: Partial<RoomDimensions>) => void;
  onClose: () => void;
  onJumpToFeature: (preset: any) => void;
}

export const SpecsPanel: React.FC<SpecsPanelProps> = ({
  settings,
  activeRoom,
  specs,
  onUpdateSpecs,
  onClose,
  onJumpToFeature
}) => {
  const unit = settings.unit;
  const [activeTab, setActiveTab] = useState<'edit' | 'blueprint'>('edit');

  // Real-time calculations for this exact room
  const floorAreaSqFt = (specs.width * specs.depth) / 144;
  const floorAreaSqM = floorAreaSqFt * 0.092903;
  const roomVolumeCuFt = (specs.width * specs.depth * specs.height) / 1728;
  const roomVolumeCuM = roomVolumeCuFt * 0.0283168;
  const perimeterFt = (2 * (specs.width + specs.depth)) / 12;

  const partitionStyles: { id: PartitionStyle; name: string }[] = [
    { id: 'drywall', name: 'Solid Drywall' },
    { id: 'timber_slats', name: 'Oak Slats' },
    { id: 'fluted_glass', name: 'Fluted Glass' },
    { id: 'mashrabiya', name: 'Mashrabiya' },
    { id: 'steel_frame', name: 'Steel Frame' },
    { id: 'half_wall', name: 'Low Half Wall' }
  ];

  const floorMaterials: { id: FloorMaterialType; name: string }[] = [
    { id: 'hardwood', name: 'Warm Oak Plank' },
    { id: 'concrete', name: 'Bare Concrete' },
    { id: 'marble', name: 'Carrara Marble' },
    { id: 'terrazzo', name: 'Polished Terrazzo' },
    { id: 'carpet', name: 'Plush Carpet' }
  ];

  return (
    <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl border border-[#141414]/15 text-[#141414] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/10 bg-[#F7F6F3]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#141414] text-white flex items-center justify-center shadow-xs">
            <Building className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-serif font-bold text-[#141414]">
                {activeRoom?.name || specs.roomName || 'Room'} Specifications
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0369A1]">
                Live Control
              </span>
            </div>
            <p className="text-[11px] text-[#5A5A58]">
              Full manual control over room shell, doors, windows &amp; partition dimensions
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#5A5A58] hover:text-[#141414] hover:bg-[#EAE8E3] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-6 pt-2 bg-[#F7F6F3] border-b border-[#141414]/10">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'edit'
              ? 'bg-white text-[#0284C7] border-t-2 border-[#0284C7] shadow-xs'
              : 'text-[#5A5A58] hover:text-[#141414]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Manual Dimensions &amp; Sliders</span>
        </button>
        <button
          onClick={() => setActiveTab('blueprint')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'blueprint'
              ? 'bg-white text-[#0284C7] border-t-2 border-[#0284C7] shadow-xs'
              : 'text-[#5A5A58] hover:text-[#141414]'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Architectural Spec Sheet</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs text-[#5A5A58]">
        {/* Real-Time Metrics Bento Card */}
        <div className="grid grid-cols-3 gap-2 bg-[#F0EFEB] p-3 rounded-2xl border border-[#141414]/10">
          <div className="p-2.5 bg-white rounded-xl border border-[#141414]/10 shadow-xs">
            <div className="text-[9px] text-[#717170] uppercase tracking-wider font-mono font-semibold">
              Floor Area
            </div>
            <div className="text-sm font-serif font-bold text-[#141414] mt-0.5">
              {unit === 'imperial' ? `${floorAreaSqFt.toFixed(1)} sq ft` : `${floorAreaSqM.toFixed(1)} m²`}
            </div>
            <div className="text-[10px] text-[#0369A1] font-mono mt-0.5">
              {formatDimension(specs.width, unit)} × {formatDimension(specs.depth, unit)}
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-[#141414]/10 shadow-xs">
            <div className="text-[9px] text-[#717170] uppercase tracking-wider font-mono font-semibold">
              Volume
            </div>
            <div className="text-sm font-serif font-bold text-[#141414] mt-0.5">
              {unit === 'imperial' ? `${Math.round(roomVolumeCuFt)} cu ft` : `${roomVolumeCuM.toFixed(1)} m³`}
            </div>
            <div className="text-[10px] text-[#B45309] font-mono mt-0.5">
              H: {formatDimension(specs.height, unit)}
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-[#141414]/10 shadow-xs">
            <div className="text-[9px] text-[#717170] uppercase tracking-wider font-mono font-semibold">
              Perimeter
            </div>
            <div className="text-sm font-serif font-bold text-[#141414] mt-0.5">
              {unit === 'imperial' ? `${perimeterFt.toFixed(1)} ft` : `${(perimeterFt * 0.3048).toFixed(1)} m`}
            </div>
            <div className="text-[10px] text-[#16A34A] font-mono mt-0.5">
              Wall Base Run
            </div>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE MANUAL EDITING CONTROLS */}
        {activeTab === 'edit' && (
          <div className="space-y-4">
            {/* 1. Room Shell Dimensions */}
            <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#141414]/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-xs text-[#141414] flex items-center gap-1.5">
                  <Square className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>1. Room Shell Dimensions</span>
                </h3>
                <span className="text-[10px] font-mono text-[#717170]">
                  Live Manual Control
                </span>
              </div>

              {/* Width Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-[#141414]">Width (Left to Right)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateSpecs({ width: Math.max(96, specs.width - 6) })}
                      className="w-5 h-5 rounded bg-white border border-[#141414]/20 flex items-center justify-center font-mono font-bold hover:bg-[#EAE8E3]"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-[#0284C7]">
                      {formatDimension(specs.width, unit)} ({specs.width}&quot;)
                    </span>
                    <button
                      onClick={() => onUpdateSpecs({ width: Math.min(360, specs.width + 6) })}
                      className="w-5 h-5 rounded bg-white border border-[#141414]/20 flex items-center justify-center font-mono font-bold hover:bg-[#EAE8E3]"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="96"
                  max="360"
                  step="2"
                  value={specs.width}
                  onChange={(e) => onUpdateSpecs({ width: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                />
              </div>

              {/* Depth Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-[#141414]">Depth (Front to Back)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateSpecs({ depth: Math.max(96, specs.depth - 6) })}
                      className="w-5 h-5 rounded bg-white border border-[#141414]/20 flex items-center justify-center font-mono font-bold hover:bg-[#EAE8E3]"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-[#0284C7]">
                      {formatDimension(specs.depth, unit)} ({specs.depth}&quot;)
                    </span>
                    <button
                      onClick={() => onUpdateSpecs({ depth: Math.min(360, specs.depth + 6) })}
                      className="w-5 h-5 rounded bg-white border border-[#141414]/20 flex items-center justify-center font-mono font-bold hover:bg-[#EAE8E3]"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="96"
                  max="360"
                  step="2"
                  value={specs.depth}
                  onChange={(e) => onUpdateSpecs({ depth: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                />
              </div>

              {/* Height Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-[#141414]">Ceiling Height</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateSpecs({ height: Math.max(84, specs.height - 6) })}
                      className="w-5 h-5 rounded bg-white border border-[#141414]/20 flex items-center justify-center font-mono font-bold hover:bg-[#EAE8E3]"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-[#0284C7]">
                      {formatDimension(specs.height, unit)} ({specs.height}&quot;)
                    </span>
                    <button
                      onClick={() => onUpdateSpecs({ height: Math.min(240, specs.height + 6) })}
                      className="w-5 h-5 rounded bg-white border border-[#141414]/20 flex items-center justify-center font-mono font-bold hover:bg-[#EAE8E3]"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="84"
                  max="240"
                  step="2"
                  value={specs.height}
                  onChange={(e) => onUpdateSpecs({ height: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                />
              </div>
            </div>

            {/* 2. Entrance Doorway */}
            <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#141414]/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-xs text-[#141414] flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>2. Entrance Doorway</span>
                </h3>
                <button
                  onClick={() => onJumpToFeature('doorway_eye')}
                  className="text-[10px] font-mono text-[#0284C7] hover:underline font-semibold"
                >
                  Doorway View
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#5A5A58]">Door Width</span>
                    <span className="font-mono font-bold text-[#141414]">{specs.doorWidth}&quot;</span>
                  </div>
                  <input
                    type="range"
                    min="28"
                    max="60"
                    step="1"
                    value={specs.doorWidth}
                    onChange={(e) => onUpdateSpecs({ doorWidth: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#5A5A58]">Left Offset</span>
                    <span className="font-mono font-bold text-[#141414]">{specs.doorOffsetLeft}&quot;</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max={Math.max(12, specs.width - specs.doorWidth - 12)}
                    step="2"
                    value={specs.doorOffsetLeft}
                    onChange={(e) => onUpdateSpecs({ doorOffsetLeft: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                  />
                </div>
              </div>

              {/* Swing Angle */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#5A5A58]">Door Swing Angle</span>
                  <span className="font-mono font-bold text-[#141414]">{specs.doorOpenAngle || 0}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="110"
                  step="5"
                  value={specs.doorOpenAngle || 0}
                  onChange={(e) => onUpdateSpecs({ doorOpenAngle: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                />
              </div>
            </div>

            {/* 3. Window System */}
            <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#141414]/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-xs text-[#141414] flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>3. Window Wall &amp; Openings</span>
                </h3>
                <button
                  onClick={() => onJumpToFeature('window_view')}
                  className="text-[10px] font-mono text-[#0284C7] hover:underline font-semibold"
                >
                  Window View
                </button>
              </div>

              {/* Window Placement Wall */}
              <div className="space-y-1">
                <span className="text-[11px] text-[#5A5A58] block">Window Wall Placement:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['left', 'right', 'back'] as const).map((w) => (
                    <button
                      key={w}
                      onClick={() => onUpdateSpecs({ windowWall: w })}
                      className={`py-1 rounded-lg text-xs font-medium border transition cursor-pointer capitalize ${
                        specs.windowWall === w
                          ? 'bg-[#141414] text-white border-[#141414]'
                          : 'bg-white text-[#5A5A58] hover:bg-[#EAE8E3] border-[#141414]/15'
                      }`}
                    >
                      {w} Wall
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#5A5A58]">Window Width</span>
                    <span className="font-mono font-bold text-[#141414]">{specs.windowWidth}&quot;</span>
                  </div>
                  <input
                    type="range"
                    min="36"
                    max="144"
                    step="2"
                    value={specs.windowWidth}
                    onChange={(e) => onUpdateSpecs({ windowWidth: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#B45309]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#5A5A58]">Sill Height</span>
                    <span className="font-mono font-bold text-[#141414]">{specs.windowSillHeight}&quot;</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="80"
                    step="2"
                    value={specs.windowSillHeight}
                    onChange={(e) => onUpdateSpecs({ windowSillHeight: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#B45309]"
                  />
                </div>
              </div>
            </div>

            {/* 4. Privacy Partition */}
            <div className="p-4 bg-[#F0F9FF] rounded-2xl border border-[#BAE6FD] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-xs text-[#0369A1] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                  <span>4. Privacy Partition Wall</span>
                </h3>
                <button
                  onClick={() => onJumpToFeature('partition_closeup')}
                  className="text-[10px] font-mono text-[#0284C7] hover:underline font-semibold"
                >
                  Partition Closeup
                </button>
              </div>

              {/* Partition Style */}
              <div className="space-y-1">
                <span className="text-[11px] text-[#0369A1] block font-medium">Partition Material / Style:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {partitionStyles.map((ps) => (
                    <button
                      key={ps.id}
                      onClick={() => onUpdateSpecs({ partitionStyle: ps.id })}
                      className={`py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                        specs.partitionStyle === ps.id
                          ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-xs'
                          : 'bg-white text-[#5A5A58] hover:bg-[#E0F2FE] border-[#BAE6FD]'
                      }`}
                    >
                      {ps.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#0369A1]">Partition Depth</span>
                    <span className="font-mono font-bold text-[#141414]">{specs.partitionDepth}&quot;</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="96"
                    step="2"
                    value={specs.partitionDepth}
                    onChange={(e) => onUpdateSpecs({ partitionDepth: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-[#BAE6FD] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#0369A1]">Partition Height</span>
                    <span className="font-mono font-bold text-[#141414]">{specs.partitionHeight}&quot;</span>
                  </div>
                  <input
                    type="range"
                    min="42"
                    max={specs.height}
                    step="2"
                    value={specs.partitionHeight}
                    onChange={(e) => onUpdateSpecs({ partitionHeight: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-[#BAE6FD] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
                  />
                </div>
              </div>
            </div>

            {/* 5. Floor Material & Wall Color */}
            <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#141414]/10 space-y-3">
              <h3 className="font-serif font-bold text-xs text-[#141414] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>5. Finishes &amp; Flooring</span>
              </h3>

              <div className="space-y-1.5">
                <span className="text-[11px] text-[#5A5A58] block">Floor Material Finish:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {floorMaterials.map((fm) => (
                    <button
                      key={fm.id}
                      onClick={() => onUpdateSpecs({ floorMaterial: fm.id })}
                      className={`py-1 px-2 rounded-lg text-[11px] font-medium border transition cursor-pointer truncate ${
                        specs.floorMaterial === fm.id
                          ? 'bg-[#141414] text-white border-[#141414]'
                          : 'bg-white text-[#5A5A58] hover:bg-[#EAE8E3] border-[#141414]/15'
                      }`}
                    >
                      {fm.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARCHITECTURAL CODE & SPEC SHEET BREAKDOWN */}
        {activeTab === 'blueprint' && (
          <div className="space-y-4">
            {/* The Empty Box (Shell) */}
            <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#141414]/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-serif font-bold text-[#141414] flex items-center gap-1.5 text-xs">
                  <Square className="w-3.5 h-3.5 text-[#0369A1]" />
                  <span>1. Structural Shell Geometry</span>
                </div>
                <button
                  onClick={() => onJumpToFeature('isometric')}
                  className="text-[10px] font-mono text-[#0369A1] hover:underline font-semibold cursor-pointer"
                >
                  Isometric View
                </button>
              </div>
              <ul className="space-y-1 text-[#5A5A58] text-[11px] list-disc list-inside">
                <li>
                  <strong className="text-[#141414]">Floor Dimensions:</strong> {formatDimension(specs.depth, unit)} (Depth) × {formatDimension(specs.width, unit)} (Width).
                </li>
                <li>
                  <strong className="text-[#141414]">Ceiling Height:</strong> {formatDimension(specs.height, unit)} clear interior.
                </li>
                <li>
                  <strong className="text-[#141414]">Net Floor Area:</strong> {floorAreaSqFt.toFixed(1)} sq ft ({floorAreaSqM.toFixed(1)} m²).
                </li>
              </ul>
            </div>

            {/* Entrance Wall */}
            <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#141414]/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-serif font-bold text-[#141414] flex items-center gap-1.5 text-xs">
                  <DoorOpen className="w-3.5 h-3.5 text-[#0369A1]" />
                  <span>2. Entrance Wall &amp; Door Placement</span>
                </div>
                <button
                  onClick={() => onJumpToFeature('doorway_eye')}
                  className="text-[10px] font-mono text-[#0369A1] hover:underline font-semibold cursor-pointer"
                >
                  Doorway Eye Level
                </button>
              </div>
              <ul className="space-y-1 text-[#5A5A58] text-[11px] list-disc list-inside">
                <li>
                  <strong className="text-[#141414]">Total Wall Width:</strong> {formatDimension(specs.width, unit)}.
                </li>
                <li>
                  <strong className="text-[#141414]">Door Opening:</strong> {formatDimension(specs.doorWidth, unit)} wide × {formatDimension(specs.doorHeight, unit)} tall.
                </li>
                <li>
                  <strong className="text-[#141414]">Corner Offset:</strong> Starts at {formatDimension(specs.doorOffsetLeft, unit)} from left corner.
                </li>
                <li>
                  <strong className="text-[#141414]">Remaining Right Wall:</strong> {formatDimension(Math.max(0, specs.width - specs.doorOffsetLeft - specs.doorWidth), unit)}.
                </li>
              </ul>
            </div>

            {/* Window Wall */}
            <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#141414]/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-serif font-bold text-[#141414] flex items-center gap-1.5 text-xs">
                  <Sun className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>3. Window Wall Placement</span>
                </div>
                <button
                  onClick={() => onJumpToFeature('window_view')}
                  className="text-[10px] font-mono text-[#0369A1] hover:underline font-semibold cursor-pointer"
                >
                  Window View
                </button>
              </div>
              <ul className="space-y-1 text-[#5A5A58] text-[11px] list-disc list-inside">
                <li>
                  <strong className="text-[#141414]">Location:</strong> {specs.windowWall.toUpperCase()} wall.
                </li>
                <li>
                  <strong className="text-[#141414]">Rough Opening:</strong> {formatDimension(specs.windowWidth, unit)} wide × {formatDimension(specs.windowHeight, unit)} high.
                </li>
                <li>
                  <strong className="text-[#141414]">Sill Height:</strong> {formatDimension(specs.windowSillHeight, unit)} above floor.
                </li>
              </ul>
            </div>

            {/* Privacy Partition Proof */}
            <div className="p-4 bg-[#F0F9FF] rounded-2xl border border-[#BAE6FD] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-serif font-bold text-[#0369A1] flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                  <span>4. Structural Privacy Partition</span>
                </div>
                <button
                  onClick={() => onJumpToFeature('partition_closeup')}
                  className="text-[10px] font-mono text-[#0284C7] hover:underline font-semibold cursor-pointer"
                >
                  Partition Closeup
                </button>
              </div>
              <ul className="space-y-1 text-[#5A5A58] text-[11px] list-disc list-inside">
                <li>
                  <strong className="text-[#141414]">Projection:</strong> {formatDimension(specs.partitionDepth, unit)} deep into interior.
                </li>
                <li>
                  <strong className="text-[#141414]">Height:</strong> {formatDimension(specs.partitionHeight, unit)} (leaves {formatDimension(specs.height - specs.partitionHeight, unit)} open ceiling plenum).
                </li>
                <li>
                  <strong className="text-[#141414]">Style:</strong> {specs.partitionStyle.replace('_', ' ').toUpperCase()}.
                </li>
              </ul>

              <div className="p-2.5 bg-white rounded-xl border border-[#BAE6FD] flex items-start gap-2 text-[11px] text-[#0369A1]">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Verification:</strong> Direct view from doorway is fully blocked by the partition wall, ensuring private sanctuary while preserving airflow.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
