import React, { useState } from 'react';
import { SiteEnvironment, SurroundingBuilding, MeasurementUnit } from '../types';
import { formatDimension } from '../utils/constants';
import {
  Building2,
  Compass,
  Trees,
  Plus,
  Trash2,
  X,
  Sun,
  Layers,
  MapPin,
  Check,
  RotateCw
} from 'lucide-react';

interface SiteEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: SiteEnvironment;
  onUpdateSite: (updated: SiteEnvironment) => void;
  unit?: MeasurementUnit;
}

export const SiteEnvironmentModal: React.FC<SiteEnvironmentModalProps> = ({
  isOpen,
  onClose,
  site,
  onUpdateSite,
  unit = 'imperial'
}) => {
  const [activeTab, setActiveTab] = useState<'surroundings' | 'road' | 'solar'>('surroundings');

  if (!isOpen) return null;

  const handleAddBuildingPreset = (preset: 'left' | 'right' | 'across' | 'rear') => {
    const id = `bldg-${Date.now()}`;
    let newBldg: SurroundingBuilding;

    if (preset === 'left') {
      newBldg = {
        id,
        name: 'West Neighbor Villa',
        x: -420, // 35 ft left
        z: 60,
        width: 320,
        depth: 380,
        height: 280, // ~23 ft / 2 stories
        style: 'modern',
        color: '#d1d5db'
      };
    } else if (preset === 'right') {
      newBldg = {
        id,
        name: 'East Neighbor House',
        x: 480, // 40 ft right
        z: 40,
        width: 300,
        depth: 360,
        height: 310, // ~26 ft / 2.5 stories
        style: 'brick',
        color: '#b45309'
      };
    } else if (preset === 'across') {
      newBldg = {
        id,
        name: 'Street Facing Apartments',
        x: -60,
        z: -520, // across the road
        width: 600,
        depth: 360,
        height: 480, // ~40 ft / 4 stories
        style: 'glass',
        color: '#64748b'
      };
    } else {
      newBldg = {
        id,
        name: 'Rear Property Residence',
        x: 0,
        z: 680, // behind the plot
        width: 400,
        depth: 320,
        height: 260,
        style: 'classic',
        color: '#f5efe6'
      };
    }

    onUpdateSite({
      ...site,
      surroundingBuildings: [...site.surroundingBuildings, newBldg]
    });
  };

  const handleUpdateBuilding = (id: string, updates: Partial<SurroundingBuilding>) => {
    const updated = site.surroundingBuildings.map((b) =>
      b.id === id ? { ...b, ...updates } : b
    );
    onUpdateSite({ ...site, surroundingBuildings: updated });
  };

  const handleDeleteBuilding = (id: string) => {
    const updated = site.surroundingBuildings.filter((b) => b.id !== id);
    onUpdateSite({ ...site, surroundingBuildings: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#141414]/15 flex flex-col max-h-[90vh] overflow-hidden text-[#141414] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#141414]/10 bg-[#FAF9F5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#141414]">
                Site Context &amp; Surroundings
              </h2>
              <p className="text-xs text-[#5A5A58]">
                Add neighboring buildings, roads, plot boundaries, and solar orientation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#717170] hover:text-[#141414] hover:bg-[#EAE8E3] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#141414]/10 px-5 pt-2 bg-[#FAF9F5] gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('surroundings')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'surroundings'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Surrounding Buildings ({site.surroundingBuildings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('road')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'road'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Road &amp; Plot Layout</span>
          </button>

          <button
            onClick={() => setActiveTab('solar')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'solar'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Plot &amp; Solar Orientation</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: SURROUNDING BUILDINGS */}
          {activeTab === 'surroundings' && (
            <div className="space-y-4">
              {/* Quick Add Presets */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#717170] block mb-2">
                  Quick Add Surrounding Neighbors
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleAddBuildingPreset('left')}
                    className="p-2.5 bg-[#FAF9F5] hover:bg-[#EAE8E3] rounded-xl border border-[#141414]/10 text-left transition flex flex-col gap-1 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#141414] flex items-center gap-1">
                      <Plus className="w-3 h-3 text-[#0284C7]" /> Left Villa
                    </span>
                    <span className="text-[10px] text-[#717170]">2 Stories • 23ft</span>
                  </button>

                  <button
                    onClick={() => handleAddBuildingPreset('right')}
                    className="p-2.5 bg-[#FAF9F5] hover:bg-[#EAE8E3] rounded-xl border border-[#141414]/10 text-left transition flex flex-col gap-1 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#141414] flex items-center gap-1">
                      <Plus className="w-3 h-3 text-[#0284C7]" /> Right House
                    </span>
                    <span className="text-[10px] text-[#717170]">2.5 Stories • Brick</span>
                  </button>

                  <button
                    onClick={() => handleAddBuildingPreset('across')}
                    className="p-2.5 bg-[#FAF9F5] hover:bg-[#EAE8E3] rounded-xl border border-[#141414]/10 text-left transition flex flex-col gap-1 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#141414] flex items-center gap-1">
                      <Plus className="w-3 h-3 text-[#0284C7]" /> Across Street
                    </span>
                    <span className="text-[10px] text-[#717170]">4 Stories • 40ft</span>
                  </button>

                  <button
                    onClick={() => handleAddBuildingPreset('rear')}
                    className="p-2.5 bg-[#FAF9F5] hover:bg-[#EAE8E3] rounded-xl border border-[#141414]/10 text-left transition flex flex-col gap-1 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#141414] flex items-center gap-1">
                      <Plus className="w-3 h-3 text-[#0284C7]" /> Rear Property
                    </span>
                    <span className="text-[10px] text-[#717170]">Classic Residence</span>
                  </button>
                </div>
              </div>

              {/* Building List */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#717170] block">
                  Configured Surrounding Buildings ({site.surroundingBuildings.length})
                </span>

                {site.surroundingBuildings.length === 0 ? (
                  <div className="text-center py-8 bg-[#FAF9F5] rounded-xl border border-dashed border-[#141414]/20 p-4">
                    <Building2 className="w-8 h-8 text-[#717170] mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-[#5A5A58] font-medium">No surrounding buildings added yet.</p>
                    <p className="text-[11px] text-[#717170] mt-1">
                      Click any preset above to place neighboring buildings and see how they cast shadows on your site.
                    </p>
                  </div>
                ) : (
                  site.surroundingBuildings.map((bldg) => (
                    <div
                      key={bldg.id}
                      className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#141414]/10 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={bldg.name}
                          onChange={(e) => handleUpdateBuilding(bldg.id, { name: e.target.value })}
                          className="font-bold text-xs bg-transparent border-b border-transparent hover:border-[#141414]/20 focus:border-[#0284C7] outline-none text-[#141414]"
                        />
                        <button
                          onClick={() => handleDeleteBuilding(bldg.id)}
                          className="text-[#DC2626] hover:bg-[#DC2626]/10 p-1.5 rounded-lg transition cursor-pointer"
                          title="Delete Building"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-[#717170]">Height</label>
                          <select
                            value={bldg.height}
                            onChange={(e) => handleUpdateBuilding(bldg.id, { height: Number(e.target.value) })}
                            className="w-full mt-1 p-1.5 bg-white rounded-lg border border-[#141414]/15 text-xs"
                          >
                            <option value={140}>1 Story (12 ft)</option>
                            <option value={260}>2 Stories (22 ft)</option>
                            <option value={360}>3 Stories (30 ft)</option>
                            <option value={480}>4 Stories (40 ft)</option>
                            <option value={720}>6 Stories (60 ft)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-[#717170]">Style</label>
                          <select
                            value={bldg.style}
                            onChange={(e) =>
                              handleUpdateBuilding(bldg.id, {
                                style: e.target.value as SurroundingBuilding['style']
                              })
                            }
                            className="w-full mt-1 p-1.5 bg-white rounded-lg border border-[#141414]/15 text-xs"
                          >
                            <option value="modern">Modern Minimal</option>
                            <option value="brick">Warm Brick</option>
                            <option value="glass">Commercial Glass</option>
                            <option value="classic">Classic Render</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-[#717170]">Distance (X)</label>
                          <input
                            type="range"
                            min="-800"
                            max="800"
                            value={bldg.x}
                            onChange={(e) => handleUpdateBuilding(bldg.id, { x: Number(e.target.value) })}
                            className="w-full mt-2 accent-[#0284C7]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-[#717170]">Distance (Z)</label>
                          <input
                            type="range"
                            min="-800"
                            max="800"
                            value={bldg.z}
                            onChange={(e) => handleUpdateBuilding(bldg.id, { z: Number(e.target.value) })}
                            className="w-full mt-2 accent-[#0284C7]"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ROAD & PLOT LAYOUT */}
          {activeTab === 'road' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Road Toggle */}
                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#141414]/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#141414] block">Front Street / Road</span>
                    <span className="text-[10px] text-[#717170]">Asphalt roadway with center striping</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={site.showRoad}
                    onChange={(e) => onUpdateSite({ ...site, showRoad: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0284C7] focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Sidewalk Toggle */}
                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#141414]/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#141414] block">Pedestrian Sidewalk</span>
                    <span className="text-[10px] text-[#717170]">Concrete walkway with road curb</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={site.showSidewalk}
                    onChange={(e) => onUpdateSite({ ...site, showSidewalk: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0284C7] focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Driveway Toggle */}
                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#141414]/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#141414] block">Paved Driveway</span>
                    <span className="text-[10px] text-[#717170]">Vehicle access to house entrance</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={site.showDriveway}
                    onChange={(e) => onUpdateSite({ ...site, showDriveway: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0284C7] focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Plot Boundary */}
                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#141414]/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#141414] block">Property Boundary</span>
                    <span className="text-[10px] text-[#717170]">Perimeter border / stone retaining line</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={site.showPlotBoundary}
                    onChange={(e) => onUpdateSite({ ...site, showPlotBoundary: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0284C7] focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Road Width */}
              {site.showRoad && (
                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#141414]/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#141414]">Road Width</span>
                    <span className="font-mono text-[#0284C7] font-bold">
                      {formatDimension(site.roadWidth || 260, unit)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="180"
                    max="480"
                    step="12"
                    value={site.roadWidth || 260}
                    onChange={(e) => onUpdateSite({ ...site, roadWidth: Number(e.target.value) })}
                    className="w-full accent-[#0284C7]"
                  />
                </div>
              )}

              {/* Plot Width & Depth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#141414]/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#141414]">Plot Frontage (Width)</span>
                    <span className="font-mono text-[#0284C7] font-bold">
                      {formatDimension(site.plotWidth || 840, unit)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="480"
                    max="1440"
                    step="24"
                    value={site.plotWidth || 840}
                    onChange={(e) => onUpdateSite({ ...site, plotWidth: Number(e.target.value) })}
                    className="w-full accent-[#0284C7]"
                  />
                </div>

                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#141414]/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#141414]">Plot Depth</span>
                    <span className="font-mono text-[#0284C7] font-bold">
                      {formatDimension(site.plotDepth || 960, unit)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="600"
                    max="1800"
                    step="24"
                    value={site.plotDepth || 960}
                    onChange={(e) => onUpdateSite({ ...site, plotDepth: Number(e.target.value) })}
                    className="w-full accent-[#0284C7]"
                  />
                </div>
              </div>

              {/* Trees */}
              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#141414]/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#141414] block">Landscape Trees</span>
                  <span className="text-[10px] text-[#717170]">Architectural shade trees on lawn and street</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={site.showTrees}
                    onChange={(e) => onUpdateSite({ ...site, showTrees: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0284C7] focus:ring-0 cursor-pointer"
                  />
                  {site.showTrees && (
                    <select
                      value={site.treeCount || 5}
                      onChange={(e) => onUpdateSite({ ...site, treeCount: Number(e.target.value) })}
                      className="p-1 bg-white rounded border border-[#141414]/15 text-xs"
                    >
                      <option value={3}>3 Trees</option>
                      <option value={5}>5 Trees</option>
                      <option value={8}>8 Trees</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLOT & SOLAR ORIENTATION */}
          {activeTab === 'solar' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#141414]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#B45309]" />
                    <span className="font-bold text-[#141414]">True North Plot Orientation</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#B45309]">
                    {site.plotOrientationNorth || 0}°
                  </span>
                </div>

                <p className="text-[11px] text-[#5A5A58]">
                  Adjust the angle of True North relative to your property facade to simulate real solar angles, sunset shadow casting, and morning light through windows.
                </p>

                <input
                  type="range"
                  min="0"
                  max="359"
                  value={site.plotOrientationNorth || 0}
                  onChange={(e) => onUpdateSite({ ...site, plotOrientationNorth: Number(e.target.value) })}
                  className="w-full accent-[#B45309]"
                />

                <div className="flex justify-between text-[10px] font-mono text-[#717170]">
                  <span>0° North Facade</span>
                  <span>90° East Morning</span>
                  <span>180° South Noon</span>
                  <span>270° West Sunset</span>
                </div>
              </div>

              {/* Solar Guidelines Info */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/80 space-y-2 text-[#92400e]">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-xs">Sunlight &amp; Sunset Alignment Guide</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  • <strong>Morning Sunrise (East):</strong> Soft warm light filters into east-facing bedrooms and kitchens.<br />
                  • <strong>Solar Noon (South):</strong> Peak overhead light with high elevation and crisp vertical shadows.<br />
                  • <strong>Sunset Golden Hour (West):</strong> Low-angle amber sunlight casts dramatic long shadows across your living room and patio.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-[#141414]/10 bg-[#FAF9F5]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Done &amp; Update 3D Scene</span>
          </button>
        </div>
      </div>
    </div>
  );
};
