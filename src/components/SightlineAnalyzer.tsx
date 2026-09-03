import React from 'react';
import { ShieldCheck, Eye, ArrowRight, CheckCircle, XCircle, X, Compass, Sun } from 'lucide-react';
import { ViewSettings } from '../types';

interface SightlineAnalyzerProps {
  settings: ViewSettings;
  onUpdateSettings: (updater: Partial<ViewSettings>) => void;
  onClose: () => void;
  onJumpToDoorway: () => void;
}

export const SightlineAnalyzer: React.FC<SightlineAnalyzerProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onJumpToDoorway
}) => {
  return (
    <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-[#141414]/15 text-[#141414] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/10 bg-[#F7F6F3]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#141414] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-serif font-bold text-[#141414]">Doorway Sightline Inspector</h2>
            <p className="text-[11px] text-[#5A5A58]">Architectural privacy barrier simulation</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#5A5A58] hover:text-[#141414] hover:bg-[#EAE8E3] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5 text-xs text-[#5A5A58] overflow-y-auto">
        {/* Visual Summary Card (Bento Highlight Module) */}
        <div className="p-4 bg-[#E8F5E9] rounded-2xl border border-[#A5D6A7] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[#1B5E20]">Direct Line-of-Sight Status:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1B5E20] text-white text-[10px] font-mono font-bold shadow-xs">
              100% PROTECTED
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center gap-2 text-[#1B5E20]">
              <CheckCircle className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
              <span>
                <strong>Window Wall (Left):</strong> Shielded from doorway view by 3'6" wing.
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#1B5E20]">
              <CheckCircle className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
              <span>
                <strong>Qibla Prayer Wall (Back):</strong> Obstructed from entrance sightline.
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#1B5E20]">
              <CheckCircle className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
              <span>
                <strong>7'0" Partition Height:</strong> Exceeds 5'6" average human eye line.
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#1B5E20]">
              <CheckCircle className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
              <span>
                <strong>5'0" Ceiling Clearance:</strong> Preserves open airflow &amp; daylight.
              </span>
            </div>
          </div>
        </div>

        {/* Observer Standpoint Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#717170] block font-semibold">
            Select Observer Position:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'door_approach', label: 'Approach', desc: 'Outside' },
              { id: 'door_threshold', label: 'Threshold', desc: 'At Door' },
              { id: 'inside_entry', label: 'Inside', desc: 'Past 3\'6"' }
            ].map((item) => {
              const isSelected = settings.interactiveSightlineOrigin === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    onUpdateSettings({
                      interactiveSightlineOrigin: item.id as any,
                      showSightlines: true
                    })
                  }
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#141414] border-[#141414] text-white shadow-xs'
                      : 'bg-[#F0EFEB] hover:bg-[#E4E3E0] text-[#5A5A58] hover:text-[#141414] border-[#141414]/10'
                  }`}
                >
                  <div className={`font-serif font-bold text-xs ${isSelected ? 'text-white' : 'text-[#141414]'}`}>{item.label}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-[#717170]'}`}>{item.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ray-Casting Legend */}
        <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#141414]/10 space-y-2">
          <div className="text-[11px] font-serif font-bold text-[#141414]">3D Laser Sightline Legend:</div>
          <div className="flex items-center gap-2 text-[11px]">
            <div className="w-3 h-3 rounded-full bg-[#DC2626]" />
            <span className="text-[#5A5A58]">
              <strong className="text-[#DC2626]">Red Rays:</strong> Blocked by 7'0" Privacy Partition
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
            <span className="text-[#5A5A58]">
              <strong className="text-[#16A34A]">Green Rays:</strong> Clear open line-of-sight
            </span>
          </div>
        </div>

        {/* Jump to Doorway Eye Level */}
        <button
          onClick={onJumpToDoorway}
          className="w-full py-2.5 px-4 rounded-xl bg-[#141414] hover:bg-[#2B2A27] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
        >
          <Eye className="w-4 h-4 text-white" />
          <span>Switch Camera to Doorway Eye-Level (5'6")</span>
        </button>
      </div>
    </div>
  );
};
