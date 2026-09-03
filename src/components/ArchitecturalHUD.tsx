import React from 'react';
import { ViewSettings, LightingState, MeasurementUnit } from '../types';
import {
  RotateCw,
  Eye,
  Layers,
  Sun,
  Moon,
  Maximize2,
  Users,
  Grid,
  Sparkles,
  Sliders,
  Play,
  Pause,
  Compass
} from 'lucide-react';

interface ArchitecturalHUDProps {
  settings: ViewSettings;
  lighting: LightingState;
  onUpdateSettings: (updater: Partial<ViewSettings>) => void;
  onUpdateLighting: (updater: Partial<LightingState>) => void;
  unit: MeasurementUnit;
}

export const ArchitecturalHUD: React.FC<ArchitecturalHUDProps> = ({
  settings,
  lighting,
  onUpdateSettings,
  onUpdateLighting,
  unit
}) => {
  const isRotating = !!settings.is360Rotating;

  return (
    <div className="max-w-[95vw] overflow-x-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-[#141414]/15 shadow-xl text-xs text-[#141414] select-none pointer-events-auto whitespace-nowrap">
      {/* 360 Turntable Spin Control */}
      <div className="flex items-center gap-1.5 pr-2 border-r border-[#141414]/10">
        <button
          onClick={() => onUpdateSettings({ is360Rotating: !isRotating })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
            isRotating
              ? 'bg-[#0284C7] text-white shadow-sm'
              : 'bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#141414] border border-[#141414]/15'
          }`}
          title="Toggle 360° Turntable Auto-Rotation"
        >
          {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRotating ? 'Auto-Spinning' : '360° Spin'}</span>
        </button>

        {isRotating && (
          <div className="flex items-center gap-1 pl-1">
            <button
              onClick={() =>
                onUpdateSettings({
                  rotation360Direction: settings.rotation360Direction === 'cw' ? 'ccw' : 'cw'
                })
              }
              className="p-1.5 rounded-lg bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#5A5A58] border border-[#141414]/10 transition cursor-pointer"
              title={`Switch direction (currently ${settings.rotation360Direction || 'cw'})`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${settings.rotation360Direction === 'ccw' ? '-scale-x-100' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Wall Cutaway Slider */}
      <div className="flex items-center gap-2 px-2 border-r border-[#141414]/10">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#717170]">Cutaway:</span>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.wallCutawayHeight ? Math.round((1 - settings.wallCutawayHeight / 144) * 100) : 0}
          onChange={(e) => {
            const val = Number(e.target.value);
            // 0 = full height (0 in settings.wallCutawayHeight)
            // 100 = low 36" cutaway
            if (val === 0) {
              onUpdateSettings({ wallCutawayHeight: 0 });
            } else {
              const cutawayInches = Math.round(144 - (val / 100) * 100); // down to 44"
              onUpdateSettings({ wallCutawayHeight: cutawayInches });
            }
          }}
          className="w-20 accent-[#0284C7] cursor-pointer"
          title="Wall cutaway height (0% = Full 12ft walls, 100% = waist-level cutaway)"
        />
        <button
          onClick={() =>
            onUpdateSettings({
              wallCutawayHeight: settings.wallCutawayHeight ? 0 : 54
            })
          }
          className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
            settings.wallCutawayHeight
              ? 'bg-[#0284C7] text-white'
              : 'bg-[#FAF9F5] text-[#5A5A58] hover:text-[#141414] border border-[#141414]/10'
          }`}
        >
          {settings.wallCutawayHeight ? "Cutaway 4'6\"" : "Full 12'"}
        </button>
      </div>

      {/* Ceiling Mode Selector */}
      <div className="flex items-center gap-1 px-2 border-r border-[#141414]/10">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#717170]">Ceiling:</span>
        <div className="flex bg-[#FAF9F5] p-0.5 rounded-lg border border-[#141414]/10">
          {(['open', 'solid', 'transparent'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onUpdateSettings({ ceilingMode: mode })}
              className={`px-2 py-1 rounded text-[10px] font-medium capitalize transition cursor-pointer ${
                settings.ceilingMode === mode
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#5A5A58] hover:text-[#141414]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Time of Day Sunlight Dial */}
      <div className="flex items-center gap-1.5 px-2 border-r border-[#141414]/10">
        <Sun className="w-3.5 h-3.5 text-[#B45309]" />
        <div className="flex bg-[#FAF9F5] p-0.5 rounded-lg border border-[#141414]/10">
          {[
            { label: 'Morning', hour: 9 },
            { label: 'Noon', hour: 13 },
            { label: 'Sunset', hour: 18.5 },
            { label: 'Night', hour: 22 }
          ].map((t) => {
            const isCurrent = Math.abs(lighting.timeOfDay - t.hour) < 1.5;
            return (
              <button
                key={t.label}
                onClick={() =>
                  onUpdateLighting({
                    timeOfDay: t.hour,
                    sunIntensity: t.hour >= 20 || t.hour <= 5 ? 0.1 : t.hour === 13 ? 2.0 : 1.4,
                    ambientIntensity: t.hour >= 20 || t.hour <= 5 ? 0.35 : 0.85
                  })
                }
                className={`px-2 py-1 rounded text-[10px] font-medium transition cursor-pointer ${
                  isCurrent
                    ? 'bg-[#B45309] text-white shadow-xs'
                    : 'text-[#5A5A58] hover:text-[#141414]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles: Human Figure, Studs Framing, Grid */}
      <div className="flex items-center gap-1 pl-1">
        <button
          onClick={() => onUpdateSettings({ showHumanFigure: !settings.showHumanFigure })}
          className={`p-1.5 rounded-xl border transition cursor-pointer ${
            settings.showHumanFigure
              ? 'bg-[#141414] text-white border-[#141414]'
              : 'bg-[#FAF9F5] text-[#717170] hover:text-[#141414] border-[#141414]/10'
          }`}
          title="Toggle Human Scale Reference Figure (5ft 6in)"
        >
          <Users className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onUpdateSettings({ showStudFraming: !settings.showStudFraming })}
          className={`p-1.5 rounded-xl border transition cursor-pointer ${
            settings.showStudFraming
              ? 'bg-[#141414] text-white border-[#141414]'
              : 'bg-[#FAF9F5] text-[#717170] hover:text-[#141414] border-[#141414]/10'
          }`}
          title="Toggle 2x4 Structural Stud Framing"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onUpdateSettings({ showGrid: !settings.showGrid })}
          className={`p-1.5 rounded-xl border transition cursor-pointer ${
            settings.showGrid
              ? 'bg-[#141414] text-white border-[#141414]'
              : 'bg-[#FAF9F5] text-[#717170] hover:text-[#141414] border-[#141414]/10'
          }`}
          title="Toggle Floor Coordinate Grid"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
