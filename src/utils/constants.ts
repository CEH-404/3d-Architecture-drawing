import { RoomDimensions } from '../types';

// Default Shell Measurements in inches
export const ROOM_SPECS: RoomDimensions = {
  roomName: "Architectural Raw Shell",
  // Shell Dimensions
  width: 148,             // 12' 4" (12.333 ft) -> 3.759 m
  depth: 162,             // 13' 6" (13.5 ft)   -> 4.115 m
  height: 144,            // 12' 0" (12.0 ft)   -> 3.658 m
  
  // Door specs (Front Entrance wall)
  doorWidth: 46,          // 3' 10" -> 1.168 m
  doorHeight: 80,         // 6' 8"  -> 2.032 m
  doorOffsetLeft: 46,     // 3' 10" from left corner
  doorRemainingRight: 56, // 4' 8" to right corner (148 - 46 - 46 = 56)
  doorType: 'single_swing',
  doorOpenAngle: 45,
  doorHinge: 'right',
  
  // Window specs (Left Wall default)
  windowWall: 'left',
  windowWidth: 73,        // 6' 1"  -> 1.854 m
  windowHeight: 49,       // 4' 1"  -> 1.245 m
  windowSillHeight: 63,   // 5' 3"  -> 1.600 m
  windowOffsetFront: 44.5,// 3' 8.5" -> 1.130 m (162 - 73) / 2 = 44.5"
  windowOffsetBack: 44.5, // 3' 8.5" -> 1.130 m
  windowMullions: 'single_vertical',
  
  // Partition specs (Wing Privacy Wall)
  partitionDepth: 42,     // 3' 6"  -> 1.067 m
  partitionHeight: 84,    // 7' 0"  -> 2.134 m (leaves 60" / 5'0" clear overhead to 12' ceiling)
  partitionThickness: 5,  // 5" stud wall -> 0.127 m
  partitionPositionX: 92, // 7' 8" mark (46" + 46" = 92" from left corner)
  partitionAttachedTo: 'door_edge_wing',
  partitionStyle: 'drywall',
  
  // Finishes
  wallColor: '#F5F5F3',
  floorMaterial: 'concrete',
  
  // Interior Elements
  showPrayerMat: false,
  prayerMatCount: 1,
  prayerMatPattern: 'classic_emerald',
  showEntryBench: false,
  showBookshelf: false,
  showIndoorPlant: false,
  showPendantLight: false,
  showWallArt: false
};

export const DEFAULT_ROOM_SPECS = ROOM_SPECS;


export const DESIGN_PRESETS: { id: string; name: string; description: string; specs: Partial<RoomDimensions> }[] = [
  {
    id: 'default_raw',
    name: "Architectural Raw Shell",
    description: "Standard 13'6\" × 12'4\" × 12'0\" bare drywall shell with 3'6\" privacy wing wall at door edge.",
    specs: {
      roomName: "Architectural Raw Shell",
      width: 148,
      depth: 162,
      height: 144,
      doorWidth: 46,
      doorHeight: 80,
      doorOffsetLeft: 46,
      doorRemainingRight: 56,
      doorType: 'single_swing',
      doorOpenAngle: 45,
      windowWall: 'left',
      windowWidth: 73,
      windowHeight: 49,
      windowSillHeight: 63,
      windowOffsetFront: 44.5,
      partitionDepth: 42,
      partitionHeight: 84,
      partitionThickness: 5,
      partitionPositionX: 92,
      partitionStyle: 'drywall',
      floorMaterial: 'concrete',
      showPrayerMat: false,
      showEntryBench: false,
      showBookshelf: false,
      showIndoorPlant: false,
      showPendantLight: false,
      showWallArt: false
    }
  },
  {
    id: 'prayer_musalla',
    name: "Tranquil Prayer Musalla",
    description: "Serene sacred sanctuary with ornate Mashrabiya lattice privacy wing, emerald velvet prayer mats, warm oak flooring & entry shoe console.",
    specs: {
      roomName: "Tranquil Prayer Musalla",
      width: 156,
      depth: 174,
      height: 144,
      doorWidth: 44,
      doorHeight: 84,
      doorOffsetLeft: 48,
      doorRemainingRight: 64,
      doorType: 'single_swing',
      doorOpenAngle: 50,
      windowWall: 'left',
      windowWidth: 80,
      windowHeight: 54,
      windowSillHeight: 52,
      windowOffsetFront: 47,
      partitionDepth: 48,
      partitionHeight: 90,
      partitionThickness: 4,
      partitionPositionX: 92,
      partitionStyle: 'mashrabiya',
      wallColor: '#F8F6F0',
      floorMaterial: 'hardwood',
      showPrayerMat: true,
      prayerMatCount: 2,
      prayerMatPattern: 'classic_emerald',
      showEntryBench: true,
      showBookshelf: true,
      showIndoorPlant: true,
      showPendantLight: true,
      showWallArt: true
    }
  },
  {
    id: 'japandi_slats',
    name: "Modern Japandi Studio",
    description: "Contemporary organic living space featuring warm vertical oak timber slats, terrazzo flooring, soft ambient fixtures & olive tree.",
    specs: {
      roomName: "Modern Japandi Studio",
      width: 168,
      depth: 180,
      height: 132,
      doorWidth: 42,
      doorHeight: 84,
      doorOffsetLeft: 52,
      doorRemainingRight: 74,
      doorType: 'sliding',
      doorOpenAngle: 60,
      windowWall: 'left',
      windowWidth: 90,
      windowHeight: 60,
      windowSillHeight: 40,
      windowOffsetFront: 45,
      partitionDepth: 46,
      partitionHeight: 108,
      partitionThickness: 3.5,
      partitionPositionX: 94,
      partitionStyle: 'timber_slats',
      wallColor: '#F4F2EC',
      floorMaterial: 'terrazzo',
      showPrayerMat: true,
      prayerMatCount: 1,
      prayerMatPattern: 'modern_slate',
      showEntryBench: true,
      showBookshelf: true,
      showIndoorPlant: true,
      showPendantLight: true,
      showWallArt: false
    }
  },
  {
    id: 'executive_fluted',
    name: "Executive Focus Suite",
    description: "Sophisticated private office with ribbed fluted privacy glass, Carrara marble flooring, matte black mullions & architectural credenza.",
    specs: {
      roomName: "Executive Focus Suite",
      width: 160,
      depth: 168,
      height: 144,
      doorWidth: 48,
      doorHeight: 84,
      doorOffsetLeft: 44,
      doorRemainingRight: 68,
      doorType: 'double_swing',
      doorOpenAngle: 40,
      windowWall: 'back',
      windowWidth: 84,
      windowHeight: 52,
      windowSillHeight: 48,
      windowOffsetFront: 38,
      partitionDepth: 52,
      partitionHeight: 96,
      partitionThickness: 4,
      partitionPositionX: 92,
      partitionStyle: 'fluted_glass',
      wallColor: '#ECECE8',
      floorMaterial: 'marble',
      showPrayerMat: false,
      showEntryBench: true,
      showBookshelf: true,
      showIndoorPlant: true,
      showPendantLight: true,
      showWallArt: true
    }
  },
  {
    id: 'compact_studio',
    name: "Compact Minimalist Room (10' × 10')",
    description: "Space-efficient 10ft × 10ft layout with acoustic felt divider for optimal sound isolation and visual seclusion.",
    specs: {
      roomName: "Compact Minimalist Room",
      width: 120,
      depth: 120,
      height: 120,
      doorWidth: 36,
      doorHeight: 80,
      doorOffsetLeft: 36,
      doorRemainingRight: 48,
      doorType: 'single_swing',
      doorOpenAngle: 45,
      windowWall: 'left',
      windowWidth: 48,
      windowHeight: 48,
      windowSillHeight: 48,
      windowOffsetFront: 36,
      partitionDepth: 36,
      partitionHeight: 80,
      partitionThickness: 4,
      partitionPositionX: 72,
      partitionStyle: 'acoustic_felt',
      wallColor: '#F7F7F7',
      floorMaterial: 'carpet',
      showPrayerMat: true,
      prayerMatCount: 1,
      prayerMatPattern: 'gold_arch',
      showEntryBench: false,
      showBookshelf: true,
      showIndoorPlant: true,
      showPendantLight: true,
      showWallArt: false
    }
  }
];

