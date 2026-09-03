import React, { useState, useRef } from 'react';
import { HousePlan, HouseRoom, MeasurementUnit, RoomType } from '../types';
import { formatDimension } from '../utils/constants';
import {
  Plus,
  Trash2,
  Copy,
  Sliders,
  Sparkles,
  Maximize2,
  Move,
  Home,
  Compass,
  Download,
  Check,
  RotateCw,
  Pencil,
  MousePointer,
  Box,
  Layers,
  ArrowRight
} from 'lucide-react';
import { createDefaultRoomSpecs, createDefaultFurnitureForRoom } from '../utils/houseTemplates';

interface HouseMapDesigner2DProps {
  house: HousePlan;
  unit?: MeasurementUnit;
  onUpdateHouse: (house: HousePlan) => void;
  onSelectRoom: (roomId: string) => void;
  onOpenSuggestions?: () => void;
  activeRoomId?: string;
}

export const HouseMapDesigner2D: React.FC<HouseMapDesigner2DProps> = ({
  house,
  unit = 'imperial' as MeasurementUnit,
  onUpdateHouse,
  onSelectRoom,
  onOpenSuggestions,
  activeRoomId
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    activeRoomId || house.activeRoomId || (house.rooms[0]?.id || null)
  );

  React.useEffect(() => {
    if (activeRoomId) {
      setSelectedRoomId(activeRoomId);
    }
  }, [activeRoomId]);

  // Mode: Select & Move vs Draw Custom Room Lines
  const [designerMode, setDesignerMode] = useState<'select' | 'draw_lines'>('select');

  // Room dragging state
  const [draggingRoomId, setDraggingRoomId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; roomX: number; roomZ: number } | null>(null);

  // Wall resizing state for selected room
  const [resizingRoomId, setResizingRoomId] = useState<string | null>(null);
  const [resizeType, setResizeType] = useState<'width' | 'depth' | 'corner' | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    startX: number;
    startY: number;
    initWidth: number;
    initDepth: number;
  } | null>(null);

  // 2D Line Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStartWorld, setDrawStartWorld] = useState<{ x: number; z: number } | null>(null);
  const [drawCurrentWorld, setDrawCurrentWorld] = useState<{ x: number; z: number } | null>(null);

  // Pending room drawn from 2D lines to be converted to 3D
  const [pendingDrawnRoom, setPendingDrawnRoom] = useState<{
    x: number;
    z: number;
    width: number;
    depth: number;
  } | null>(null);
  const [drawnRoomType, setDrawnRoomType] = useState<RoomType>('master_bedroom');
  const [drawnRoomName, setDrawnRoomName] = useState('');
  const [drawnCeilingHeight, setDrawnCeilingHeight] = useState(120);
  const [drawnFloorMaterial, setDrawnFloorMaterial] = useState<'hardwood' | 'marble' | 'terrazzo' | 'carpet'>('hardwood');

  // Add Room modal (preset button)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomType, setNewRoomType] = useState<RoomType>('living_room');
  const [newRoomName, setNewRoomName] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedRoom = house.rooms.find((r) => r.id === selectedRoomId);

  // Compute bounding box of entire house
  let minX = 0, maxX = 300, minZ = 0, maxZ = 300;
  house.rooms.forEach((r) => {
    if (r.gridX < minX) minX = r.gridX;
    if (r.gridX + r.specs.width > maxX) maxX = r.gridX + r.specs.width;
    if (r.gridZ < minZ) minZ = r.gridZ;
    if (r.gridZ + r.specs.depth > maxZ) maxZ = r.gridZ + r.specs.depth;
  });

  const pad = 72;
  const boundW = Math.max(360, maxX - minX + pad * 2);
  const boundH = Math.max(280, maxZ - minZ + pad * 2);

  // Scale to fit canvas
  const canvasWidth = 720;
  const canvasHeight = 520;
  const scale = Math.min(canvasWidth / boundW, canvasHeight / boundH);

  const worldToScreenX = (wx: number) => (wx - minX + pad) * scale;
  const worldToScreenZ = (wz: number) => (wz - minZ + pad) * scale;
  const screenToWorldX = (sx: number) => (sx / scale) + minX - pad;
  const screenToWorldZ = (sz: number) => (sz / scale) + minZ - pad;

  // Total House Calculations
  const totalSqFt = house.rooms.reduce((acc, r) => acc + (r.specs.width * r.specs.depth) / 144, 0);
  const totalSqM = totalSqFt * 0.092903;

  // Canvas Mouse Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const worldX = screenToWorldX(clickX);
    const worldZ = screenToWorldZ(clickY);

    const snap = 6;
    const snapX = Math.round(worldX / snap) * snap;
    const snapZ = Math.round(worldZ / snap) * snap;

    if (designerMode === 'draw_lines') {
      setIsDrawing(true);
      setDrawStartWorld({ x: snapX, z: snapZ });
      setDrawCurrentWorld({ x: snapX, z: snapZ });
    }
  };

  const handleRoomMouseDown = (e: React.MouseEvent<SVGElement>, roomId: string) => {
    if (designerMode === 'draw_lines') return;
    e.stopPropagation();
    setSelectedRoomId(roomId);
    const room = house.rooms.find((r) => r.id === roomId);
    if (!room) return;

    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setDraggingRoomId(roomId);
    setDragStart({
      x: clickX,
      y: clickY,
      roomX: room.gridX,
      roomZ: room.gridZ
    });
  };

  const handleResizeHandleMouseDown = (
    e: React.MouseEvent<SVGElement>,
    roomId: string,
    type: 'width' | 'depth' | 'corner'
  ) => {
    e.stopPropagation();
    const room = house.rooms.find((r) => r.id === roomId);
    if (!room) return;

    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
    setResizingRoomId(roomId);
    setResizeType(type);
    setResizeStart({
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      initWidth: room.specs.width,
      initDepth: room.specs.depth
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    const curWorldX = screenToWorldX(curX);
    const curWorldZ = screenToWorldZ(curY);
    const snap = 6;
    const snappedWorldX = Math.round(curWorldX / snap) * snap;
    const snappedWorldZ = Math.round(curWorldZ / snap) * snap;

    // 1. Line Drawing Mode
    if (isDrawing && drawStartWorld) {
      setDrawCurrentWorld({ x: snappedWorldX, z: snappedWorldZ });
      return;
    }

    // 2. Wall Resizing Mode
    if (resizingRoomId && resizeStart && resizeType) {
      const deltaWorldX = (curX - resizeStart.startX) / scale;
      const deltaWorldZ = (curY - resizeStart.startY) / scale;

      const updatedRooms = house.rooms.map((r) => {
        if (r.id === resizingRoomId) {
          let newW = r.specs.width;
          let newD = r.specs.depth;

          if (resizeType === 'width' || resizeType === 'corner') {
            const rawW = resizeStart.initWidth + deltaWorldX;
            newW = Math.max(60, Math.min(600, Math.round(rawW / snap) * snap));
          }
          if (resizeType === 'depth' || resizeType === 'corner') {
            const rawD = resizeStart.initDepth + deltaWorldZ;
            newD = Math.max(60, Math.min(600, Math.round(rawD / snap) * snap));
          }
          return {
            ...r,
            specs: {
              ...r.specs,
              width: newW,
              depth: newD
            }
          };
        }
        return r;
      });

      onUpdateHouse({ ...house, rooms: updatedRooms });
      return;
    }

    // 3. Room Moving Mode
    if (draggingRoomId && dragStart) {
      const deltaWorldX = (curX - dragStart.x) / scale;
      const deltaWorldZ = (curY - dragStart.y) / scale;

      const rawX = dragStart.roomX + deltaWorldX;
      const rawZ = dragStart.roomZ + deltaWorldZ;
      const snappedX = Math.round(rawX / snap) * snap;
      const snappedZ = Math.round(rawZ / snap) * snap;

      const updatedRooms = house.rooms.map((r) => {
        if (r.id === draggingRoomId) {
          return { ...r, gridX: snappedX, gridZ: snappedZ };
        }
        return r;
      });

      onUpdateHouse({ ...house, rooms: updatedRooms });
    }
  };

  const handleMouseUp = () => {
    // Finish Line Drawing and open Convert to 3D prompt
    if (isDrawing && drawStartWorld && drawCurrentWorld) {
      setIsDrawing(false);
      const rawW = Math.abs(drawCurrentWorld.x - drawStartWorld.x);
      const rawD = Math.abs(drawCurrentWorld.z - drawStartWorld.z);
      const originX = Math.min(drawStartWorld.x, drawCurrentWorld.x);
      const originZ = Math.min(drawStartWorld.z, drawCurrentWorld.z);

      if (rawW >= 48 && rawD >= 48) {
        setPendingDrawnRoom({
          x: originX,
          z: originZ,
          width: rawW,
          depth: rawD
        });
        setDrawnRoomName(`Custom Room ${house.rooms.length + 1}`);
      }
      setDrawStartWorld(null);
      setDrawCurrentWorld(null);
    }

    setDraggingRoomId(null);
    setDragStart(null);
    setResizingRoomId(null);
    setResizeType(null);
    setResizeStart(null);
  };

  // Convert Drawn 2D Lines into Complete 3D Room Model
  const handleConvertDrawnRoomTo3D = () => {
    if (!pendingDrawnRoom) return;

    const defaultSpecs = createDefaultRoomSpecs(drawnRoomType, drawnRoomName || undefined);
    defaultSpecs.width = pendingDrawnRoom.width;
    defaultSpecs.depth = pendingDrawnRoom.depth;
    defaultSpecs.height = drawnCeilingHeight;
    defaultSpecs.floorMaterial = drawnFloorMaterial;
    defaultSpecs.doorOffsetLeft = Math.max(12, Math.round(pendingDrawnRoom.width / 2 - 18));

    const furniture = createDefaultFurnitureForRoom(drawnRoomType);

    const newRoom: HouseRoom = {
      id: `room-drawn-${Date.now()}`,
      name: drawnRoomName || defaultSpecs.roomName,
      type: drawnRoomType,
      colorTag: '#0284C7',
      gridX: pendingDrawnRoom.x,
      gridZ: pendingDrawnRoom.z,
      specs: defaultSpecs,
      furniture: furniture
    };

    onUpdateHouse({
      ...house,
      rooms: [...house.rooms, newRoom],
      activeRoomId: newRoom.id
    });
    setSelectedRoomId(newRoom.id);
    setPendingDrawnRoom(null);
    setDesignerMode('select');

    // Immediately switch to 3D focused view!
    onSelectRoom(newRoom.id);
  };

  const handleAddPresetRoom = () => {
    const defaultSpecs = createDefaultRoomSpecs(newRoomType, newRoomName || undefined);
    const furniture = createDefaultFurnitureForRoom(newRoomType);

    let newGridX = 0;
    let newGridZ = 0;
    if (selectedRoom) {
      newGridX = selectedRoom.gridX + selectedRoom.specs.width + 12;
      newGridZ = selectedRoom.gridZ;
    }

    const newRoom: HouseRoom = {
      id: `room-${Date.now()}`,
      name: newRoomName || defaultSpecs.roomName,
      type: newRoomType,
      colorTag: '#0284C7',
      gridX: newGridX,
      gridZ: newGridZ,
      specs: defaultSpecs,
      furniture: furniture
    };

    onUpdateHouse({
      ...house,
      rooms: [...house.rooms, newRoom],
      activeRoomId: newRoom.id
    });
    setSelectedRoomId(newRoom.id);
    setShowAddModal(false);
    setNewRoomName('');
  };

  const handleDeleteRoom = (roomId: string) => {
    if (house.rooms.length <= 1) return;
    const remaining = house.rooms.filter((r) => r.id !== roomId);
    onUpdateHouse({ ...house, rooms: remaining });
    setSelectedRoomId(remaining[0]?.id || null);
  };

  const handleDuplicateRoom = (roomId: string) => {
    const r = house.rooms.find((rm) => rm.id === roomId);
    if (!r) return;
    const dup: HouseRoom = {
      ...JSON.parse(JSON.stringify(r)),
      id: `room-dup-${Date.now()}`,
      name: `${r.name} (Copy)`,
      gridX: r.gridX + 24,
      gridZ: r.gridZ + 24
    };
    onUpdateHouse({ ...house, rooms: [...house.rooms, dup] });
    setSelectedRoomId(dup.id);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(house, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${house.name.toLowerCase().replace(/\s+/g, '_')}_floorplan.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Compute live drawn dimensions
  const liveDrawWidth = drawStartWorld && drawCurrentWorld ? Math.abs(drawCurrentWorld.x - drawStartWorld.x) : 0;
  const liveDrawDepth = drawStartWorld && drawCurrentWorld ? Math.abs(drawCurrentWorld.z - drawStartWorld.z) : 0;
  const liveDrawSqFt = Math.round((liveDrawWidth * liveDrawDepth) / 144);
  const liveDrawSqM = (liveDrawSqFt * 0.092903).toFixed(1);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#FAF9F5] text-[#141414] overflow-hidden">
      {/* 2D Interactive Canvas Area */}
      <div className="flex-1 flex flex-col p-3 sm:p-5 overflow-hidden">
        {/* Top Blueprint CAD Bar */}
        <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-[#141414]/10 gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold tracking-tight text-[#141414]">
                2D Floor Plan CAD Map &amp; Line Builder
              </h2>
              <p className="text-xs text-[#5A5A58]">
                {house.rooms.length} Rooms • Total {unit === 'metric' ? `${Math.round(totalSqM)} m²` : `${Math.round(totalSqFt)} sq ft`} • Drag walls to resize, or draw custom lines to build rooms
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mode Switcher: Pointer vs 2D Line Drawer */}
            <div className="flex bg-white p-1 rounded-xl border border-[#141414]/15 shadow-xs">
              <button
                onClick={() => setDesignerMode('select')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  designerMode === 'select'
                    ? 'bg-[#141414] text-white shadow-xs'
                    : 'text-[#5A5A58] hover:text-[#141414]'
                }`}
                title="Select rooms, drag to move, or drag wall edges to resize"
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span>Select &amp; Resize</span>
              </button>

              <button
                onClick={() => setDesignerMode('draw_lines')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  designerMode === 'draw_lines'
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'text-[#0284C7] hover:bg-[#E0F2FE]'
                }`}
                title="Click and drag anywhere on the grid to draw custom room wall lines"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Draw Room Lines</span>
              </button>
            </div>

            {onOpenSuggestions && (
              <button
                onClick={onOpenSuggestions}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#F59E0B]/40 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Suggestions</span>
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Room</span>
            </button>
          </div>
        </div>

        {/* Mode Banner Indicator */}
        {designerMode === 'draw_lines' && (
          <div className="mb-2 px-4 py-2 bg-[#E0F2FE] border border-[#7DD3FC] text-[#0369A1] rounded-xl text-xs flex items-center justify-between font-medium animate-in fade-in duration-150">
            <span className="flex items-center gap-2">
              <Pencil className="w-4 h-4 animate-pulse text-[#0284C7]" />
              <strong>2D Line Drafting Mode:</strong> Click and drag anywhere on the grid to draft custom room wall lines. Release to convert into a 3D room model!
            </span>
            <button
              onClick={() => setDesignerMode('select')}
              className="px-2.5 py-1 bg-white hover:bg-[#FAF9F5] text-[#0369A1] border border-[#7DD3FC] rounded-lg text-[11px] font-semibold cursor-pointer"
            >
              Exit Draw Mode
            </button>
          </div>
        )}

        {/* SVG Canvas */}
        <div className="flex-1 bg-white rounded-2xl border border-[#141414]/15 shadow-sm p-4 relative flex items-center justify-center overflow-hidden">
          <svg
            className={`w-full h-full select-none ${
              designerMode === 'draw_lines' ? 'cursor-crosshair' : 'cursor-default'
            }`}
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Grid Pattern */}
            <defs>
              <pattern id="cad-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#EAE8E3" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={canvasWidth} height={canvasHeight} fill="url(#cad-grid)" />

            {/* Existing Room Polygons */}
            {house.rooms.map((room) => {
              const rx = worldToScreenX(room.gridX);
              const rz = worldToScreenZ(room.gridZ);
              const rw = room.specs.width * scale;
              const rd = room.specs.depth * scale;
              const isSelected = room.id === selectedRoomId;

              // Color based on room type
              let fillColor = '#F1F5F9';
              let strokeColor = '#64748B';
              if (room.type === 'prayer_room') {
                fillColor = '#ECFDF5';
                strokeColor = '#059669';
              } else if (room.type === 'living_room') {
                fillColor = '#EFF6FF';
                strokeColor = '#0284C7';
              } else if (room.type === 'master_bedroom') {
                fillColor = '#FAF5FF';
                strokeColor = '#7C3AED';
              } else if (room.type === 'kitchen') {
                fillColor = '#FFFBEB';
                strokeColor = '#D97706';
              } else if (room.type === 'bathroom') {
                fillColor = '#ECFEFF';
                strokeColor = '#0891B2';
              } else if (room.type === 'home_office') {
                fillColor = '#F8FAFC';
                strokeColor = '#475569';
              }

              const sqFt = Math.round((room.specs.width * room.specs.depth) / 144);

              return (
                <g key={room.id} className="transition-opacity">
                  {/* Outer Wall Boundary */}
                  <rect
                    x={rx}
                    y={rz}
                    width={rw}
                    height={rd}
                    fill={fillColor}
                    stroke={isSelected ? '#0284C7' : strokeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    className="cursor-move"
                    onMouseDown={(e) => handleRoomMouseDown(e, room.id)}
                  />

                  {/* Inner Floor Pattern */}
                  <rect
                    x={rx + 4}
                    y={rz + 4}
                    width={Math.max(0, rw - 8)}
                    height={Math.max(0, rd - 8)}
                    fill="none"
                    stroke={isSelected ? '#0284C7' : '#CBD5E1'}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    className="pointer-events-none opacity-40"
                  />

                  {/* Door Opening Indicator */}
                  <rect
                    x={rx + (room.specs.doorOffsetLeft || 24) * scale}
                    y={rz - 3}
                    width={Math.max(12, (room.specs.doorWidth || 36) * scale)}
                    height={6}
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth={1.5}
                  />

                  {/* Window Opening Indicator */}
                  {room.specs.windowWall === 'left' && (
                    <rect
                      x={rx - 3}
                      y={rz + (room.specs.windowOffsetFront || 40) * scale}
                      width={6}
                      height={(room.specs.windowWidth || 48) * scale}
                      fill="#38BDF8"
                      stroke="#0284C7"
                      strokeWidth={1}
                    />
                  )}
                  {room.specs.windowWall === 'back' && (
                    <rect
                      x={rx + (room.specs.windowOffsetFront || 40) * scale}
                      y={rz + rd - 3}
                      width={(room.specs.windowWidth || 48) * scale}
                      height={6}
                      fill="#38BDF8"
                      stroke="#0284C7"
                      strokeWidth={1}
                    />
                  )}

                  {/* Room Label */}
                  <text
                    x={rx + rw / 2}
                    y={rz + rd / 2 - 6}
                    textAnchor="middle"
                    fill="#1E293B"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    className="pointer-events-none select-none"
                  >
                    {room.name}
                  </text>
                  <text
                    x={rx + rw / 2}
                    y={rz + rd / 2 + 10}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="9"
                    fontFamily="monospace"
                    className="pointer-events-none select-none"
                  >
                    {formatDimension(room.specs.width, unit)} × {formatDimension(room.specs.depth, unit)} ({sqFt} sq ft)
                  </text>

                  {/* Interactive Wall Resize Grips for Selected Room */}
                  {isSelected && designerMode === 'select' && (
                    <>
                      {/* Right Wall Edge Handle (Width) */}
                      <g
                        className="cursor-ew-resize"
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, room.id, 'width')}
                      >
                        <rect
                          x={rx + rw - 4}
                          y={rz + rd / 2 - 12}
                          width={8}
                          height={24}
                          rx={3}
                          fill="#0284C7"
                          stroke="#FFFFFF"
                          strokeWidth={1.5}
                        />
                      </g>

                      {/* Bottom Wall Edge Handle (Depth) */}
                      <g
                        className="cursor-ns-resize"
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, room.id, 'depth')}
                      >
                        <rect
                          x={rx + rw / 2 - 12}
                          y={rz + rd - 4}
                          width={24}
                          height={8}
                          rx={3}
                          fill="#0284C7"
                          stroke="#FFFFFF"
                          strokeWidth={1.5}
                        />
                      </g>

                      {/* Bottom-Right Corner Handle */}
                      <g
                        className="cursor-nwse-resize"
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, room.id, 'corner')}
                      >
                        <circle
                          cx={rx + rw}
                          cy={rz + rd}
                          r={6}
                          fill="#0284C7"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      </g>
                    </>
                  )}
                </g>
              );
            })}

            {/* Active CAD Line Drafting Box */}
            {isDrawing && drawStartWorld && drawCurrentWorld && (
              <g>
                {(() => {
                  const x1 = worldToScreenX(Math.min(drawStartWorld.x, drawCurrentWorld.x));
                  const z1 = worldToScreenZ(Math.min(drawStartWorld.z, drawCurrentWorld.z));
                  const boxW = Math.abs(drawCurrentWorld.x - drawStartWorld.x) * scale;
                  const boxD = Math.abs(drawCurrentWorld.z - drawStartWorld.z) * scale;

                  return (
                    <>
                      {/* Drafting Box Outline */}
                      <rect
                        x={x1}
                        y={z1}
                        width={boxW}
                        height={boxD}
                        fill="#0284C7"
                        fillOpacity={0.15}
                        stroke="#0284C7"
                        strokeWidth={2.5}
                        strokeDasharray="6 3"
                      />

                      {/* Corner Marks */}
                      <circle cx={x1} cy={z1} r={4} fill="#0284C7" />
                      <circle cx={x1 + boxW} cy={z1} r={4} fill="#0284C7" />
                      <circle cx={x1} cy={z1 + boxD} r={4} fill="#0284C7" />
                      <circle cx={x1 + boxW} cy={z1 + boxD} r={4} fill="#0284C7" />

                      {/* Top Dimension Annotation */}
                      <text
                        x={x1 + boxW / 2}
                        y={z1 - 8}
                        textAnchor="middle"
                        fill="#0284C7"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        Width: {formatDimension(liveDrawWidth, unit)}
                      </text>

                      {/* Left Dimension Annotation */}
                      <text
                        x={x1 - 8}
                        y={z1 + boxD / 2}
                        textAnchor="end"
                        alignmentBaseline="middle"
                        fill="#0284C7"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        Depth: {formatDimension(liveDrawDepth, unit)}
                      </text>

                      {/* Center Area Pill */}
                      {boxW > 60 && boxD > 40 && (
                        <text
                          x={x1 + boxW / 2}
                          y={z1 + boxD / 2}
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          fill="#0369A1"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {liveDrawSqFt} sq ft • Release to Convert
                        </text>
                      )}
                    </>
                  );
                })()}
              </g>
            )}
          </svg>

          {/* Canvas Floating Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-[#141414]/15 shadow-sm text-[11px] text-[#5A5A58] flex items-center gap-4 select-none">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#38BDF8] border border-[#0284C7]" /> Window
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-white border border-[#0284C7]" /> Doorway
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" /> Wall Resize Grip
            </span>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Selected Room Details & Tools */}
      <aside className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-[#141414]/15 flex flex-col h-auto lg:h-full p-4 sm:p-5 overflow-y-auto">
        {selectedRoom ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#141414]/10">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#0284C7] font-semibold bg-[#E0F2FE] px-2 py-0.5 rounded">
                  {selectedRoom.type.replace('_', ' ')}
                </span>
                <h3 className="text-base font-serif font-bold text-[#141414] mt-1">
                  {selectedRoom.name}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDuplicateRoom(selectedRoom.id)}
                  className="p-1.5 text-[#5A5A58] hover:text-[#141414] hover:bg-[#EAE8E3] rounded-lg transition"
                  title="Duplicate Room"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRoom(selectedRoom.id)}
                  disabled={house.rooms.length <= 1}
                  className="p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition disabled:opacity-30"
                  title="Delete Room"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Convert / Enter 3D Focused View Button */}
            <button
              onClick={() => onSelectRoom(selectedRoom.id)}
              className="w-full py-2.5 px-3 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Convert &amp; View in 3D Mode</span>
            </button>

            {/* Room Dimensions Steppers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5A58] font-mono">
                Room Dimensions
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#141414]/10">
                  <label className="text-[10px] uppercase font-mono text-[#717170]">Width (X)</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-xs font-bold">
                      {formatDimension(selectedRoom.specs.width, unit)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const updated = house.rooms.map((r) =>
                            r.id === selectedRoom.id
                              ? { ...r, specs: { ...r.specs, width: Math.max(72, r.specs.width - 12) } }
                              : r
                          );
                          onUpdateHouse({ ...house, rooms: updated });
                        }}
                        className="w-5 h-5 rounded bg-white border border-[#141414]/20 flex items-center justify-center text-xs font-bold hover:bg-[#EAE8E3]"
                      >
                        -
                      </button>
                      <button
                        onClick={() => {
                          const updated = house.rooms.map((r) =>
                            r.id === selectedRoom.id
                              ? { ...r, specs: { ...r.specs, width: Math.min(480, r.specs.width + 12) } }
                              : r
                          );
                          onUpdateHouse({ ...house, rooms: updated });
                        }}
                        className="w-5 h-5 rounded bg-white border border-[#141414]/20 flex items-center justify-center text-xs font-bold hover:bg-[#EAE8E3]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#141414]/10">
                  <label className="text-[10px] uppercase font-mono text-[#717170]">Depth (Z)</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-xs font-bold">
                      {formatDimension(selectedRoom.specs.depth, unit)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const updated = house.rooms.map((r) =>
                            r.id === selectedRoom.id
                              ? { ...r, specs: { ...r.specs, depth: Math.max(72, r.specs.depth - 12) } }
                              : r
                          );
                          onUpdateHouse({ ...house, rooms: updated });
                        }}
                        className="w-5 h-5 rounded bg-white border border-[#141414]/20 flex items-center justify-center text-xs font-bold hover:bg-[#EAE8E3]"
                      >
                        -
                      </button>
                      <button
                        onClick={() => {
                          const updated = house.rooms.map((r) =>
                            r.id === selectedRoom.id
                              ? { ...r, specs: { ...r.specs, depth: Math.min(480, r.specs.depth + 12) } }
                              : r
                          );
                          onUpdateHouse({ ...house, rooms: updated });
                        }}
                        className="w-5 h-5 rounded bg-white border border-[#141414]/20 flex items-center justify-center text-xs font-bold hover:bg-[#EAE8E3]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Furniture List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5A58] font-mono">
                  Furnishings &amp; Decor ({selectedRoom.furniture.length})
                </h4>
              </div>

              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {selectedRoom.furniture.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF9F5] rounded-lg border border-[#141414]/10 text-xs"
                  >
                    <span className="font-medium text-[#141414] truncate">{f.name}</span>
                    <input
                      type="checkbox"
                      checked={f.enabled}
                      onChange={(e) => {
                        const updated = house.rooms.map((r) => {
                          if (r.id === selectedRoom.id) {
                            return {
                              ...r,
                              furniture: r.furniture.map((item) =>
                                item.id === f.id ? { ...item, enabled: e.target.checked } : item
                              )
                            };
                          }
                          return r;
                        });
                        onUpdateHouse({ ...house, rooms: updated });
                      }}
                      className="rounded text-[#0284C7] focus:ring-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Export CAD */}
            <div className="pt-3 border-t border-[#141414]/10">
              <button
                onClick={handleExportJSON}
                className="w-full py-2 px-3 bg-[#EAE8E3] hover:bg-[#DDD9D2] text-[#141414] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-[#059669]" /> : <Download className="w-4 h-4" />}
                <span>{copied ? 'Downloaded Blueprint!' : 'Export House CAD (.json)'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-[#717170]">
            <Home className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">Select any room on the floorplan to view and edit its parameters.</p>
          </div>
        )}
      </aside>

      {/* MODAL: CONVERT 2D DRAWN LINES INTO 3D ROOM */}
      {pendingDrawnRoom && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#141414]/15 shadow-2xl p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150 text-[#141414]">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#141414]/10">
              <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] rounded-xl">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#141414]">
                  Convert 2D Lines into 3D Room
                </h3>
                <p className="text-xs text-[#5A5A58]">
                  Drawn: {formatDimension(pendingDrawnRoom.width, unit)} × {formatDimension(pendingDrawnRoom.depth, unit)} ({Math.round((pendingDrawnRoom.width * pendingDrawnRoom.depth) / 144)} sq ft)
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#5A5A58] block mb-1">Room Classification</label>
                <select
                  value={drawnRoomType}
                  onChange={(e) => {
                    const t = e.target.value as RoomType;
                    setDrawnRoomType(t);
                    setDrawnRoomName(t.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#141414]/15 font-medium"
                >
                  <option value="living_room">Grand Living Room / Majlis</option>
                  <option value="master_bedroom">Master Bedroom Suite</option>
                  <option value="kitchen">Chef's Gourmet Kitchen</option>
                  <option value="dining_room">Formal Dining Hall</option>
                  <option value="home_office">Executive Study / Library</option>
                  <option value="bathroom">Luxury Ensuite Bath</option>
                  <option value="prayer_room">Tranquil Musalla (Prayer Room)</option>
                  <option value="balcony">Sunroom / Terrace</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#5A5A58] block mb-1">Custom Room Name</label>
                <input
                  type="text"
                  value={drawnRoomName}
                  onChange={(e) => setDrawnRoomName(e.target.value)}
                  placeholder="e.g. Master Bedroom, Garden Studio..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#141414]/15 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#5A5A58] block mb-1">Ceiling Height</label>
                  <select
                    value={drawnCeilingHeight}
                    onChange={(e) => setDrawnCeilingHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#141414]/15 font-medium"
                  >
                    <option value={108}>9 ft (Standard)</option>
                    <option value={120}>10 ft (Spacious)</option>
                    <option value={144}>12 ft (Luxury High)</option>
                    <option value={168}>14 ft (Cathedral)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#5A5A58] block mb-1">Floor Material</label>
                  <select
                    value={drawnFloorMaterial}
                    onChange={(e) => setDrawnFloorMaterial(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#141414]/15 font-medium"
                  >
                    <option value="hardwood">Oak Hardwood</option>
                    <option value="marble">Carrara Marble</option>
                    <option value="terrazzo">Polished Terrazzo</option>
                    <option value="carpet">Plush Wool Carpet</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#141414]/10">
              <button
                onClick={() => setPendingDrawnRoom(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#5A5A58] hover:bg-[#EAE8E3] cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleConvertDrawnRoomTo3D}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>🔨 Convert 2D Lines to 3D &amp; Open</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standard Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#141414]/15 shadow-2xl p-6 max-w-md w-full space-y-4 text-[#141414]">
            <h3 className="text-base font-serif font-bold text-[#141414]">
              Add New Room to House
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#5A5A58]">Room Type</label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#141414]/15 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                >
                  <option value="living_room">Grand Living Room / Majlis</option>
                  <option value="prayer_room">Tranquil Musalla (Prayer Room)</option>
                  <option value="master_bedroom">Master Bedroom Suite</option>
                  <option value="kitchen">Chef's Gourmet Kitchen</option>
                  <option value="dining_room">Formal Dining Hall</option>
                  <option value="home_office">Executive Study &amp; Library</option>
                  <option value="bathroom">Luxury Ensuite Bath</option>
                  <option value="kids_room">Kids Bedroom</option>
                  <option value="balcony">Outdoor Garden Terrace</option>
                  <option value="foyer">Grand Entrance Foyer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5A5A58]">Custom Room Label (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Guest Suite, Family Lounge..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#141414]/15 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#141414]/10">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#5A5A58] hover:bg-[#EAE8E3]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPresetRoom}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-sm"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
