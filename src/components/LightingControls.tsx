import React from 'react';
import { Sun, Moon, Eye, Sliders, X, Sparkles } from 'lucide-react';
import { LightingState, ViewSettings } from '../types';

interface LightingControlsProps {
  lighting: LightingState;
  settings: ViewSettings;
  onUpdateLighting: (updater: Partial<LightingState>) => void;
  onUpdateSettings: (updater: Partial<ViewSettings>) => void;
  onClose: () => void;
}

export const LightingControls: React.FC<LightingControlsProps> = ({
  lighting,
  settings,
  onUpdateLighting,
  onUpdateSettings,
  onClose
}) => {
  const timePresets = [
    { label: 'Morning (8 AM)', time: 8, icon: <Sun className="w-3.5 h-3.5 text-amber-400" /> },
    { label: 'Noon (12 PM)', time: 12, icon: <Sun className="w-3.5 h-3.5 text-yellow-300" /> },
    { label: 'Afternoon (3 PM)', time: 15, icon: <Sun className="w-3.5 h-3.5 text-orange-400" /> },
    { label: 'Golden Hour (6 PM)', time: 18, icon: <Moon className="w-3.5 h-3.5 text-orange-500" /> }
  ];

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl border border-[#141414]/15 text-[#141414] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/10 bg-[#F7F6F3]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#141414] text-white flex items-center justify-center shadow-xs">
            <Sun className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-serif font-bold text-[#141414]">Sun &amp; Environmental Lighting</h2>
            <p className="text-[11px] text-[#5A5A58]">Natural daylight &amp; shell visibility</p>
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
        {/* Time of Day Slider */}
        <div className="space-y-2 p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#141414]/10">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#141414]">Time of Day (Sun Angle)</span>
            <span className="text-[#0369A1] font-mono font-bold">
              {formatTime(lighting.timeOfDay)}
            </span>
          </div>
          <input
            type="range"
            min="6"
            max="19"
            step="0.25"
            value={lighting.timeOfDay}
            onChange={(e) => onUpdateLighting({ timeOfDay: parseFloat(e.target.value) })}
            className="w-full h-2 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#141414]"
          />
          <div className="text-[10px] text-[#717170]">
            Sun casts daylight and soft shadow beams through the Left Wall window (5'3" sill).
          </div>
        </div>

        {/* Quick Time Presets */}
        <div className="grid grid-cols-2 gap-2">
          {timePresets.map((preset) => {
            const isActive = Math.abs(lighting.timeOfDay - preset.time) < 0.5;
            return (
              <button
                key={preset.time}
                onClick={() => onUpdateLighting({ timeOfDay: preset.time })}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-[#141414] text-white border-[#141414] shadow-xs'
                    : 'bg-[#F0EFEB] hover:bg-[#E4E3E0] text-[#5A5A58] hover:text-[#141414] border-[#141414]/10'
                }`}
              >
                {preset.icon}
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sunlight & Ambient Intensity Sliders */}
        <div className="space-y-3.5 p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#141414]/10">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#141414] font-medium">Sun Light Intensity</span>
              <span className="font-mono text-[#5A5A58] font-semibold">{lighting.sunIntensity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={lighting.sunIntensity}
              onChange={(e) => onUpdateLighting({ sunIntensity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#B45309]"
            />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#141414]/10">
            <div className="flex justify-between text-xs">
              <span className="text-[#141414] font-medium">Ambient Sky Fill</span>
              <span className="font-mono text-[#5A5A58] font-semibold">{lighting.ambientIntensity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2"
              step="0.1"
              value={lighting.ambientIntensity}
              onChange={(e) => onUpdateLighting({ ambientIntensity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#0369A1]"
            />
          </div>
        </div>

        {/* Wall Transparency & Cutaway */}
        <div className="space-y-3 pt-2 border-t border-[#141414]/10">
          <div className="font-serif font-bold text-[#141414] flex items-center gap-1.5 text-xs">
            <Sliders className="w-3.5 h-3.5 text-[#0369A1]" />
            Shell Visibility Controls
          </div>

          {/* Wall Opacity */}
          <div className="space-y-1.5 p-3 bg-[#FAF9F6] rounded-xl border border-[#141414]/10">
            <div className="flex justify-between text-xs">
              <span className="text-[#141414] font-medium">Wall Opacity</span>
              <span className="font-mono text-[#5A5A58] font-semibold">{Math.round(settings.wallOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={settings.wallOpacity}
              onChange={(e) => onUpdateSettings({ wallOpacity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#E4E3E0] rounded-lg appearance-none cursor-pointer accent-[#141414]"
            />
          </div>

          {/* Stud Framing Toggle */}
          <label className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-xl border border-[#141414]/10 cursor-pointer hover:bg-[#F0EFEB] transition">
            <span className="text-[11px] text-[#141414] font-medium">Show Timber Stud Framing (2x4s)</span>
            <input
              type="checkbox"
              checked={settings.showStudFraming}
              onChange={(e) => onUpdateSettings({ showStudFraming: e.target.checked })}
              className="w-4 h-4 rounded bg-[#EAE8E3] border-[#141414]/20 text-[#141414] accent-[#141414] cursor-pointer"
            />
          </label>

          {/* Human Mannequin Toggle */}
          <label className="flex items-center justify-between p-3 bg-[#FAF9F6] rounded-xl border border-[#141414]/10 cursor-pointer hover:bg-[#F0EFEB] transition">
            <span className="text-[11px] text-[#141414] font-medium">Show 5'6" Human Avatar in Doorway</span>
            <input
              type="checkbox"
              checked={settings.showHumanFigure}
              onChange={(e) => onUpdateSettings({ showHumanFigure: e.target.checked })}
              className="w-4 h-4 rounded bg-[#EAE8E3] border-[#141414]/20 text-[#141414] accent-[#141414] cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