// 3D Scale factor: 1 inch = 0.0254 Three.js units (meters)
export const SCALE = 0.0254;

export function inchesToFeetInches(inches: number): string {
  const rounded = Math.round(inches * 10) / 10;
  const feet = Math.floor(rounded / 12);
  const remainingInches = rounded % 12;
  
  if (remainingInches === 0) {
    return `${feet}' 0"`;
  }
  
  if (Math.abs(remainingInches - Math.round(remainingInches)) < 0.05) {
    return `${feet}' ${Math.round(remainingInches)}"`;
  }
  if (Math.abs(remainingInches - (Math.floor(remainingInches) + 0.5)) < 0.05) {
    return `${feet}' ${Math.floor(remainingInches)}.5"`;
  }
  return `${feet}' ${remainingInches.toFixed(1)}"`;
}

export function inchesToMeters(inches: number): string {
  const meters = inches * 0.0254;
  return `${meters.toFixed(2)} m`;
}

export function formatDimension(inches: number, unit: 'imperial' | 'metric'): string {
  if (unit === 'metric') {
    return inchesToMeters(inches);
  }
  return inchesToFeetInches(inches);
}

// Calculate architectural properties dynamically from any RoomDimensions
export function calculateMetrics(specs: RoomDimensions) {
  const floorAreaSqFt = (specs.width * specs.depth) / 144;
  const floorAreaSqM = floorAreaSqFt * 0.092903;
  const roomVolumeCuFt = (specs.width * specs.depth * specs.height) / 1728;
  const roomVolumeCuM = roomVolumeCuFt * 0.0283168;
  const wallAreaGrossSqFt = (2 * (specs.width + specs.depth) * specs.height) / 144;
  const windowAreaSqFt = (specs.windowWidth * specs.windowHeight) / 144;
  const doorAreaSqFt = (specs.doorWidth * specs.doorHeight) / 144;
  const windowToFloorRatioPct = (windowAreaSqFt / floorAreaSqFt) * 100;
  const ceilingClearanceOverPartitionFt = (specs.height - specs.partitionHeight) / 12;
  const eyeLineBlockageHeightFt = specs.partitionHeight / 12;

  return {
    floorAreaSqFt,
    floorAreaSqM,
    roomVolumeCuFt,
    roomVolumeCuM,
    wallAreaGrossSqFt,
    windowAreaSqFt,
    doorAreaSqFt,
    windowToFloorRatioPct,
    ceilingClearanceOverPartitionFt,
    eyeLineBlockageHeightFt
  };
}

export const ARCHITECTURAL_METRICS = calculateMetrics(ROOM_SPECS);

