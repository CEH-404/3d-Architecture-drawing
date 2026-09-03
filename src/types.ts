export type RenderMode = 'raw_drywall' | 'blueprint' | 'clay' | 'xray' | 'studs_exposed';

export type CameraPreset = 
  | 'isometric'
  | 'top_down'
  | 'doorway_eye'
  | 'inside_qibla'
  | 'window_view'
  | 'partition_closeup'
  | 'first_person'
  | 'whole_house_iso'
  | 'whole_house_top';

export type MeasurementUnit = 'imperial' | 'metric';

export type PartitionStyle =
  | 'drywall'
  | 'timber_slats'
  | 'fluted_glass'
  | 'mashrabiya'
  | 'steel_frame'
  | 'acoustic_felt'
  | 'half_wall';

export type FloorMaterialType = 'concrete' | 'hardwood' | 'carpet' | 'marble' | 'terrazzo' | 'tile_slate' | 'deck_wood';

export type WindowWallPlacement = 'left' | 'right' | 'back';

export type DoorType = 'single_swing' | 'double_swing' | 'sliding' | 'open_arch';

export type RoomType =
  | 'living_room'
  | 'master_bedroom'
  | 'guest_bedroom'
  | 'kids_room'
  | 'kitchen'
  | 'dining_room'
  | 'prayer_room'
  | 'home_office'
  | 'bathroom'
  | 'balcony'
  | 'foyer'
  | 'custom';

export type FurnitureCategory =
  | 'seating'
  | 'sleeping'
  | 'kitchen'
  | 'dining'
  | 'bath'
  | 'prayer'
  | 'office'
  | 'storage'
  | 'decor'
  | 'lighting';

export interface FurnitureItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  itemType: string;
  x: number;       // inches relative to room center or origin
  z: number;       // inches relative to room center or origin
  y?: number;      // elevation in inches (default 0)
  rotation: number;// degrees (0, 90, 180, 270, etc.)
  width?: number;  // inches
  depth?: number;  // inches
  height?: number; // inches
  color?: string;
  enabled: boolean;
  notes?: string;
}

export interface RoomDimensions {
  // Shell Dimensions (inches)
  roomName: string;
  notes?: string;
  width: number;      // 12' 4" = 148" (8' to 30')
  depth: number;      // 13' 6" = 162" (8' to 30')
  height: number;     // 12' 0" = 144" (7' to 18')
  
  // Door on entrance wall (Z = 0)
  doorWidth: number;       // 3' 10" = 46"
  doorHeight: number;      // 6' 8" = 80"
  doorOffsetLeft: number;  // 3' 10" = 46"
  doorRemainingRight: number; // calculated or custom
  doorType: DoorType;
  doorOpenAngle: number;   // 0 (closed) to 110 degrees
  doorHinge: 'left' | 'right';
  
  // Window specs
  windowWall: WindowWallPlacement; // 'left', 'right', 'back'
  windowWidth: number;     // 6' 1" = 73"
  windowHeight: number;    // 4' 1" = 49"
  windowSillHeight: number;// 5' 3" = 63"
  windowOffsetFront: number; // offset from front wall / corner
  windowOffsetBack: number;
  windowMullions: 'cross' | 'single_vertical' | 'triple' | 'clear';
  
  // Partition (Wing Wall)
  partitionDepth: number;   // 3' 6" = 42"
  partitionHeight: number;  // 7' 0" = 84"
  partitionThickness: number;// 5"
  partitionPositionX: number;// distance from left wall (e.g. 92" at door edge)
  partitionAttachedTo: 'door_edge_wing' | 'right_wall_wing' | 'custom_offset';
  partitionStyle: PartitionStyle;
  
  // Material & Finishes
  wallColor: string;
  floorMaterial: FloorMaterialType;
  
  // Interior Elements & Layout
  showPrayerMat: boolean;
  prayerMatCount: number; // 1, 2, 3
  prayerMatPattern: 'classic_emerald' | 'gold_arch' | 'modern_slate' | 'terracotta';
  showEntryBench: boolean;
  showBookshelf: boolean;
  showIndoorPlant: boolean;
  showPendantLight: boolean;
  showWallArt: boolean;
}

