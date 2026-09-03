import React, { useState } from 'react';
import {
  RoomDimensions,
  ViewSettings,
  PartitionStyle,
  FloorMaterialType,
  WindowWallPlacement,
  DoorType
} from '../types';
import {
  formatDimension,
  inchesToFeetInches,
  DESIGN_PRESETS,
  calculateMetrics
} from '../utils/constants';
import {
  Sparkles,
  Layers,
  DoorOpen,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Palette,
  Armchair,
  Save,
  RotateCcw,
  X,
  Check,
  Copy,
  Download,
  Upload,
  Info,
  Compass,
  Sliders
} from 'lucide-react';

interface DesignEditorProps {
  specs: RoomDimensions;
  settings: ViewSettings;
  onUpdateSpecs: (updater: Partial<RoomDimensions>) => void;
  onResetSpecs: () => void;
  onClose: () => void;
}

type TabType = 'presets' | 'shell' | 'door' | 'window' | 'partition' | 'interior' | 'export';

export const DesignEditor: React.FC<DesignEditorProps> = ({
  specs,
  settings,
  onUpdateSpecs,
  onResetSpecs,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('presets');
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonModal, setShowJsonModal] = useState(false);

  const metrics = calculateMetrics(specs);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(specs, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(specs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${specs.roomName.toLowerCase().replace(/\s+/g, '_')}_design.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.width && parsed.depth) {
        onUpdateSpecs(parsed);
        setShowJsonModal(false);
        setJsonInput('');
      } else {
        alert('Invalid JSON: missing width or depth parameters.');
      }
    } catch (e) {
      alert('Could not parse JSON. Please check formatting.');
    }
  };

  const partitionStyles: { id: PartitionStyle; name: string; desc: string }[] = [
    { id: 'drywall', name: 'Solid Drywall', desc: 'Flush finished stud wall with painted drywall sheathing' },
    { id: 'timber_slats', name: 'Japandi Oak Slats', desc: 'Vertical natural timber louvers for soft airy separation' },
    { id: 'fluted_glass', name: 'Fluted Ribbed Glass', desc: 'Architectural translucent reeded glass with steel border' },
    { id: 'mashrabiya', name: 'Islamic Mashrabiya', desc: 'Geometric carved wooden lattice with traditional star motifs' },
    { id: 'steel_frame', name: 'Steel Frame Grid', desc: 'Matte black industrial steel grid with clear glass' },
    { id: 'acoustic_felt', name: 'Acoustic Felt', desc: 'Sound-dampening grooved felt panel for quiet focus' },
    { id: 'half_wall', name: 'Low Half Wall', desc: '42" pony knee wall with solid wood top cap ledge' }
  ];

  const floorMaterials: { id: FloorMaterialType; name: string; desc: string }[] = [
    { id: 'concrete', name: 'Bare Concrete', desc: 'Raw screed architectural subfloor' },
    { id: 'hardwood', name: 'Warm Oak Plank', desc: 'Natural hardwood floorboards' },
    { id: 'terrazzo', name: 'Polished Terrazzo', desc: 'Speckled aggregate stone floor' },
    { id: 'marble', name: 'Carrara Marble', desc: 'Italian white marble with grey veining' },
    { id: 'carpet', name: 'Plush Carpet', desc: 'Soft woven textured acoustic carpet' }
  ];

  return (
    <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-2xl border border-[#141414]/15 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-[#141414] select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#141414]/10 bg-[#FAF9F5]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shadow-sm">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-serif font-bold tracking-tight text-[#141414]">
              Design &amp; Customization Studio
            </h2>
            <p className="text-[11px] text-[#5A5A58]">
              Craft, adjust &amp; live-edit every architectural dimension
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onResetSpecs}
            className="px-2.5 py-1 rounded-lg bg-[#EAE8E3] hover:bg-[#DDD9D2] text-[11px] font-medium text-[#141414] transition flex items-center gap-1 cursor-pointer"
            title="Reset to default 13ft 6in x 12ft 4in architectural shell"
          >
            <RotateCcw className="w-3 h-3 text-[#5A5A58]" />
            <span>Reset</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#EAE8E3] text-[#5A5A58] hover:text-[#141414] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 px-4 py-2 bg-[#F0EFEB] border-b border-[#141414]/10 overflow-x-auto text-xs scrollbar-none">
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'presets'
              ? 'bg-[#141414] text-white shadow-sm'
              : 'text-[#5A5A58] hover:text-[#141414] hover:bg-[#E4E3E0]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>

        <button
          onClick={() => setActiveTab('shell')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'shell'
              ? 'bg-[#141414] text-white shadow-sm'
              : 'text-[#5A5A58] hover:text-[#141414] hover:bg-[#E4E3E0]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Room Shell</span>
        </button>

        <button
          onClick={() => setActiveTab('door')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'door'
              ? 'bg-[#141414] text-white shadow-sm'
              : 'text-[#5A5A58] hover:text-[#141414] hover:bg-[#E4E3E0]'
          }`}
        >
          <DoorOpen className="w-3.5 h-3.5" />
          <span>Doorway</span>
        </button>

        <button
          onClick={() => setActiveTab('window')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'window'
              ? 'bg-[#141414] text-white shadow-sm'
              : 'text-[#5A5A58] hover:text-[#141414] hover:bg-[#E4E3E0]'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Windows</span>
        </button>

        <button
          onClick={() => setActiveTab('partition')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'partition'
              ? 'bg-[#141414] text-white shadow-sm'
              : 'text-[#5A5A58] hover:text-[#141414] hover:bg-[#E4E3E0]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Partition</span>
        </button>

        <button
          onClick={() => setActiveTab('interior')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'interior'
              ? 'bg-[#141414] text-white shadow-sm'
              : 'text-[#5A5A58] hover:text-[#141414] hover:bg-[#E4E3E0]'
          }`}
        >
          <Armchair className="w-3.5 h-3.5" />
          <span>Interior</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'export'
              ? 'bg-[#141414] text-white shadow-sm'
              : 'text-[#5A5A58] hover:text-[#141414] hover:bg-[#E4E3E0]'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save/Export</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
        {/* ========================================================= */}
        {/* 1. PRESETS TAB */}
        {/* ========================================================= */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-serif font-bold text-[#141414]">
                Architectural Templates &amp; Curated Presets
              </h3>
              <p className="text-[#5A5A58] text-[11px] mt-0.5">
                Select an archetype to instantly configure room dimensions, partitions &amp; layout.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {DESIGN_PRESETS.map((preset) => {
                const isSelected = specs.roomName === preset.name;
                return (
                  <div
                    key={preset.id}
                    onClick={() => onUpdateSpecs(preset.specs)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-[#0284C7]/5 border-[#0284C7] ring-1 ring-[#0284C7]/30'
                        : 'bg-[#FAF9F5] hover:bg-[#F0EFEB] border-[#141414]/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#141414] flex items-center gap-2">
                        {preset.name}
                        {isSelected && (
                          <span className="text-[10px] bg-[#0284C7] text-white px-2 py-0.2 rounded-full font-mono">
                            Active
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[10px] text-[#5A5A58]">
                        {preset.specs.depth && formatDimension(preset.specs.depth, settings.unit)} ×{' '}
                        {preset.specs.width && formatDimension(preset.specs.width, settings.unit)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A5A58] leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. ROOM SHELL TAB */}
        {/* ========================================================= */}
        {activeTab === 'shell' && (
          <div className="space-y-5">
            <div>
              <label className="text-[11px] font-semibold text-[#141414] block mb-1">
                Room Custom Title / Name
              </label>
              <input
                type="text"
                value={specs.roomName}
                onChange={(e) => onUpdateSpecs({ roomName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#141414]/15 text-xs text-[#141414] focus:outline-none focus:border-[#0284C7]"
                placeholder="e.g. Master Bedroom, Musalla, Office..."
              />
            </div>

            {/* Room Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Room Width (Left to Right)</span>
                <span className="font-mono font-semibold text-[#0284C7]">
                  {formatDimension(specs.width, settings.unit)} ({specs.width}")
                </span>
              </div>
              <input
                type="range"
                min="96"
                max="360"
                step="2"
                value={specs.width}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const rem = Math.max(20, val - specs.doorOffsetLeft - specs.doorWidth);
                  onUpdateSpecs({ width: val, doorRemainingRight: rem });
                }}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#717170] font-mono">
                <span>8' 0" (96")</span>
                <span>Current: {inchesToFeetInches(specs.width)}</span>
                <span>30' 0" (360")</span>
              </div>
            </div>

            {/* Room Depth */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Room Depth (Front to Back / Qibla)</span>
                <span className="font-mono font-semibold text-[#0284C7]">
                  {formatDimension(specs.depth, settings.unit)} ({specs.depth}")
                </span>
              </div>
              <input
                type="range"
                min="96"
                max="360"
                step="2"
                value={specs.depth}
                onChange={(e) => onUpdateSpecs({ depth: Number(e.target.value) })}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#717170] font-mono">
                <span>8' 0" (96")</span>
                <span>Current: {inchesToFeetInches(specs.depth)}</span>
                <span>30' 0" (360")</span>
              </div>
            </div>

            {/* Ceiling Height */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Ceiling Height (Floor to Deck)</span>
                <span className="font-mono font-semibold text-[#B45309]">
                  {formatDimension(specs.height, settings.unit)} ({specs.height}")
                </span>
              </div>
              <input
                type="range"
                min="84"
                max="216"
                step="2"
                value={specs.height}
                onChange={(e) => onUpdateSpecs({ height: Number(e.target.value) })}
                className="w-full accent-[#B45309] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#717170] font-mono">
                <span>7' 0" (84")</span>
                <span>Current: {inchesToFeetInches(specs.height)}</span>
                <span>18' 0" (216")</span>
              </div>
            </div>

            {/* Floor Material Selector */}
            <div className="space-y-2 pt-2 border-t border-[#141414]/10">
              <span className="font-medium text-[#141414] block">Floor Material Finish</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {floorMaterials.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => onUpdateSpecs({ floorMaterial: mat.id })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-0.5 ${
                      specs.floorMaterial === mat.id
                        ? 'bg-[#141414] text-white border-[#141414] shadow-sm'
                        : 'bg-[#FAF9F5] hover:bg-[#F0EFEB] text-[#141414] border-[#141414]/15'
                    }`}
                  >
                    <span className="font-medium text-xs">{mat.name}</span>
                    <span className={`text-[10px] ${specs.floorMaterial === mat.id ? 'text-white/70' : 'text-[#717170]'}`}>
                      {mat.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Metrics Summary */}
            <div className="p-3 bg-[#EAE8E3] rounded-xl border border-[#141414]/10 flex items-center justify-between text-[11px] font-mono text-[#5A5A58]">
              <div>
                Floor Area:{' '}
                <span className="font-bold text-[#141414]">
                  {metrics.floorAreaSqFt.toFixed(1)} sq ft ({metrics.floorAreaSqM.toFixed(1)} m²)
                </span>
              </div>
              <div>
                Volume:{' '}
                <span className="font-bold text-[#141414]">
                  {metrics.roomVolumeCuFt.toFixed(0)} cu ft
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. DOORWAY TAB */}
        {/* ========================================================= */}
        {activeTab === 'door' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-serif font-bold text-[#141414]">
                Entrance Door Configuration (Front Wall)
              </h3>
              <p className="text-[#5A5A58] text-[11px] mt-0.5">
                Set door placement, size, swing direction, and opening angle.
              </p>
            </div>

            {/* Door Type */}
            <div className="space-y-1.5">
              <span className="font-medium text-[#141414] block">Door Opening Type</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'single_swing', label: 'Single Hinged Swing' },
                  { id: 'double_swing', label: 'Double French Doors' },
                  { id: 'sliding', label: 'Sliding Pocket Door' },
                  { id: 'open_arch', label: 'Open Framed Opening' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => onUpdateSpecs({ doorType: type.id as DoorType })}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition cursor-pointer ${
                      specs.doorType === type.id
                        ? 'bg-[#141414] text-white border-[#141414]'
                        : 'bg-[#FAF9F5] hover:bg-[#F0EFEB] text-[#141414] border-[#141414]/15'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Door Position along Front Wall */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Door Offset from Left Corner</span>
                <span className="font-mono font-semibold text-[#0284C7]">
                  {formatDimension(specs.doorOffsetLeft, settings.unit)} ({specs.doorOffsetLeft}")
                </span>
              </div>
              <input
                type="range"
                min="12"
                max={Math.max(12, specs.width - specs.doorWidth - 12)}
                step="2"
                value={specs.doorOffsetLeft}
                onChange={(e) => {
                  const offset = Number(e.target.value);
                  const rem = Math.max(0, specs.width - offset - specs.doorWidth);
                  const partX = offset + specs.doorWidth;
                  onUpdateSpecs({
                    doorOffsetLeft: offset,
                    doorRemainingRight: rem,
                    partitionPositionX: specs.partitionAttachedTo === 'door_edge_wing' ? partX : specs.partitionPositionX
                  });
                }}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#717170] font-mono">
                <span>Left: 12"</span>
                <span>Right Wall Distance: {formatDimension(specs.doorRemainingRight, settings.unit)}</span>
              </div>
            </div>

            {/* Door Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Door Opening Width</span>
                <span className="font-mono font-semibold text-[#0284C7]">
                  {formatDimension(specs.doorWidth, settings.unit)} ({specs.doorWidth}")
                </span>
              </div>
              <input
                type="range"
                min="28"
                max="72"
                step="2"
                value={specs.doorWidth}
                onChange={(e) => {
                  const width = Number(e.target.value);
                  const rem = Math.max(0, specs.width - specs.doorOffsetLeft - width);
                  const partX = specs.doorOffsetLeft + width;
                  onUpdateSpecs({
                    doorWidth: width,
                    doorRemainingRight: rem,
                    partitionPositionX: specs.partitionAttachedTo === 'door_edge_wing' ? partX : specs.partitionPositionX
                  });
                }}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#717170] font-mono">
                <span>2' 4" (28")</span>
                <span>Standard (3' 10")</span>
                <span>6' 0" (72")</span>
              </div>
            </div>

            {/* Door Height */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Door Opening Height</span>
                <span className="font-mono font-semibold text-[#0284C7]">
                  {formatDimension(specs.doorHeight, settings.unit)} ({specs.doorHeight}")
                </span>
              </div>
              <input
                type="range"
                min="72"
                max={Math.min(specs.height - 6, 108)}
                step="2"
                value={specs.doorHeight}
                onChange={(e) => onUpdateSpecs({ doorHeight: Number(e.target.value) })}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
            </div>

            {/* Door Open Angle */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Door Open Angle</span>
                <span className="font-mono font-semibold text-[#0284C7]">{specs.doorOpenAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="105"
                step="5"
                value={specs.doorOpenAngle}
                onChange={(e) => onUpdateSpecs({ doorOpenAngle: Number(e.target.value) })}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#717170] font-mono">
                <span>0° (Closed)</span>
                <span>45° (Standard)</span>
                <span>105° (Wide Open)</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. WINDOW TAB */}
        {/* ========================================================= */}
        {activeTab === 'window' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-serif font-bold text-[#141414]">
                Window Placement &amp; Geometry
              </h3>
              <p className="text-[#5A5A58] text-[11px] mt-0.5">
                Position daylight windows on the left wall, right wall, or back Qibla wall.
              </p>
            </div>

            {/* Window Wall Placement */}
            <div className="space-y-1.5">
              <span className="font-medium text-[#141414] block">Window Wall Location</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'left', label: 'Left Wall' },
                  { id: 'right', label: 'Right Wall' },
                  { id: 'back', label: 'Back (Qibla) Wall' }
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => onUpdateSpecs({ windowWall: w.id as WindowWallPlacement })}
                    className={`py-2 px-2.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                      specs.windowWall === w.id
                        ? 'bg-[#141414] text-white border-[#141414]'
                        : 'bg-[#FAF9F5] hover:bg-[#F0EFEB] text-[#141414] border-[#141414]/15'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Window Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Window Width</span>
                <span className="font-mono font-semibold text-[#0284C7]">
                  {formatDimension(specs.windowWidth, settings.unit)} ({specs.windowWidth}")
                </span>
              </div>
              <input
                type="range"
                min="36"
                max={Math.min(specs.depth - 24, 140)}
                step="2"
                value={specs.windowWidth}
                onChange={(e) => {
                  const width = Number(e.target.value);
                  const wallLen = specs.windowWall === 'back' ? specs.width : specs.depth;
                  const offset = Math.max(12, (wallLen - width) / 2);
                  onUpdateSpecs({ windowWidth: width, windowOffsetFront: offset });
                }}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
            </div>

            {/* Window Height */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Window Height</span>
                <span className="font-mono font-semibold text-[#0284C7]">
                  {formatDimension(specs.windowHeight, settings.unit)} ({specs.windowHeight}")
                </span>
              </div>
              <input
                type="range"
                min="24"
                max={Math.min(specs.height - 24, 96)}
                step="2"
                value={specs.windowHeight}
                onChange={(e) => onUpdateSpecs({ windowHeight: Number(e.target.value) })}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
            </div>

            {/* Sill Height */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Sill Height from Floor</span>
                <span className="font-mono font-semibold text-[#0284C7]">
                  {formatDimension(specs.windowSillHeight, settings.unit)} ({specs.windowSillHeight}")
                </span>
              </div>
              <input
                type="range"
                min="18"
                max={Math.max(20, specs.height - specs.windowHeight - 12)}
                step="2"
                value={specs.windowSillHeight}
                onChange={(e) => onUpdateSpecs({ windowSillHeight: Number(e.target.value) })}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#717170] font-mono">
                <span>18" (Low Sill)</span>
                <span>5' 3" (Default 63")</span>
                <span>Top: {formatDimension(specs.windowSillHeight + specs.windowHeight, settings.unit)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. PRIVACY PARTITION TAB */}
        {/* ========================================================= */}
        {activeTab === 'partition' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-serif font-bold text-[#141414]">
                Privacy Partition (Wing Wall) Architecture
              </h3>
              <p className="text-[#5A5A58] text-[11px] mt-0.5">
                Block direct sightline from entrance doorway into the prayer and window area.
              </p>
            </div>

            {/* Partition Material / Style */}
            <div className="space-y-2">
              <span className="font-medium text-[#141414] block">Architectural Material &amp; Style</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {partitionStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => onUpdateSpecs({ partitionStyle: style.id })}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                      specs.partitionStyle === style.id
                        ? 'bg-[#0284C7]/10 border-[#0284C7] ring-1 ring-[#0284C7]/40'
                        : 'bg-[#FAF9F5] hover:bg-[#F0EFEB] border-[#141414]/15'
                    }`}
                  >
                    <span className="font-semibold text-xs text-[#141414] flex items-center justify-between">
                      {style.name}
                      {specs.partitionStyle === style.id && <Check className="w-3.5 h-3.5 text-[#0284C7]" />}
                    </span>
                    <span className="text-[10px] text-[#5A5A58] leading-tight">
                      {style.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Partition Depth */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Partition Depth into Room</span>
                <span className="font-mono font-semibold text-[#0284C7]">
                  {formatDimension(specs.partitionDepth, settings.unit)} ({specs.partitionDepth}")
                </span>
              </div>
              <input
                type="range"
                min="18"
                max={Math.min(specs.depth - 24, 96)}
                step="2"
                value={specs.partitionDepth}
                onChange={(e) => onUpdateSpecs({ partitionDepth: Number(e.target.value) })}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#717170] font-mono">
                <span>1' 6" (18")</span>
                <span>3' 6" (Standard 42")</span>
                <span>8' 0" (96")</span>
              </div>
            </div>

            {/* Partition Height */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Partition Height</span>
                <span className="font-mono font-semibold text-[#0284C7]">
                  {formatDimension(specs.partitionHeight, settings.unit)} ({specs.partitionHeight}")
                </span>
              </div>
              <input
                type="range"
                min="42"
                max={specs.height}
                step="2"
                value={specs.partitionHeight}
                onChange={(e) => onUpdateSpecs({ partitionHeight: Number(e.target.value) })}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#717170] font-mono">
                <span>3' 6" (42")</span>
                <span>7' 0" (Standard 84")</span>
                <span>Full Ceiling: {formatDimension(specs.height, settings.unit)}</span>
              </div>
            </div>

            {/* Partition Thickness */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#141414]">Wall Thickness</span>
                <span className="font-mono font-semibold text-[#0284C7]">{specs.partitionThickness}"</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="8"
                step="0.5"
                value={specs.partitionThickness}
                onChange={(e) => onUpdateSpecs({ partitionThickness: Number(e.target.value) })}
                className="w-full accent-[#0284C7] cursor-pointer"
              />
            </div>

            {/* Clearance badge */}
            <div className="p-3 bg-[#E8F5E9] rounded-xl border border-[#A5D6A7] text-[11px] text-[#1B5E20] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                Overhead Open Airflow:
              </span>
              <span className="font-mono font-bold">
                {formatDimension(specs.height - specs.partitionHeight, settings.unit)} clear to ceiling
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. INTERIOR AMENITIES TAB */}
        {/* ========================================================= */}
        {activeTab === 'interior' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-serif font-bold text-[#141414]">
                Interior Layout &amp; Prayer Amenities
              </h3>
              <p className="text-[#5A5A58] text-[11px] mt-0.5">
                Toggle prayer rugs, entryway shoe storage, bookshelves, indoor greenery &amp; fixtures.
              </p>
            </div>

            {/* Prayer Rug Toggles */}
            <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#141414]/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-[#141414] block">
                    Prayer Rug (Sajjadah / Musalla)
                  </span>
                  <span className="text-[10px] text-[#5A5A58]">
                    Aligned facing back Qibla wall
                  </span>
                </div>
                <button
                  onClick={() => onUpdateSpecs({ showPrayerMat: !specs.showPrayerMat })}
                  className={`px-3 py-1 rounded-xl font-medium transition cursor-pointer ${
                    specs.showPrayerMat ? 'bg-[#1B5E20] text-white' : 'bg-[#EAE8E3] text-[#5A5A58]'
                  }`}
                >
                  {specs.showPrayerMat ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {specs.showPrayerMat && (
                <div className="pt-2 border-t border-[#141414]/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[#5A5A58]">Number of Mats:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => onUpdateSpecs({ prayerMatCount: num })}
                          className={`w-7 h-6 rounded-lg text-[11px] font-mono font-semibold transition cursor-pointer ${
                            specs.prayerMatCount === num
                              ? 'bg-[#141414] text-white'
                              : 'bg-[#EAE8E3] text-[#141414]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-[#5A5A58]">Rug Color Pattern:</span>
                    <div className="flex gap-1.5">
                      {[
                        { id: 'classic_emerald', label: 'Emerald', color: '#065F46' },
                        { id: 'gold_arch', label: 'Gold', color: '#B45309' },
                        { id: 'modern_slate', label: 'Slate', color: '#334155' },
                        { id: 'terracotta', label: 'Terracotta', color: '#9A3412' }
                      ].map((pat) => (
                        <button
                          key={pat.id}
                          onClick={() => onUpdateSpecs({ prayerMatPattern: pat.id as any })}
                          className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                            specs.prayerMatPattern === pat.id ? 'border-[#141414] scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: pat.color }}
                          title={pat.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Other Furniture Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'showEntryBench',
                  label: 'Shoe Console / Entry Bench',
                  desc: 'Placed at entrance wing wall',
                  val: specs.showEntryBench
                },
                {
                  id: 'showBookshelf',
                  label: 'Qur\'an Stand / Bookshelf',
                  desc: 'Recessed against solid wall',
                  val: specs.showBookshelf
                },
                {
                  id: 'showIndoorPlant',
                  label: 'Indoor Olive / Fiddle Fig Plant',
                  desc: 'Corner ceramic planter',
                  val: specs.showIndoorPlant
                },
                {
                  id: 'showPendantLight',
                  label: 'Modern Ceiling Pendant Light',
                  desc: 'Warm ambient glow ring',
                  val: specs.showPendantLight
                },
                {
                  id: 'showWallArt',
                  label: 'Geometric Wall Art Frame',
                  desc: 'Back Qibla focal point',
                  val: specs.showWallArt
                }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => onUpdateSpecs({ [item.id]: !item.val })}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    item.val
                      ? 'bg-[#141414] text-white border-[#141414]'
                      : 'bg-[#FAF9F5] hover:bg-[#F0EFEB] text-[#141414] border-[#141414]/15'
                  }`}
                >
                  <div>
                    <span className="font-medium text-xs block">{item.label}</span>
                    <span className={`text-[10px] ${item.val ? 'text-white/70' : 'text-[#717170]'}`}>
                      {item.desc}
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      item.val ? 'bg-[#0284C7] border-white' : 'border-[#717170]'
                    }`}
                  >
                    {item.val && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. SAVE / EXPORT TAB */}
        {/* ========================================================= */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-serif font-bold text-[#141414]">
                Export &amp; Share Architectural Blueprint
              </h3>
              <p className="text-[#5A5A58] text-[11px] mt-0.5">
                Save your custom design parameters, export CAD JSON specs, or import saved designs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyJSON}
                className="py-2.5 px-3 rounded-xl bg-[#FAF9F5] hover:bg-[#F0EFEB] text-[#141414] border border-[#141414]/15 font-medium transition cursor-pointer flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4 text-[#0284C7]" />}
                <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={handleDownloadJSON}
                className="py-2.5 px-3 rounded-xl bg-[#FAF9F5] hover:bg-[#F0EFEB] text-[#141414] border border-[#141414]/15 font-medium transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#0284C7]" />
                <span>Download .JSON</span>
              </button>
            </div>

            <div>
              <button
                onClick={() => setShowJsonModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#141414] text-white hover:bg-neutral-800 font-medium transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import Saved JSON Design</span>
              </button>
            </div>

            {/* Readout Preview */}
            <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#141414]/10 font-mono text-[10px] text-[#5A5A58] overflow-x-auto max-h-48">
              <pre>{JSON.stringify(specs, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* JSON Import Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-[#141414]/15 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-[#141414]">Paste Design JSON</h4>
              <button onClick={() => setShowJsonModal(false)} className="text-[#717170] hover:text-[#141414]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={8}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON content here..."
              className="w-full p-2.5 rounded-xl border border-[#141414]/15 font-mono text-[11px] focus:outline-none focus:border-[#0284C7]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-3 py-1.5 rounded-lg bg-[#EAE8E3] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleImportJSON}
                className="px-4 py-1.5 rounded-lg bg-[#0284C7] text-white text-xs font-medium"
              >
                Apply Design
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
