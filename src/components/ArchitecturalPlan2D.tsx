import React, { useState, useRef, useEffect } from 'react';
import { ViewSettings, LightingState, CameraPreset } from '../types';
import { ROOM_SPECS, formatDimension, ARCHITECTURAL_METRICS } from '../utils/constants';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Layers,
  ShieldCheck,
  Compass,
  RotateCcw,
  Sun,
  AlertTriangle,
  Move
} from 'lucide-react';

interface ArchitecturalPlan2DProps {
  settings: ViewSettings;
  lighting: LightingState;
  onUpdateSettings?: (settings: Partial<ViewSettings>) => void;
  onRetryWebGL?: () => void;
  webglErrorMessage?: string | null;
}

type ViewMode2D = 'plan' | 'sightline' | 'front_elevation' | 'left_elevation' | 'axonometric';

export const ArchitecturalPlan2D: React.FC<ArchitecturalPlan2DProps> = ({
  settings,
  lighting,
  onUpdateSettings,
  onRetryWebGL,
  webglErrorMessage
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeView, setActiveView] = useState<ViewMode2D>('plan');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync with Camera Preset if changed in top toolbar
  useEffect(() => {
    if (settings.cameraPreset === 'top_down') {
      setActiveView('plan');
    } else if (settings.cameraPreset === 'doorway_eye') {
      setActiveView('sightline');
    } else if (settings.cameraPreset === 'window_view') {
      setActiveView('left_elevation');
    } else if (settings.cameraPreset === 'partition_closeup') {
      setActiveView('front_elevation');
    } else if (settings.cameraPreset === 'isometric') {
      setActiveView('axonometric');
    }
  }, [settings.cameraPreset]);

  // Handle Canvas Resize and Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Clear background
    const isBlueprint = settings.renderMode === 'blueprint';
    ctx.fillStyle = isBlueprint ? '#0A111E' : '#E4E3E0';
    ctx.fillRect(0, 0, width, height);

    // Save initial state
    ctx.save();

    // Center origin with Pan & Zoom
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);

    // Render Grid
    renderGrid(ctx, width, height, isBlueprint);

    // Render Active CAD Projection
    if (activeView === 'plan' || activeView === 'sightline') {
      renderFloorPlan(ctx, settings, lighting, isBlueprint, activeView === 'sightline');
    } else if (activeView === 'front_elevation') {
      renderFrontElevation(ctx, settings, isBlueprint);
    } else if (activeView === 'left_elevation') {
      renderLeftElevation(ctx, settings, lighting, isBlueprint);
    } else if (activeView === 'axonometric') {
      renderAxonometricCAD(ctx, settings, lighting, isBlueprint);
    }

    ctx.restore();
  }, [activeView, zoom, pan, settings, lighting]);

  // Render Background Blueprint / Architectural Grid
  const renderGrid = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    isBlueprint: boolean
  ) => {
    const gridSize = 40;
    const range = 2000;

    ctx.save();
    ctx.strokeStyle = isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(20, 20, 20, 0.06)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = -range; x <= range; x += gridSize) {
      ctx.moveTo(x, -range);
      ctx.lineTo(x, range);
    }
    for (let y = -range; y <= range; y += gridSize) {
      ctx.moveTo(-range, y);
      ctx.lineTo(range, y);
    }
    ctx.stroke();
    ctx.restore();
  };

  // Render 2D Top-Down Floor Plan with Sightlines
  const renderFloorPlan = (
    ctx: CanvasRenderingContext2D,
    viewSettings: ViewSettings,
    lightingState: LightingState,
    isBlueprint: boolean,
    showSightlineRays: boolean
  ) => {
    const scale = 2.2; // pixels per inch
    const roomW = ROOM_SPECS.width * scale; // 148" -> ~325px
    const roomD = ROOM_SPECS.depth * scale; // 162" -> ~356px
    const wallThick = 12;

    const left = -roomW / 2;
    const top = -roomD / 2;
    const right = roomW / 2;
    const bottom = roomD / 2;

    const fgColor = isBlueprint ? '#E2E8F0' : '#141414';
    const accentColor = isBlueprint ? '#38BDF8' : '#0369A1';
    const wallFill = isBlueprint ? '#1E293B' : '#FFFFFF';
    const floorFill = isBlueprint ? '#0F172A' : '#FAF9F6';

    ctx.save();

    // 1. Floor Area
    ctx.fillStyle = floorFill;
    ctx.fillRect(left, top, roomW, roomD);

    // Floor Sub-grid (1 foot increments = 12 inches)
    ctx.strokeStyle = isBlueprint ? 'rgba(56, 189, 248, 0.12)' : 'rgba(20, 20, 20, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    for (let x = left + 12 * scale; x < right; x += 12 * scale) {
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }
    for (let y = top + 12 * scale; y < bottom; y += 12 * scale) {
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 2. Sunlight Cone through left window
    const sunAngle = ((lightingState.timeOfDay - 6) / 12) * Math.PI;
    if (lightingState.timeOfDay >= 6 && lightingState.timeOfDay <= 18) {
      const winTop = top + ROOM_SPECS.windowOffsetFront * scale;
      const winBottom = winTop + ROOM_SPECS.windowWidth * scale;

      const sunDirX = Math.sin(sunAngle) * 200;
      const sunDirY = -Math.cos(sunAngle) * 80;

      ctx.save();
      ctx.fillStyle = isBlueprint
        ? 'rgba(251, 191, 36, 0.15)'
        : 'rgba(245, 158, 11, 0.12)';
      ctx.beginPath();
      ctx.moveTo(left, winTop);
      ctx.lineTo(left, winBottom);
      ctx.lineTo(left + sunDirX, winBottom + sunDirY);
      ctx.lineTo(left + sunDirX, winTop + sunDirY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 3. Walls (Thick Architectural CAD Contours)
    ctx.fillStyle = wallFill;
    ctx.strokeStyle = fgColor;
    ctx.lineWidth = 2.5;

    // Back / Qibla Wall (Top: Z = 162")
    ctx.fillRect(left - wallThick, top - wallThick, roomW + wallThick * 2, wallThick);
    ctx.strokeRect(left - wallThick, top - wallThick, roomW + wallThick * 2, wallThick);

    // Right Wall (Right: X = 148")
    ctx.fillRect(right, top - wallThick, wallThick, roomD + wallThick * 2);
    ctx.strokeRect(right, top - wallThick, wallThick, roomD + wallThick * 2);

    // Left Wall (Window Wall: X = 0)
    const winStart = top + ROOM_SPECS.windowOffsetFront * scale;
    const winEnd = winStart + ROOM_SPECS.windowWidth * scale;

    // Left solid front segment (3' 8.5")
    ctx.fillRect(left - wallThick, top - wallThick, wallThick, winStart - top + wallThick);
    ctx.strokeRect(left - wallThick, top - wallThick, wallThick, winStart - top + wallThick);

    // Left window opening (6' 1")
    ctx.save();
    ctx.fillStyle = isBlueprint ? 'rgba(56, 189, 248, 0.3)' : 'rgba(3, 105, 161, 0.15)';
    ctx.fillRect(left - wallThick, winStart, wallThick, winEnd - winStart);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(left - wallThick, winStart, wallThick, winEnd - winStart);
    // Double glass line
    ctx.beginPath();
    ctx.moveTo(left - wallThick / 2, winStart);
    ctx.lineTo(left - wallThick / 2, winEnd);
    ctx.stroke();
    ctx.restore();

    // Left solid back segment (3' 8.5")
    ctx.fillRect(left - wallThick, winEnd, wallThick, bottom - winEnd + wallThick);
    ctx.strokeRect(left - wallThick, winEnd, wallThick, bottom - winEnd + wallThick);

    // Front Wall (Entrance: Z = 0)
    const doorStart = left + ROOM_SPECS.doorOffsetLeft * scale;
    const doorEnd = doorStart + ROOM_SPECS.doorWidth * scale;

    // Left front solid segment (3' 10" / 46")
    ctx.fillRect(left - wallThick, bottom, doorStart - left + wallThick, wallThick);
    ctx.strokeRect(left - wallThick, bottom, doorStart - left + wallThick, wallThick);

    // Doorway opening (3' 10" / 46")
    ctx.save();
    // Door swing arc
    ctx.strokeStyle = isBlueprint ? 'rgba(56, 189, 248, 0.6)' : 'rgba(20, 20, 20, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(doorStart, bottom, ROOM_SPECS.doorWidth * scale, -Math.PI / 2, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Open Door Leaf
    ctx.strokeStyle = fgColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(doorStart, bottom);
    ctx.lineTo(doorStart, bottom - ROOM_SPECS.doorWidth * scale);
    ctx.stroke();
    ctx.restore();

    // Right front solid segment (4' 8" / 56")
    ctx.fillRect(doorEnd, bottom, right - doorEnd + wallThick, wallThick);
    ctx.strokeRect(doorEnd, bottom, right - doorEnd + wallThick, wallThick);

    // 4. Structural Privacy Partition (Wing Wall: 3'6" deep × 5" thick starting at 7'8" mark)
    const partX = doorEnd; // 7' 8" from left corner
    const partDepth = ROOM_SPECS.partitionDepth * scale;
    const partThick = ROOM_SPECS.partitionThickness * scale;

    ctx.save();
    ctx.fillStyle = isBlueprint ? '#0284C7' : '#0369A1';
    ctx.strokeStyle = fgColor;
    ctx.lineWidth = 2;
    ctx.fillRect(partX - partThick / 2, bottom - partDepth, partThick, partDepth);
    ctx.strokeRect(partX - partThick / 2, bottom - partDepth, partThick, partDepth);

    // Stud framing indicators on partition
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('3\'6" WING', partX + 26, bottom - partDepth / 2);
    ctx.restore();

    // 5. Sightline Analysis Simulation (Raycasting Rays)
    if (showSightlineRays || viewSettings.showSightlines) {
      const observerY = bottom + 35; // Standing outside doorway
      const observerX = doorStart + (ROOM_SPECS.doorWidth * scale) / 2;

      // Draw Observer Avatar
      ctx.save();
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(observerX, observerY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillStyle = fgColor;
      ctx.textAlign = 'center';
      ctx.fillText('5\'6" Observer Eye', observerX, observerY + 20);

      // Cast Sightline Rays across the room
      const numRays = 18;
      for (let i = 0; i <= numRays; i++) {
        const targetX = left + (roomW / numRays) * i;
        const targetY = top + 20;

        // Check if ray intersects the 3'6" partition (from partX, bottom to partX, bottom - partDepth)
        const isBlocked = targetX > partX - 10 && targetX < right;

        ctx.beginPath();
        ctx.moveTo(observerX, observerY);

        if (isBlocked) {
          // Blocked ray hits partition
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.lineWidth = 1.5;
          ctx.lineTo(partX, bottom - (partDepth * (targetX - partX)) / (right - partX));
          ctx.stroke();

          // Red intersection dot
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(partX, bottom - partDepth * 0.7, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Clear sightline ray
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
          ctx.lineWidth = 1.2;
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // 6. Architectural Dimension Annotations
    if (viewSettings.showDimensions) {
      ctx.save();
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = isBlueprint ? '#38BDF8' : '#0369A1';
      ctx.strokeStyle = isBlueprint ? '#38BDF8' : '#0369A1';
      ctx.lineWidth = 1;

      // Overall Width (Bottom: 12' 4")
      drawDimensionLine(
        ctx,
        left,
        bottom + 45,
        right,
        bottom + 45,
        formatDimension(ROOM_SPECS.width, viewSettings.unit)
      );

      // Overall Depth (Right: 13' 6")
      drawDimensionLine(
        ctx,
        right + 35,
        bottom,
        right + 35,
        top,
        formatDimension(ROOM_SPECS.depth, viewSettings.unit)
      );

      // Door specs (Bottom detail)
      drawDimensionLine(
        ctx,
        left,
        bottom + 22,
        doorStart,
        bottom + 22,
        formatDimension(ROOM_SPECS.doorOffsetLeft, viewSettings.unit)
      );
      drawDimensionLine(
        ctx,
        doorStart,
        bottom + 22,
        doorEnd,
        bottom + 22,
        formatDimension(ROOM_SPECS.doorWidth, viewSettings.unit)
      );
      drawDimensionLine(
        ctx,
        doorEnd,
        bottom + 22,
        right,
        bottom + 22,
        formatDimension(ROOM_SPECS.doorRemainingRight, viewSettings.unit)
      );

      // Window specs (Left detail)
      drawDimensionLine(
        ctx,
        left - 30,
        top,
        left - 30,
        winStart,
        formatDimension(ROOM_SPECS.windowOffsetFront, viewSettings.unit)
      );
      drawDimensionLine(
        ctx,
        left - 30,
        winStart,
        left - 30,
        winEnd,
        formatDimension(ROOM_SPECS.windowWidth, viewSettings.unit)
      );
      drawDimensionLine(
        ctx,
        left - 30,
        winEnd,
        left - 30,
        bottom,
        formatDimension(ROOM_SPECS.windowOffsetBack, viewSettings.unit)
      );

      ctx.restore();
    }

    // Room Label & Compass
    ctx.save();
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = fgColor;
    ctx.textAlign = 'center';
    ctx.fillText('MAIN ROOM INTERIOR', 0, -10);

    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = isBlueprint ? '#94A3B8' : '#717170';
    ctx.fillText(
      `${formatDimension(ROOM_SPECS.depth, viewSettings.unit)} × ${formatDimension(
        ROOM_SPECS.width,
        viewSettings.unit
      )} • 12'0" Ceiling`,
      0,
      8
    );

    // Qibla Direction Arrow (Pointing North/Back wall)
    ctx.strokeStyle = '#10B981';
    ctx.fillStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, top + 35);
    ctx.lineTo(0, top + 15);
    ctx.lineTo(-5, top + 22);
    ctx.moveTo(0, top + 15);
    ctx.lineTo(5, top + 22);
    ctx.stroke();
    ctx.fillText('QIBLA WALL', 0, top + 48);

    ctx.restore();

    ctx.restore();
  };

  // Render Front Entrance Wall Elevation (Door + Partition)
  const renderFrontElevation = (
    ctx: CanvasRenderingContext2D,
    viewSettings: ViewSettings,
    isBlueprint: boolean
  ) => {
    const scale = 2.2;
    const roomW = ROOM_SPECS.width * scale; // 148"
    const roomH = ROOM_SPECS.height * scale; // 144" (12' 0")

    const left = -roomW / 2;
    const bottom = roomH / 2;
    const top = -roomH / 2;
    const right = roomW / 2;

    const fgColor = isBlueprint ? '#E2E8F0' : '#141414';
    const accentColor = isBlueprint ? '#38BDF8' : '#0369A1';
    const fill = isBlueprint ? '#1E293B' : '#FFFFFF';

    ctx.save();

    // Wall Shell
    ctx.fillStyle = fill;
    ctx.strokeStyle = fgColor;
    ctx.lineWidth = 2.5;
    ctx.fillRect(left, top, roomW, roomH);
    ctx.strokeRect(left, top, roomW, roomH);

    // Door Opening (3' 10" × 6' 8" = 46" × 80")
    const doorX = left + ROOM_SPECS.doorOffsetLeft * scale;
    const doorW = ROOM_SPECS.doorWidth * scale;
    const doorH = ROOM_SPECS.doorHeight * scale;
    const doorY = bottom - doorH;

    ctx.fillStyle = isBlueprint ? '#0F172A' : '#EAE8E3';
    ctx.fillRect(doorX, doorY, doorW, doorH);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(doorX, doorY, doorW, doorH);

    // Privacy Partition (Side Profile projecting inward: 7'0" high × 3'6" deep)
    const partH = ROOM_SPECS.partitionHeight * scale; // 84"
    const partY = bottom - partH;
    const partX = doorX + doorW;

    ctx.fillStyle = isBlueprint ? 'rgba(56, 189, 248, 0.4)' : 'rgba(3, 105, 161, 0.25)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.fillRect(partX, partY, 20, partH);
    ctx.strokeRect(partX, partY, 20, partH);

    // Open overhead clearance marker (5' 0" to 12' ceiling)
    ctx.strokeStyle = '#EAB308';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(partX + 10, top);
    ctx.lineTo(partX + 10, partY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#EAB308';
    ctx.fillText('5\'0" Overhead Open', partX + 25, top + (partY - top) / 2);

    // 5'6" Human Eye Level Reference Line
    const eyeY = bottom - 66 * scale;
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(left - 20, eyeY);
    ctx.lineTo(right + 20, eyeY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.fillText('5\'6" Human Eye Level (Blocked by 7\'0" Partition)', left + 10, eyeY - 6);

    // Dimensions
    if (viewSettings.showDimensions) {
      drawDimensionLine(ctx, left, bottom + 25, right, bottom + 25, `Width: ${formatDimension(ROOM_SPECS.width, viewSettings.unit)}`);
      drawDimensionLine(ctx, right + 25, bottom, right + 25, top, `Ceiling: ${formatDimension(ROOM_SPECS.height, viewSettings.unit)}`);
      drawDimensionLine(ctx, doorX, doorY, doorX + doorW, doorY, `Door: ${formatDimension(ROOM_SPECS.doorWidth, viewSettings.unit)}`);
      drawDimensionLine(ctx, partX - 15, bottom, partX - 15, partY, `Partition: 7'0" (84")`);
    }

    ctx.font = 'bold 13px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = fgColor;
    ctx.textAlign = 'center';
    ctx.fillText('FRONT ENTRANCE WALL ELEVATION', 0, top - 20);

    ctx.restore();
  };

  // Render Left Wall Elevation (Window Wall: 6'1" × 4'1", 5'3" Sill)
  const renderLeftElevation = (
    ctx: CanvasRenderingContext2D,
    viewSettings: ViewSettings,
    lightingState: LightingState,
    isBlueprint: boolean
  ) => {
    const scale = 2.2;
    const roomD = ROOM_SPECS.depth * scale; // 162"
    const roomH = ROOM_SPECS.height * scale; // 144"

    const left = -roomD / 2;
    const bottom = roomH / 2;
    const top = -roomH / 2;
    const right = roomD / 2;

    const fgColor = isBlueprint ? '#E2E8F0' : '#141414';
    const accentColor = isBlueprint ? '#38BDF8' : '#0369A1';
    const fill = isBlueprint ? '#1E293B' : '#FFFFFF';

    ctx.save();

    // Wall Shell
    ctx.fillStyle = fill;
    ctx.strokeStyle = fgColor;
    ctx.lineWidth = 2.5;
    ctx.fillRect(left, top, roomD, roomH);
    ctx.strokeRect(left, top, roomD, roomH);

    // Window Opening (6' 1" wide × 4' 1" tall, 5' 3" sill)
    const winX = left + ROOM_SPECS.windowOffsetFront * scale;
    const winW = ROOM_SPECS.windowWidth * scale; // 73"
    const winH = ROOM_SPECS.windowHeight * scale; // 49"
    const sillH = ROOM_SPECS.windowSillHeight * scale; // 63"
    const winY = bottom - sillH - winH;

    ctx.fillStyle = isBlueprint ? 'rgba(56, 189, 248, 0.25)' : 'rgba(3, 105, 161, 0.15)';
    ctx.fillRect(winX, winY, winW, winH);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(winX, winY, winW, winH);

    // Window Mullions (Architectural Glass Panes)
    ctx.beginPath();
    ctx.moveTo(winX + winW / 2, winY);
    ctx.lineTo(winX + winW / 2, winY + winH);
    ctx.stroke();

    // Sunlight Rays streaming down
    if (lightingState.timeOfDay >= 6 && lightingState.timeOfDay <= 18) {
      ctx.fillStyle = isBlueprint ? 'rgba(251, 191, 36, 0.15)' : 'rgba(245, 158, 11, 0.15)';
      ctx.beginPath();
      ctx.moveTo(winX, winY);
      ctx.lineTo(winX + winW, winY);
      ctx.lineTo(winX + winW + 40, bottom);
      ctx.lineTo(winX - 40, bottom);
      ctx.closePath();
      ctx.fill();
    }

    // Sill Height Marker
    ctx.strokeStyle = '#F59E0B';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(left, bottom - sillH);
    ctx.lineTo(right, bottom - sillH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#F59E0B';
    ctx.fillText('Sill Line: 5\'3" (63") above floor', left + 10, bottom - sillH - 6);

    // Dimensions
    if (viewSettings.showDimensions) {
      drawDimensionLine(ctx, left, bottom + 25, right, bottom + 25, `Depth: ${formatDimension(ROOM_SPECS.depth, viewSettings.unit)}`);
      drawDimensionLine(ctx, right + 25, bottom, right + 25, top, `Ceiling: ${formatDimension(ROOM_SPECS.height, viewSettings.unit)}`);
      drawDimensionLine(ctx, winX, winY - 15, winX + winW, winY - 15, `Window: ${formatDimension(ROOM_SPECS.windowWidth, viewSettings.unit)}`);
      drawDimensionLine(ctx, winX - 15, bottom - sillH, winX - 15, winY, `Height: ${formatDimension(ROOM_SPECS.windowHeight, viewSettings.unit)}`);
    }

    ctx.font = 'bold 13px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = fgColor;
    ctx.textAlign = 'center';
    ctx.fillText('LEFT WALL ELEVATION (CENTERED WINDOW)', 0, top - 20);

    ctx.restore();
  };

  // Render 2.5D Isometric Axonometric CAD Wireframe
  const renderAxonometricCAD = (
    ctx: CanvasRenderingContext2D,
    viewSettings: ViewSettings,
    lightingState: LightingState,
    isBlueprint: boolean
  ) => {
    const scale = 1.4;
    const W = ROOM_SPECS.width * scale;
    const D = ROOM_SPECS.depth * scale;
    const H = ROOM_SPECS.height * scale;

    const cos30 = Math.cos(Math.PI / 6);
    const sin30 = Math.sin(Math.PI / 6);

    // Project 3D point (x, y, z) to 2D isometric screen coordinates
    const project = (x: number, y: number, z: number) => {
      const screenX = (x - z) * cos30;
      const screenY = (x + z) * sin30 - y;
      return { x: screenX, y: screenY + 40 };
    };

    const fgColor = isBlueprint ? '#38BDF8' : '#141414';
    const floorColor = isBlueprint ? 'rgba(15, 23, 42, 0.9)' : '#FAF9F6';
    const wallColor = isBlueprint ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.9)';

    ctx.save();

    // 1. Floor
    const p0 = project(0, 0, 0);
    const pW = project(W, 0, 0);
    const pWD = project(W, 0, D);
    const pD = project(0, 0, D);

    ctx.fillStyle = floorColor;
    ctx.strokeStyle = fgColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(pW.x, pW.y);
    ctx.lineTo(pWD.x, pWD.y);
    ctx.lineTo(pD.x, pD.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Qibla Back Wall (Z = D)
    const pD_top = project(0, H, D);
    const pWD_top = project(W, H, D);

    ctx.fillStyle = wallColor;
    ctx.beginPath();
    ctx.moveTo(pD.x, pD.y);
    ctx.lineTo(pWD.x, pWD.y);
    ctx.lineTo(pWD_top.x, pWD_top.y);
    ctx.lineTo(pD_top.x, pD_top.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Right Solid Wall (X = W)
    const pW_top = project(W, H, 0);
    ctx.beginPath();
    ctx.moveTo(pW.x, pW.y);
    ctx.lineTo(pWD.x, pWD.y);
    ctx.lineTo(pWD_top.x, pWD_top.y);
    ctx.lineTo(pW_top.x, pW_top.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. Left Wall with Window Cutout (X = 0)
    const p0_top = project(0, H, 0);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(pD.x, pD.y);
    ctx.lineTo(pD_top.x, pD_top.y);
    ctx.lineTo(p0_top.x, p0_top.y);
    ctx.closePath();
    ctx.stroke();

    // Window Hole on Left Wall
    const winZ1 = ROOM_SPECS.windowOffsetFront * scale;
    const winZ2 = winZ1 + ROOM_SPECS.windowWidth * scale;
    const winY1 = ROOM_SPECS.windowSillHeight * scale;
    const winY2 = winY1 + ROOM_SPECS.windowHeight * scale;

    const wp1 = project(0, winY1, winZ1);
    const wp2 = project(0, winY1, winZ2);
    const wp3 = project(0, winY2, winZ2);
    const wp4 = project(0, winY2, winZ1);

    ctx.fillStyle = isBlueprint ? 'rgba(56, 189, 248, 0.4)' : 'rgba(3, 105, 161, 0.3)';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wp1.x, wp1.y);
    ctx.lineTo(wp2.x, wp2.y);
    ctx.lineTo(wp3.x, wp3.y);
    ctx.lineTo(wp4.x, wp4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 5. Doorway Opening on Front Wall (Z = 0)
    const doorX1 = ROOM_SPECS.doorOffsetLeft * scale;
    const doorX2 = doorX1 + ROOM_SPECS.doorWidth * scale;
    const doorH = ROOM_SPECS.doorHeight * scale;

    const dp1 = project(doorX1, 0, 0);
    const dp2 = project(doorX2, 0, 0);
    const dp3 = project(doorX2, doorH, 0);
    const dp4 = project(doorX1, doorH, 0);

    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dp1.x, dp1.y);
    ctx.lineTo(dp2.x, dp2.y);
    ctx.lineTo(dp3.x, dp3.y);
    ctx.lineTo(dp4.x, dp4.y);
    ctx.stroke();

    // 6. Privacy Partition (3'6" deep × 7'0" high at X = 7'8")
    const partX = doorX2;
    const partDepth = ROOM_SPECS.partitionDepth * scale;
    const partH = ROOM_SPECS.partitionHeight * scale;

    const pp1 = project(partX, 0, 0);
    const pp2 = project(partX, 0, partDepth);
    const pp3 = project(partX, partH, partDepth);
    const pp4 = project(partX, partH, 0);

    ctx.fillStyle = isBlueprint ? 'rgba(2, 132, 199, 0.6)' : 'rgba(3, 105, 161, 0.4)';
    ctx.strokeStyle = fgColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pp1.x, pp1.y);
    ctx.lineTo(pp2.x, pp2.y);
    ctx.lineTo(pp3.x, pp3.y);
    ctx.lineTo(pp4.x, pp4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = fgColor;
    ctx.textAlign = 'center';
    ctx.fillText('3D ISOMETRIC AXONOMETRIC CAD SHELL', 0, -H * 0.7 - 20);

    ctx.restore();
  };

  // Helper to draw CAD dimension lines with arrows
  const drawDimensionLine = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    text: string
  ) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrows
    const arrowSize = 4;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowSize * Math.cos(angle + Math.PI / 4), y1 + arrowSize * Math.sin(angle + Math.PI / 4));
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowSize * Math.cos(angle - Math.PI / 4), y1 + arrowSize * Math.sin(angle - Math.PI / 4));

    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI / 4), y2 - arrowSize * Math.sin(angle + Math.PI / 4));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI / 4), y2 - arrowSize * Math.sin(angle - Math.PI / 4));
    ctx.stroke();

    // Dimension text
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, midX, midY - 6);
  };

  // Mouse / Touch Interaction for Pan and Zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.4, Math.min(3.5, prev * zoomFactor)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#E4E3E0]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

      {/* Top Banner: WebGL Hardware Disabled Notification + Active CAD Mode */}
      <div className="absolute top-20 left-4 right-4 z-20 pointer-events-none flex flex-col sm:flex-row items-center justify-between gap-2 max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#141414]/15 shadow-sm flex items-center gap-2.5 pointer-events-auto text-xs text-[#141414]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="font-serif font-bold">Interactive Architectural CAD Plan</span>
          <span className="text-[10px] font-mono uppercase bg-[#EAE8E3] px-2 py-0.5 rounded text-[#5A5A58]">
            1:1 Scale Precision
          </span>
        </div>

        {onRetryWebGL && (
          <button
            onClick={onRetryWebGL}
            className="bg-[#141414] hover:bg-[#2B2A27] text-white px-3.5 py-2 rounded-2xl border border-[#141414] shadow-sm text-xs font-mono font-medium flex items-center gap-2 pointer-events-auto transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry 3D WebGL</span>
          </button>
        )}
      </div>

      {/* CAD Projection View Selector Tabs (Bottom Left Bento Pill) */}
      <div className="absolute bottom-16 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#141414]/15 shadow-sm">
        {[
          { id: 'plan', label: '2D Floor Plan', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'sightline', label: 'Sightline Raycast', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          { id: 'front_elevation', label: 'Front Elevation', icon: <Eye className="w-3.5 h-3.5" /> },
          { id: 'left_elevation', label: 'Window Elevation', icon: <Sun className="w-3.5 h-3.5" /> },
          { id: 'axonometric', label: '3D Axonometric', icon: <Compass className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as ViewMode2D)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeView === tab.id
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-[#F0EFEB] hover:bg-[#E4E3E0] text-[#5A5A58] hover:text-[#141414]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Zoom / Pan Navigation Controls (Bottom Right Floating Pill) */}
      <div className="absolute bottom-16 right-4 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#141414]/15 shadow-sm">
        <button
          onClick={() => setZoom((z) => Math.min(3.5, z * 1.2))}
          className="p-2 rounded-xl bg-[#F0EFEB] hover:bg-[#E4E3E0] text-[#141414] transition cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z / 1.2))}
          className="p-2 rounded-xl bg-[#F0EFEB] hover:bg-[#E4E3E0] text-[#141414] transition cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-2 rounded-xl bg-[#F0EFEB] hover:bg-[#E4E3E0] text-[#141414] transition cursor-pointer"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
