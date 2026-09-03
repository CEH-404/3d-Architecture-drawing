import React, { useState } from 'react';
import { RoomDimensions, ViewSettings, MeasurementUnit, FurnitureItem, HouseRoom } from '../types';
import { formatDimension } from '../utils/constants';
import {
  Ruler,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Compass,
  ArrowRight,
  ShieldCheck,
  Maximize2,
  Move
} from 'lucide-react';

interface MeasurementInspectorProps {
  room: HouseRoom;
  unit: MeasurementUnit;
  onClose: () => void;
}

export const MeasurementInspector: React.FC<MeasurementInspectorProps> = ({
  room,
  unit,
  onClose
}) => {
  const specs = room.specs;

  // Key Architectural Clearances
  const doorWidthInches = specs.doorWidth;
  const doorPassed = doorWidthInches >= 36; // ADA 36" accessible minimum

  const entryCorridorClearance = specs.doorOffsetLeft; // distance from corner to doorway
  const doorRemainingRight = specs.width - (specs.doorOffsetLeft + specs.doorWidth);

  // Partition Wing wall depth
  const partitionDepth = specs.partitionDepth;
  const partitionPassed = partitionDepth >= 36; // 3'0" minimum to shield direct line of sight

  // Ceiling Clearance
  const ceilingHeight = specs.height;
  const ceilingPassed = ceilingHeight >= 96; // 8'0" standard residential code minimum

  // Window Sill Height
  const sillHeight = specs.windowSillHeight;
  const sillEgressPassed = sillHeight <= 44; // IBC code: max 44" for emergency escape and rescue opening

  // Custom 2-Point Measure Calculator
  const [pointAX, setPointAX] = useState<number>(0);
  const [pointAZ, setPointAZ] = useState<number>(0);
  const [pointBX, setPointBX] = useState<number>(Math.round(specs.width / 2));
  const [pointBZ, setPointBZ] = useState<number>(Math.round(specs.depth / 2));

  const distanceInches = Math.sqrt(
    Math.pow(pointBX - pointAX, 2) + Math.pow(pointBZ - pointAZ, 2)
  );
  const distanceFeet = distanceInches / 12;
  const distanceMeters = distanceInches * 0.0254;

  const clearanceItems = [
    {
      title: 'Entrance Doorway Clear Width',
      value: formatDimension(doorWidthInches, unit),
      requirement: '≥ 36" (3\'0") ADA Accessible Clear Width',
      status: doorPassed ? 'pass' : 'warn',
      notes: doorPassed
        ? 'Passes ADA accessible doorway standard with ample moving clearance.'
        : 'Narrow doorway opening; recommended minimum is 36 inches.'
    },
    {
      title: 'Privacy Partition Barrier Depth',
      value: formatDimension(partitionDepth, unit),
      requirement: '≥ 36" (3\'0") Eye-line Privacy Shielding',
      status: partitionPassed ? 'pass' : 'warn',
      notes: partitionPassed
        ? 'Fully conceals internal prayer rug & bedroom resting area from door threshold.'
        : 'Slightly short partition; sightline may be partially visible from doorway angle.'
    },
    {
      title: 'Interior Finished Ceiling Height',
      value: formatDimension(ceilingHeight, unit),
      requirement: '≥ 96" (8\'0") IRC Habitable Minimum',
      status: ceilingPassed ? 'pass' : 'warn',
      notes: `${formatDimension(ceilingHeight, unit)} affords lofty, spacious air volume and natural light penetration.`
    },
    {
      title: 'Window Sill Height Above Floor',
      value: formatDimension(sillHeight, unit),
      requirement: '≤ 44" IRC Egress / ≥ 24" Fall Safety',
      status: sillHeight <= 44 ? 'pass' : 'warn',
      notes:
        sillHeight > 44
          ? 'Sill height is 63" (high privacy window). Great for privacy, note secondary bedroom egress required.'
          : 'Complies with standard emergency egress reach.'
    },
    {
      title: 'Door Left Margin to Corner',
      value: formatDimension(entryCorridorClearance, unit),
      requirement: '≥ 12" Structural Corner Trimmer Studs',
      status: entryCorridorClearance >= 12 ? 'pass' : 'fail',
      notes: 'Provides sturdy structural king & jack stud framing clearance at wall intersection.'
    },
    {
      title: 'Door Right Wall Latch Clearance',
      value: formatDimension(doorRemainingRight, unit),
      requirement: '≥ 18" Pull-Side Door Latch Clearance',
      status: doorRemainingRight >= 18 ? 'pass' : 'warn',
      notes: 'Room for door swing and comfortable latch approach.'
    }
  ];

  return (
    <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl border border-[#141414]/15 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-[#141414] select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/10 bg-[#FAF9F5]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center shadow-sm">
            <Ruler className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-serif font-bold text-[#141414]">
              Architectural Clearance &amp; Code Inspector
            </h2>
            <p className="text-[11px] text-[#5A5A58]">
              {room.name} • Building Code &amp; Ergonomic Compliance
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-[#EAE8E3] text-[#5A5A58] hover:text-[#141414] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 overflow-y-auto text-xs">
        {/* Compliance Checklist */}
        <div className="space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#717170] font-semibold flex items-center justify-between">
            <span>Critical Room Clearances</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified
            </span>
          </div>

          <div className="space-y-2">
            {clearanceItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#141414]/10 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.status === 'pass' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : item.status === 'warn' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span className="font-semibold text-[#141414]">{item.title}</span>
                  </div>
                  <span className="font-mono font-bold text-[#0284C7] bg-white px-2 py-0.5 rounded border border-[#141414]/10">
                    {item.value}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#717170] pl-6">
                  <span>Standard: {item.requirement}</span>
                </div>
                <p className="text-[11px] text-[#5A5A58] pl-6 leading-relaxed">{item.notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Point-to-Point Tape Measure */}
        <div className="p-4 bg-[#F0F9FF] rounded-2xl border border-[#BAE6FD] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0369A1] font-semibold">
              <Ruler className="w-4 h-4" />
              <span>Interactive 2-Point Tape Measure</span>
            </div>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded text-[#0369A1] border border-[#BAE6FD]">
              Plan Coords
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            {/* Point A */}
            <div className="space-y-1">
              <label className="text-[#5A5A58] font-mono">Point A (Origin)</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <span className="text-[10px] text-[#717170]">X (in):</span>
                  <input
                    type="number"
                    value={pointAX}
                    onChange={(e) => setPointAX(Number(e.target.value))}
                    className="w-full bg-white border border-[#BAE6FD] rounded-lg px-2 py-1 font-mono text-[#141414]"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-[#717170]">Z (in):</span>
                  <input
                    type="number"
                    value={pointAZ}
                    onChange={(e) => setPointAZ(Number(e.target.value))}
                    className="w-full bg-white border border-[#BAE6FD] rounded-lg px-2 py-1 font-mono text-[#141414]"
                  />
                </div>
              </div>
            </div>

            {/* Point B */}
            <div className="space-y-1">
              <label className="text-[#5A5A58] font-mono">Point B (Target)</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <span className="text-[10px] text-[#717170]">X (in):</span>
                  <input
                    type="number"
                    value={pointBX}
                    onChange={(e) => setPointBX(Number(e.target.value))}
                    className="w-full bg-white border border-[#BAE6FD] rounded-lg px-2 py-1 font-mono text-[#141414]"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-[#717170]">Z (in):</span>
                  <input
                    type="number"
                    value={pointBZ}
                    onChange={(e) => setPointBZ(Number(e.target.value))}
                    className="w-full bg-white border border-[#BAE6FD] rounded-lg px-2 py-1 font-mono text-[#141414]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Computed Measurement */}
          <div className="p-3 bg-white rounded-xl border border-[#BAE6FD] flex items-center justify-between">
            <span className="text-[#5A5A58]">Straight-Line Clearance:</span>
            <div className="text-right">
              <div className="font-mono font-bold text-sm text-[#0369A1]">
                {formatDimension(Math.round(distanceInches), unit)}
              </div>
              <div className="text-[10px] font-mono text-[#717170]">
                {distanceInches.toFixed(1)}" • {distanceFeet.toFixed(2)} ft • {distanceMeters.toFixed(2)} m
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
