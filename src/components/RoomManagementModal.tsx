import React, { useState } from 'react';
import { HousePlan, HouseRoom, RoomType, MeasurementUnit } from '../types';
import { createDefaultRoomSpecs, createDefaultFurnitureForRoom } from '../utils/houseTemplates';
import { formatDimension } from '../utils/constants';
import {
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
  X,
  Home,
  Building2,
  RotateCw,
  Palette
} from 'lucide-react';

interface RoomManagementModalProps {
  house: HousePlan;
  activeRoomId: string;
  unit: MeasurementUnit;
  onUpdateHouse: (house: HousePlan) => void;
  onSelectRoom: (roomId: string) => void;
  onClose: () => void;
}

export const RoomManagementModal: React.FC<RoomManagementModalProps> = ({
  house,
  activeRoomId,
  unit,
  onUpdateHouse,
  onSelectRoom,
  onClose
}) => {
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('#0284C7');

  // New room creation state
  const [showAddSection, setShowAddSection] = useState(false);
  const [newRoomType, setNewRoomType] = useState<RoomType>('guest_bedroom');
  const [newRoomName, setNewRoomName] = useState('');
  const [newWidthFt, setNewWidthFt] = useState(12);
  const [newDepthFt, setNewDepthFt] = useState(14);
  const [newHeightFt, setNewHeightFt] = useState(10);
  const [newColorTag, setNewColorTag] = useState('#8B5CF6');

  const roomTypeOptions: { type: RoomType; label: string; icon: string }[] = [
    { type: 'living_room', label: 'Living Room', icon: '🛋️' },
    { type: 'master_bedroom', label: 'Primary Bedroom', icon: '👑' },
    { type: 'guest_bedroom', label: 'Guest Bedroom', icon: '🛏️' },
    { type: 'kids_room', label: 'Kids Bedroom', icon: '🧸' },
    { type: 'kitchen', label: 'Kitchen & Island', icon: '🍳' },
    { type: 'dining_room', label: 'Dining Room', icon: '🍷' },
    { type: 'prayer_room', label: 'Prayer Sanctuary', icon: '🕌' },
    { type: 'home_office', label: 'Home Office', icon: '💼' },
    { type: 'bathroom', label: 'Bathroom', icon: '🛁' },
    { type: 'balcony', label: 'Terrace Balcony', icon: '🌿' },
    { type: 'foyer', label: 'Entry Foyer', icon: '🚪' }
  ];

  const handleStartEdit = (room: HouseRoom) => {
    setEditingRoomId(room.id);
    setEditingName(room.name);
    setEditingColor(room.colorTag || '#0284C7');
  };

  const handleSaveEdit = (roomId: string) => {
    const updatedRooms = house.rooms.map((r) => {
      if (r.id === roomId) {
        return {
          ...r,
          name: editingName.trim() || r.name,
          colorTag: editingColor,
          specs: { ...r.specs, roomName: editingName.trim() || r.name }
        };
      }
      return r;
    });
    onUpdateHouse({ ...house, rooms: updatedRooms });
    setEditingRoomId(null);
  };

  const handleDuplicateRoom = (room: HouseRoom) => {
    const newRoom: HouseRoom = {
      ...JSON.parse(JSON.stringify(room)),
      id: `room-${Date.now()}`,
      name: `${room.name} (Copy)`,
      gridX: room.gridX + room.specs.width + 12,
      gridZ: room.gridZ
    };
    onUpdateHouse({ ...house, rooms: [...house.rooms, newRoom] });
    onSelectRoom(newRoom.id);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (house.rooms.length <= 1) {
      alert('Cannot delete the only remaining room in the house plan.');
      return;
    }
    const updatedRooms = house.rooms.filter((r) => r.id !== roomId);
    onUpdateHouse({ ...house, rooms: updatedRooms });
    if (activeRoomId === roomId) {
      onSelectRoom(updatedRooms[0].id);
    }
  };

  const handleCreateRoom = () => {
    const finalName = newRoomName.trim() || roomTypeOptions.find((t) => t.type === newRoomType)?.label || 'New Room';
    const specs = createDefaultRoomSpecs(newRoomType, finalName);
    specs.width = newWidthFt * 12;
    specs.depth = newDepthFt * 12;
    specs.height = newHeightFt * 12;

    const furniture = createDefaultFurnitureForRoom(newRoomType);

    // Place at next available spot
    let maxX = 0;
    house.rooms.forEach((r) => {
      if (r.gridX + r.specs.width > maxX) maxX = r.gridX + r.specs.width;
    });

    const newRoom: HouseRoom = {
      id: `room-${Date.now()}`,
      name: finalName,
      type: newRoomType,
      colorTag: newColorTag,
      gridX: maxX + 18,
      gridZ: 0,
      specs,
      furniture
    };

    onUpdateHouse({ ...house, rooms: [...house.rooms, newRoom] });
    onSelectRoom(newRoom.id);
    setShowAddSection(false);
    setNewRoomName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#FAF9F5] text-[#141414] w-full max-w-2xl max-h-[85vh] rounded-3xl border border-[#141414]/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141414]/10 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold tracking-tight text-[#141414]">
                Room Manager &amp; House Directory
              </h2>
              <p className="text-xs text-[#5A5A58] mt-0.5">
                {house.name} • {house.rooms.length} Configured Rooms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddSection(!showAddSection)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Room</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#EAE8E3] text-[#5A5A58] hover:text-[#141414] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* New Room Creator Section */}
        {showAddSection && (
          <div className="p-5 bg-white border-b border-[#141414]/10 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-[#141414]">Configure New Room</span>
              <button
                onClick={() => setShowAddSection(false)}
                className="text-xs text-[#717170] hover:text-[#141414]"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-[#5A5A58] mb-1 font-mono">Room Type</label>
                <select
                  value={newRoomType}
                  onChange={(e) => {
                    const t = e.target.value as RoomType;
                    setNewRoomType(t);
                    setNewRoomName(roomTypeOptions.find((opt) => opt.type === t)?.label || '');
                  }}
                  className="w-full p-2 bg-[#FAF9F5] border border-[#141414]/15 rounded-xl font-medium focus:outline-none"
                >
                  {roomTypeOptions.map((opt) => (
                    <option key={opt.type} value={opt.type}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#5A5A58] mb-1 font-mono">Custom Room Name</label>
                <input
                  type="text"
                  placeholder="e.g. Guest Suite, Nursery"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full p-2 bg-[#FAF9F5] border border-[#141414]/15 rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#5A5A58] mb-1 font-mono">Width &amp; Depth (Feet)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="8"
                    max="35"
                    value={newWidthFt}
                    onChange={(e) => setNewWidthFt(Number(e.target.value))}
                    className="w-1/2 p-2 bg-[#FAF9F5] border border-[#141414]/15 rounded-xl font-mono"
                  />
                  <span className="text-[#717170]">×</span>
                  <input
                    type="number"
                    min="8"
                    max="35"
                    value={newDepthFt}
                    onChange={(e) => setNewDepthFt(Number(e.target.value))}
                    className="w-1/2 p-2 bg-[#FAF9F5] border border-[#141414]/15 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#5A5A58] mb-1 font-mono">Ceiling Height (Feet)</label>
                <input
                  type="number"
                  min="8"
                  max="20"
                  value={newHeightFt}
                  onChange={(e) => setNewHeightFt(Number(e.target.value))}
                  className="w-full p-2 bg-[#FAF9F5] border border-[#141414]/15 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleCreateRoom}
                className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create &amp; Furnish Room</span>
              </button>
            </div>
          </div>
        )}

        {/* Existing Rooms List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {house.rooms.map((room) => {
            const isSelected = room.id === activeRoomId;
            const isEditing = editingRoomId === room.id;

            return (
              <div
                key={room.id}
                className={`p-3.5 rounded-2xl border transition flex flex-wrap items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-white border-[#0284C7] shadow-sm'
                    : 'bg-white/70 hover:bg-white border-[#141414]/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: room.colorTag || '#0284C7' }}
                  />
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-2 py-1 border border-[#0284C7] rounded-lg text-xs font-semibold"
                        autoFocus
                      />
                      <input
                        type="color"
                        value={editingColor}
                        onChange={(e) => setEditingColor(e.target.value)}
                        className="w-6 h-6 rounded border cursor-pointer"
                      />
                      <button
                        onClick={() => handleSaveEdit(room.id)}
                        className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#141414]">{room.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 bg-[#E0F2FE] text-[#0369A1] rounded text-[10px] font-mono">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#5A5A58] font-mono mt-0.5">
                        {formatDimension(room.specs.width, unit)} × {formatDimension(room.specs.depth, unit)} • {room.furniture.length} items
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {!isSelected && (
                    <button
                      onClick={() => onSelectRoom(room.id)}
                      className="px-2.5 py-1 bg-[#FAF9F5] hover:bg-[#EAE8E3] text-[#141414] rounded-lg text-xs font-medium border border-[#141414]/15 transition cursor-pointer"
                    >
                      Focus 3D
                    </button>
                  )}

                  <button
                    onClick={() => handleStartEdit(room)}
                    className="p-1.5 text-[#5A5A58] hover:text-[#141414] hover:bg-[#FAF9F5] rounded-lg transition cursor-pointer"
                    title="Rename room"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDuplicateRoom(room)}
                    className="p-1.5 text-[#5A5A58] hover:text-[#141414] hover:bg-[#FAF9F5] rounded-lg transition cursor-pointer"
                    title="Duplicate room"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    disabled={house.rooms.length <= 1}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      house.rooms.length <= 1
                        ? 'text-[#CCCCCC] cursor-not-allowed'
                        : 'text-red-500 hover:bg-red-50'
                    }`}
                    title="Delete room"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
