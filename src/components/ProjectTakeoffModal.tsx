import React, { useState } from 'react';
import { HousePlan, MeasurementUnit, RoomDimensions, FurnitureItem } from '../types';
import { formatDimension } from '../utils/constants';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  X,
  Layers,
  Building2,
  Paintbrush,
  Grid,
  DoorOpen,
  Maximize2,
  Armchair,
  Info
} from 'lucide-react';

interface ProjectTakeoffModalProps {
  house: HousePlan;
  unit: MeasurementUnit;
  onClose: () => void;
}

export const ProjectTakeoffModal: React.FC<ProjectTakeoffModalProps> = ({
  house,
  unit,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'surfaces' | 'openings' | 'furnishings'>('summary');

  // Calculations
  const roomCalculations = house.rooms.map((room) => {
    const wFt = room.specs.width / 12;
    const dFt = room.specs.depth / 12;
    const hFt = room.specs.height / 12;

    const floorAreaSqFt = wFt * dFt;
    const floorAreaSqM = floorAreaSqFt * 0.092903;

    // Gross Wall Area = Perimeter * Height
    const perimeterFt = 2 * (wFt + dFt);
    const grossWallAreaSqFt = perimeterFt * hFt;

    // Deduct Door Opening
    const doorAreaSqFt = (room.specs.doorWidth / 12) * (room.specs.doorHeight / 12);
    // Deduct Window Opening
    const windowAreaSqFt = (room.specs.windowWidth / 12) * (room.specs.windowHeight / 12);
    // Add Partition Surface Area (both sides)
    const partitionAreaSqFt = 2 * ((room.specs.partitionDepth / 12) * (room.specs.partitionHeight / 12));

    const netWallAreaSqFt = Math.max(0, grossWallAreaSqFt - doorAreaSqFt - windowAreaSqFt + partitionAreaSqFt);
    const netWallAreaSqM = netWallAreaSqFt * 0.092903;

    // Paint: ~350 sq ft per gallon per coat (assume 2 coats = 175 sq ft per gallon)
    const paintGallons = (netWallAreaSqFt * 2) / 350;
    // Drywall sheets: standard 4'x8' = 32 sq ft per sheet (with 10% scrap)
    const drywallSheets = Math.ceil((netWallAreaSqFt * 1.1) / 32);
    // Flooring with 10% scrap allowance
    const flooringWithWasteSqFt = Math.ceil(floorAreaSqFt * 1.1);

    return {
      room,
      floorAreaSqFt,
      floorAreaSqM,
      netWallAreaSqFt,
      netWallAreaSqM,
      paintGallons,
      drywallSheets,
      flooringWithWasteSqFt,
      furnitureCount: room.furniture ? room.furniture.filter((f) => f.enabled !== false).length : 0
    };
  });

  const totalFloorAreaSqFt = roomCalculations.reduce((sum, r) => sum + r.floorAreaSqFt, 0);
  const totalFloorAreaSqM = totalFloorAreaSqFt * 0.092903;
  const totalNetWallAreaSqFt = roomCalculations.reduce((sum, r) => sum + r.netWallAreaSqFt, 0);
  const totalNetWallAreaSqM = totalNetWallAreaSqFt * 0.092903;
  const totalPaintGallons = roomCalculations.reduce((sum, r) => sum + r.paintGallons, 0);
  const totalDrywallSheets = roomCalculations.reduce((sum, r) => sum + r.drywallSheets, 0);
  const totalFlooringWithWasteSqFt = roomCalculations.reduce((sum, r) => sum + r.flooringWithWasteSqFt, 0);
  const totalFurnitureItems = roomCalculations.reduce((sum, r) => sum + r.furnitureCount, 0);

  // Generate Markdown report
  const generateMarkdownReport = () => {
    let md = `# Architectural Project Spec Sheet: ${house.name}\n\n`;
    md += `**Date Generated**: ${new Date().toLocaleDateString()}\n`;
    md += `**Total Rooms**: ${house.rooms.length}\n`;
    md += `**Total Floor Area**: ${totalFloorAreaSqFt.toFixed(1)} sq ft (${totalFloorAreaSqM.toFixed(1)} m²)\n`;
    md += `**Total Wall Area (Net)**: ${totalNetWallAreaSqFt.toFixed(1)} sq ft (${totalNetWallAreaSqM.toFixed(1)} m²)\n`;
    md += `**Estimated Paint**: ${Math.ceil(totalPaintGallons)} gal (2 coats)\n`;
    md += `**Standard 4x8 Drywall Sheets**: ${totalDrywallSheets} sheets (incl. 10% waste)\n`;
    md += `**Flooring Required**: ${totalFlooringWithWasteSqFt} sq ft (incl. 10% waste)\n\n`;

    md += `## Room Dimensions & Areas\n\n`;
    md += `| Room Name | Type | Dimensions (W × D × H) | Floor Area | Net Wall Area | Est. Paint |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    roomCalculations.forEach((r) => {
      const dim = `${formatDimension(r.room.specs.width, unit)} × ${formatDimension(r.room.specs.depth, unit)} × ${formatDimension(r.room.specs.height, unit)}`;
      const area = `${r.floorAreaSqFt.toFixed(1)} sq ft (${r.floorAreaSqM.toFixed(1)} m²)`;
      const wall = `${r.netWallAreaSqFt.toFixed(1)} sq ft`;
      const paint = `${r.paintGallons.toFixed(1)} gal`;
      md += `| ${r.room.name} | ${r.room.type} | ${dim} | ${area} | ${wall} | ${paint} |\n`;
    });

    md += `\n## Door & Window Schedule\n\n`;
    md += `| Room | Door Type | Door Opening | Window Wall | Window Size | Window Sill Height |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    house.rooms.forEach((r) => {
      const s = r.specs;
      const doorSize = `${formatDimension(s.doorWidth, unit)} × ${formatDimension(s.doorHeight, unit)}`;
      const winSize = `${formatDimension(s.windowWidth, unit)} × ${formatDimension(s.windowHeight, unit)}`;
      const sill = formatDimension(s.windowSillHeight, unit);
      md += `| ${r.name} | ${s.doorType} | ${doorSize} | ${s.windowWall} | ${winSize} | ${sill} |\n`;
    });

    md += `\n## Furniture & Fixtures Inventory\n\n`;
    md += `| Room | Item Name | Category | Item Type | Finish / Color |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    house.rooms.forEach((r) => {
      if (r.furniture) {
        r.furniture.forEach((f) => {
          if (f.enabled !== false) {
            md += `| ${r.name} | ${f.name} | ${f.category} | ${f.itemType} | ${f.color || 'Standard'} |\n`;
          }
        });
      }
    });

    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    let csv = 'Room Name,Room Type,Width (in),Depth (in),Height (in),Floor Area (sq ft),Net Wall Area (sq ft),Paint Gallons,Drywall Sheets,Flooring with Waste (sq ft)\n';
    roomCalculations.forEach((r) => {
      csv += `"${r.room.name}","${r.room.type}",${r.room.specs.width},${r.room.specs.depth},${r.room.specs.height},${r.floorAreaSqFt.toFixed(1)},${r.netWallAreaSqFt.toFixed(1)},${r.paintGallons.toFixed(1)},${r.drywallSheets},${r.flooringWithWasteSqFt}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${house.name.toLowerCase().replace(/\s+/g, '_')}_takeoff_schedule.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#FAF9F5] text-[#141414] w-full max-w-4xl max-h-[90vh] rounded-3xl border border-[#141414]/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/10 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#141414] text-white flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold tracking-tight text-[#141414]">
                  Architectural Spec Sheet &amp; Bill of Materials
                </h2>
                <span className="px-2 py-0.5 bg-[#E0F2FE] text-[#0369A1] border border-[#7DD3FC] rounded-full text-[10px] font-mono font-semibold">
                  Takeoff Schedule
                </span>
              </div>
              <p className="text-xs text-[#5A5A58] mt-0.5">
                {house.name} • {house.rooms.length} Rooms • {totalFloorAreaSqFt.toFixed(0)} sq ft ({totalFloorAreaSqM.toFixed(0)} m²) Total Area
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#141414] text-xs font-semibold rounded-xl border border-[#141414]/15 transition cursor-pointer"
              title="Copy formatted markdown report"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer"
              title="Download CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#717170] hover:text-[#141414] hover:bg-[#EAE8E3] transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-[#141414]/10 bg-white">
          <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#141414]/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#717170]">Total Floor Area</div>
            <div className="text-lg font-mono font-bold text-[#141414] mt-0.5">
              {totalFloorAreaSqFt.toFixed(0)} <span className="text-xs font-normal text-[#5A5A58]">sq ft</span>
            </div>
            <div className="text-[11px] text-[#0284C7] mt-0.5">
              {totalFloorAreaSqM.toFixed(1)} m²
            </div>
          </div>

          <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#141414]/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#717170]">Net Wall Area</div>
            <div className="text-lg font-mono font-bold text-[#141414] mt-0.5">
              {totalNetWallAreaSqFt.toFixed(0)} <span className="text-xs font-normal text-[#5A5A58]">sq ft</span>
            </div>
            <div className="text-[11px] text-[#0284C7] mt-0.5">
              {totalNetWallAreaSqM.toFixed(1)} m²
            </div>
          </div>

          <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#141414]/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#717170]">Paint Required</div>
            <div className="text-lg font-mono font-bold text-[#B45309] mt-0.5">
              ~{Math.ceil(totalPaintGallons)} <span className="text-xs font-normal text-[#5A5A58]">gallons</span>
            </div>
            <div className="text-[11px] text-[#5A5A58] mt-0.5">
              2 coats coverage
            </div>
          </div>

          <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#141414]/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#717170]">Drywall 4'x8' Sheets</div>
            <div className="text-lg font-mono font-bold text-[#7C3AED] mt-0.5">
              {totalDrywallSheets} <span className="text-xs font-normal text-[#5A5A58]">boards</span>
            </div>
            <div className="text-[11px] text-[#5A5A58] mt-0.5">
              Incl. 10% cutting scrap
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#141414]/10 bg-[#FAF9F5]">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'bg-white text-[#141414] border-t-2 border-[#141414] shadow-xs'
                : 'text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Room Area Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('surfaces')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'surfaces'
                ? 'bg-white text-[#141414] border-t-2 border-[#141414] shadow-xs'
                : 'text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Materials &amp; Finishes</span>
          </button>

          <button
            onClick={() => setActiveTab('openings')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'openings'
                ? 'bg-white text-[#141414] border-t-2 border-[#141414] shadow-xs'
                : 'text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Doors &amp; Windows</span>
          </button>

          <button
            onClick={() => setActiveTab('furnishings')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'furnishings'
                ? 'bg-white text-[#141414] border-t-2 border-[#141414] shadow-xs'
                : 'text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            <Armchair className="w-3.5 h-3.5" />
            <span>Furnishings ({totalFurnitureItems})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'summary' && (
            <div className="bg-white rounded-2xl border border-[#141414]/10 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#141414]/10 text-[#717170] font-mono text-[10px] uppercase">
                    <th className="p-3">Room Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Dimensions (W × D × H)</th>
                    <th className="p-3">Floor Area</th>
                    <th className="p-3">Net Wall Area</th>
                    <th className="p-3">Paint (2 Coats)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/5">
                  {roomCalculations.map(({ room, floorAreaSqFt, floorAreaSqM, netWallAreaSqFt, netWallAreaSqM, paintGallons }) => (
                    <tr key={room.id} className="hover:bg-[#FAF9F5]/80 transition">
                      <td className="p-3 font-semibold text-[#141414] flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: room.colorTag || '#0284C7' }}
                        />
                        <span>{room.name}</span>
                      </td>
                      <td className="p-3 font-mono text-[#5A5A58] capitalize">
                        {room.type.replace('_', ' ')}
                      </td>
                      <td className="p-3 font-mono text-[#141414]">
                        {formatDimension(room.specs.width, unit)} × {formatDimension(room.specs.depth, unit)} × {formatDimension(room.specs.height, unit)}
                      </td>
                      <td className="p-3 font-mono font-medium text-[#141414]">
                        {floorAreaSqFt.toFixed(1)} sq ft <span className="text-[10px] text-[#5A5A58]">({floorAreaSqM.toFixed(1)} m²)</span>
                      </td>
                      <td className="p-3 font-mono text-[#5A5A58]">
                        {netWallAreaSqFt.toFixed(0)} sq ft
                      </td>
                      <td className="p-3 font-mono text-[#B45309]">
                        ~{paintGallons.toFixed(1)} gal
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'surfaces' && (
            <div className="bg-white rounded-2xl border border-[#141414]/10 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#141414]/10 text-[#717170] font-mono text-[10px] uppercase">
                    <th className="p-3">Room</th>
                    <th className="p-3">Flooring Spec</th>
                    <th className="p-3">Flooring Req. (+10%)</th>
                    <th className="p-3">Wall Finish / Paint</th>
                    <th className="p-3">Partition Style</th>
                    <th className="p-3">Drywall Sheets (4'x8')</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/5">
                  {roomCalculations.map(({ room, flooringWithWasteSqFt, drywallSheets }) => (
                    <tr key={room.id} className="hover:bg-[#FAF9F5]/80 transition">
                      <td className="p-3 font-semibold text-[#141414]">{room.name}</td>
                      <td className="p-3 font-mono capitalize text-[#0284C7]">
                        {room.specs.floorMaterial.replace('_', ' ')}
                      </td>
                      <td className="p-3 font-mono font-medium text-[#141414]">
                        {flooringWithWasteSqFt} sq ft
                      </td>
                      <td className="p-3 font-mono flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: room.specs.wallColor || '#F5F5F0' }}
                        />
                        <span>{room.specs.wallColor || '#F5F5F0'}</span>
                      </td>
                      <td className="p-3 font-mono capitalize text-[#5A5A58]">
                        {room.specs.partitionStyle.replace('_', ' ')} ({formatDimension(room.specs.partitionDepth, unit)} × {formatDimension(room.specs.partitionHeight, unit)})
                      </td>
                      <td className="p-3 font-mono text-[#7C3AED] font-medium">
                        {drywallSheets} sheets
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'openings' && (
            <div className="bg-white rounded-2xl border border-[#141414]/10 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#141414]/10 text-[#717170] font-mono text-[10px] uppercase">
                    <th className="p-3">Room</th>
                    <th className="p-3">Door Type</th>
                    <th className="p-3">Door Dimensions</th>
                    <th className="p-3">Door Offset from Left</th>
                    <th className="p-3">Window Wall</th>
                    <th className="p-3">Window Dimensions</th>
                    <th className="p-3">Sill Height</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/5">
                  {house.rooms.map((room) => {
                    const s = room.specs;
                    return (
                      <tr key={room.id} className="hover:bg-[#FAF9F5]/80 transition">
                        <td className="p-3 font-semibold text-[#141414]">{room.name}</td>
                        <td className="p-3 font-mono capitalize text-[#5A5A58]">
                          {s.doorType.replace('_', ' ')}
                        </td>
                        <td className="p-3 font-mono font-medium text-[#141414]">
                          {formatDimension(s.doorWidth, unit)} × {formatDimension(s.doorHeight, unit)}
                        </td>
                        <td className="p-3 font-mono text-[#5A5A58]">
                          {formatDimension(s.doorOffsetLeft, unit)}
                        </td>
                        <td className="p-3 font-mono capitalize text-[#0284C7]">
                          {s.windowWall} Wall
                        </td>
                        <td className="p-3 font-mono font-medium text-[#141414]">
                          {formatDimension(s.windowWidth, unit)} × {formatDimension(s.windowHeight, unit)}
                        </td>
                        <td className="p-3 font-mono text-[#5A5A58]">
                          {formatDimension(s.windowSillHeight, unit)} AFF
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'furnishings' && (
            <div className="bg-white rounded-2xl border border-[#141414]/10 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#141414]/10 text-[#717170] font-mono text-[10px] uppercase">
                    <th className="p-3">Room</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Finish / Color</th>
                    <th className="p-3">Room Coords (X, Z)</th>
                    <th className="p-3">Rotation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/5">
                  {house.rooms.flatMap((r) =>
                    (r.furniture || [])
                      .filter((f) => f.enabled !== false)
                      .map((f) => (
                        <tr key={f.id} className="hover:bg-[#FAF9F5]/80 transition">
                          <td className="p-3 font-semibold text-[#141414]">{r.name}</td>
                          <td className="p-3 font-medium text-[#141414]">{f.name}</td>
                          <td className="p-3 font-mono capitalize text-[#7C3AED]">{f.category}</td>
                          <td className="p-3 font-mono flex items-center gap-1.5">
                            {f.color && (
                              <span
                                className="w-3 h-3 rounded-full border border-black/20"
                                style={{ backgroundColor: f.color }}
                              />
                            )}
                            <span>{f.color || 'Standard'}</span>
                          </td>
                          <td className="p-3 font-mono text-[#5A5A58]">
                            {formatDimension(f.x, unit)}, {formatDimension(f.z, unit)}
                          </td>
                          <td className="p-3 font-mono text-[#5A5A58]">{f.rotation}°</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