export interface HouseRoom {
  id: string;
  name: string;
  type: RoomType;
  colorTag: string;
  gridX: number; // inches offset on house floor
  gridZ: number; // inches offset on house floor
  specs: RoomDimensions;
  furniture: FurnitureItem[];
}

export interface SurroundingBuilding {
  id: string;
  name: string;
  x: number; // inches relative to house origin
  z: number; // inches relative to house origin
  width: number; // inches
  depth: number; // inches
  height: number; // inches
  color?: string;
  style: 'modern' | 'brick' | 'glass' | 'classic';
}

export interface SiteEnvironment {
  showRoad: boolean;
  roadType: 'front' | 'corner' | 'culdesac';
  roadWidth: number; // inches (e.g. 240 = 20ft)
  showSidewalk: boolean;
  showTrees: boolean;
  treeCount: number;
  showDriveway: boolean;
  plotWidth: number; // inches (e.g. 720 = 60ft)
  plotDepth: number; // inches (e.g. 960 = 80ft)
  showPlotBoundary: boolean;
  plotOrientationNorth: number; // 0 to 360 degrees (North heading)
  geographicLocation: 'temperate' | 'tropical' | 'desert' | 'mediterranean';
  surroundingBuildings: SurroundingBuilding[];
}

export interface HousePlan {
  id: string;
  name: string;
  description: string;
  rooms: HouseRoom[];
  activeRoomId: string | null; // null = Full House Overview, string = Focused single room
  showRoof: boolean;
  showExteriorGround: boolean;
  showRoomLabels3D: boolean;
  wallCutawayHeight: number; // 0 = full height, >0 = cutaway
  siteEnvironment?: SiteEnvironment;
}

export interface DesignSuggestion {
  id: string;
  title: string;
  category: 'layout' | 'furniture' | 'lighting' | 'ergonomics' | 'daylight' | 'sacred_orientation';
  description: string;
  benefit: string;
  impact: 'high' | 'medium' | 'recommended';
  roomType: RoomType | 'all';
  icon?: string;
  applied?: boolean;
}

export interface LightingState {
  timeOfDay: number; // 0 to 24 hours (e.g., 14.5 = 2:30 PM)
  sunIntensity: number;
  sunAzimuth: number;
  sunElevation: number;
  ambientIntensity: number;
  shadowsEnabled: boolean;
}

export interface ViewSettings {
  renderMode: RenderMode;
  cameraPreset: CameraPreset;
  unit: MeasurementUnit;
  showDimensions: boolean;
  showSightlines: boolean;
  showStudFraming: boolean;
  showHumanFigure: boolean;
  showGrid: boolean;
  ceilingMode: 'open' | 'solid' | 'transparent';
  wallCutawayHeight: number; // 0 (full 12') down to 48"
  wallOpacity: number;
  interactiveSightlineOrigin: 'door_threshold' | 'door_approach' | 'inside_entry';
  viewMode: 'whole_house' | 'single_room' | 'map_2d';
  // 360-degree rotation settings
  is360Rotating?: boolean;
  rotation360Speed?: number;
  rotation360Direction?: 'cw' | 'ccw';
  // Walkthrough First-Person settings
  walkEyeHeight?: number; // inches (e.g., 66 = 5'6")
  walkSpeed?: 'stroll' | 'normal' | 'sprint';
  walkSoundEnabled?: boolean;
  walkFlashlightEnabled?: boolean;
  showMinimap?: boolean;
}

export type SelectableObjectType =
  | 'furniture'
  | 'wall'
  | 'floor'
  | 'door'
  | 'window'
  | 'partition'
  | 'ceiling'
  | 'site_building'
  | 'site_road'
  | 'room';

export interface SelectedObjectInfo {
  type: SelectableObjectType;
  id: string; // furniture item id, wall name, building id, room id, etc.
  name: string;
  roomId?: string;
  roomName?: string;
  furnitureItem?: FurnitureItem;
  wallPosition?: 'front' | 'left' | 'right' | 'back';
  buildingId?: string;
  worldPosition?: { x: number; y: number; z: number };
}


