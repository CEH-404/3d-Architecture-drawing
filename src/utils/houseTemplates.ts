import { HousePlan, HouseRoom, RoomDimensions, RoomType, FurnitureItem, SiteEnvironment } from '../types';

export const DEFAULT_SITE_ENVIRONMENT: SiteEnvironment = {
  showRoad: true,
  roadType: 'front',
  roadWidth: 260, // ~21' 8" asphalt street
  showSidewalk: true,
  showTrees: true,
  treeCount: 5,
  showDriveway: true,
  plotWidth: 920, // ~76 ft
  plotDepth: 1040, // ~86 ft
  showPlotBoundary: true,
  plotOrientationNorth: 45, // 45° North heading
  geographicLocation: 'temperate',
  surroundingBuildings: [
    {
      id: 'neighbor-west',
      name: 'West Neighbor (2-Story Residence)',
      x: -440,
      z: 60,
      width: 240,
      depth: 260,
      height: 250,
      color: '#CBD5E1',
      style: 'modern'
    },
    {
      id: 'neighbor-east',
      name: 'East Neighbor (Modern Villa)',
      x: 540,
      z: 60,
      width: 260,
      depth: 280,
      height: 280,
      color: '#E2E8F0',
      style: 'brick'
    },
    {
      id: 'neighbor-north',
      name: 'Rear Neighbor (Townhouse)',
      x: 40,
      z: 500,
      width: 340,
      depth: 220,
      height: 270,
      color: '#F1F5F9',
      style: 'modern'
    }
  ]
};

export function createDefaultRoomSpecs(type: RoomType, name?: string): RoomDimensions {
  switch (type) {
    case 'living_room':
      return {
        roomName: name || "Grand Living Room",
        notes: "Central gathering space with L-sectional, media console wall & natural daylight.",
        width: 192, // 16' 0"
        depth: 216, // 18' 0"
        height: 132, // 11' 0"
        doorWidth: 48,
        doorHeight: 84,
        doorOffsetLeft: 72,
        doorRemainingRight: 72,
        doorType: 'open_arch',
        doorOpenAngle: 90,
        doorHinge: 'right',
        windowWall: 'left',
        windowWidth: 96,
        windowHeight: 60,
        windowSillHeight: 36,
        windowOffsetFront: 60,
        windowOffsetBack: 60,
        windowMullions: 'triple',
        partitionDepth: 48,
        partitionHeight: 84,
        partitionThickness: 5,
        partitionPositionX: 120,
        partitionAttachedTo: 'door_edge_wing',
        partitionStyle: 'timber_slats',
        wallColor: '#F8F6F2',
        floorMaterial: 'hardwood',
        showPrayerMat: false,
        prayerMatCount: 1,
        prayerMatPattern: 'classic_emerald',
        showEntryBench: false,
        showBookshelf: true,
        showIndoorPlant: true,
        showPendantLight: true,
        showWallArt: true
      };

    case 'prayer_room':
      return {
        roomName: name || "Tranquil Musalla (Prayer Room)",
        notes: "Sacred sanctuary with acoustic privacy wing, emerald Sajjadah carpets & Qibla alignment.",
        width: 156, // 13' 0"
        depth: 174, // 14' 6"
        height: 144, // 12' 0"
        doorWidth: 44,
        doorHeight: 84,
        doorOffsetLeft: 48,
        doorRemainingRight: 64,
        doorType: 'single_swing',
        doorOpenAngle: 45,
        doorHinge: 'right',
        windowWall: 'left',
        windowWidth: 80,
        windowHeight: 54,
        windowSillHeight: 52,
        windowOffsetFront: 47,
        windowOffsetBack: 47,
        windowMullions: 'single_vertical',
        partitionDepth: 48,
        partitionHeight: 90,
        partitionThickness: 4,
        partitionPositionX: 92,
        partitionAttachedTo: 'door_edge_wing',
        partitionStyle: 'mashrabiya',
        wallColor: '#FDFBF7',
        floorMaterial: 'hardwood',
        showPrayerMat: true,
        prayerMatCount: 2,
        prayerMatPattern: 'classic_emerald',
        showEntryBench: true,
        showBookshelf: true,
        showIndoorPlant: true,
        showPendantLight: true,
        showWallArt: true
      };

    case 'master_bedroom':
      return {
        roomName: name || "Master Bedroom Suite",
        notes: "Spacious primary retreat with King bed, dual nightstands & soft acoustic finishes.",
        width: 180, // 15' 0"
        depth: 192, // 16' 0"
        height: 120, // 10' 0"
        doorWidth: 40,
        doorHeight: 80,
        doorOffsetLeft: 36,
        doorRemainingRight: 104,
        doorType: 'single_swing',
        doorOpenAngle: 50,
        doorHinge: 'left',
        windowWall: 'back',
        windowWidth: 84,
        windowHeight: 54,
        windowSillHeight: 40,
        windowOffsetFront: 48,
        windowOffsetBack: 48,
        windowMullions: 'cross',
        partitionDepth: 42,
        partitionHeight: 84,
        partitionThickness: 4,
        partitionPositionX: 76,
        partitionAttachedTo: 'door_edge_wing',
        partitionStyle: 'fluted_glass',
        wallColor: '#F5F3EF',
        floorMaterial: 'carpet',
        showPrayerMat: false,
        prayerMatCount: 1,
        prayerMatPattern: 'classic_emerald',
        showEntryBench: true,
        showBookshelf: false,
        showIndoorPlant: true,
        showPendantLight: true,
        showWallArt: true
      };

    case 'guest_bedroom':
    case 'kids_room':
      return {
        roomName: name || (type === 'kids_room' ? "Kids Bedroom" : "Guest Bedroom"),
        notes: "Comfortable bedroom with natural window light and study corner.",
        width: 144, // 12' 0"
        depth: 156, // 13' 0"
        height: 120, // 10' 0"
        doorWidth: 36,
        doorHeight: 80,
        doorOffsetLeft: 36,
        doorRemainingRight: 72,
        doorType: 'single_swing',
        doorOpenAngle: 45,
        doorHinge: 'right',
        windowWall: 'left',
        windowWidth: 64,
        windowHeight: 48,
        windowSillHeight: 44,
        windowOffsetFront: 46,
        windowOffsetBack: 46,
        windowMullions: 'cross',
        partitionDepth: 36,
        partitionHeight: 80,
        partitionThickness: 4,
        partitionPositionX: 72,
        partitionAttachedTo: 'door_edge_wing',
        partitionStyle: 'drywall',
        wallColor: '#F6F6F6',
        floorMaterial: 'hardwood',
        showPrayerMat: false,
        prayerMatCount: 1,
        prayerMatPattern: 'gold_arch',
        showEntryBench: false,
        showBookshelf: true,
        showIndoorPlant: true,
        showPendantLight: true,
        showWallArt: true
      };

    case 'kitchen':
      return {
        roomName: name || "Chef's Gourmet Kitchen",
        notes: "Culinary workspace with central island, barstools, dual sink & premium cabinetry.",
        width: 168, // 14' 0"
        depth: 180, // 15' 0"
        height: 120, // 10' 0"
        doorWidth: 48,
        doorHeight: 84,
        doorOffsetLeft: 60,
        doorRemainingRight: 60,
        doorType: 'open_arch',
        doorOpenAngle: 90,
        doorHinge: 'right',
        windowWall: 'back',
        windowWidth: 72,
        windowHeight: 42,
        windowSillHeight: 48,
        windowOffsetFront: 54,
        windowOffsetBack: 54,
        windowMullions: 'single_vertical',
        partitionDepth: 42,
        partitionHeight: 42,
        partitionThickness: 5,
        partitionPositionX: 108,
        partitionAttachedTo: 'door_edge_wing',
        partitionStyle: 'half_wall',
        wallColor: '#FAF8F5',
        floorMaterial: 'marble',
        showPrayerMat: false,
        prayerMatCount: 1,
        prayerMatPattern: 'classic_emerald',
        showEntryBench: false,
        showBookshelf: false,
        showIndoorPlant: true,
        showPendantLight: true,
        showWallArt: false
      };

    case 'dining_room':
      return {
        roomName: name || "Formal Dining Hall",
        notes: "Elegant dining room with 6-seat table, modern chandelier & display buffet.",
        width: 156, // 13' 0"
        depth: 168, // 14' 0"
        height: 132, // 11' 0"
        doorWidth: 48,
        doorHeight: 84,
        doorOffsetLeft: 54,
        doorRemainingRight: 54,
        doorType: 'open_arch',
        doorOpenAngle: 90,
        doorHinge: 'left',
        windowWall: 'left',
        windowWidth: 84,
        windowHeight: 60,
        windowSillHeight: 36,
        windowOffsetFront: 42,
        windowOffsetBack: 42,
        windowMullions: 'triple',
        partitionDepth: 40,
        partitionHeight: 84,
        partitionThickness: 4,
        partitionPositionX: 102,
        partitionAttachedTo: 'door_edge_wing',
        partitionStyle: 'timber_slats',
        wallColor: '#F9F8F6',
        floorMaterial: 'hardwood',
        showPrayerMat: false,
        prayerMatCount: 1,
        prayerMatPattern: 'classic_emerald',
        showEntryBench: false,
        showBookshelf: false,
        showIndoorPlant: true,
        showPendantLight: true,
        showWallArt: true
      };

    case 'home_office':
      return {
        roomName: name || "Executive Study & Library",
        notes: "Quiet productivity studio with executive desk, bookshelf wall & fluted glass divider.",
        width: 144, // 12' 0"
        depth: 156, // 13' 0"
        height: 120, // 10' 0"
        doorWidth: 38,
        doorHeight: 80,
        doorOffsetLeft: 38,
        doorRemainingRight: 68,
        doorType: 'single_swing',
        doorOpenAngle: 45,
        doorHinge: 'right',
        windowWall: 'back',
        windowWidth: 72,
        windowHeight: 48,
        windowSillHeight: 42,
        windowOffsetFront: 42,
        windowOffsetBack: 42,
        windowMullions: 'single_vertical',
        partitionDepth: 44,
        partitionHeight: 90,
        partitionThickness: 4,
        partitionPositionX: 76,
        partitionAttachedTo: 'door_edge_wing',
        partitionStyle: 'fluted_glass',
        wallColor: '#EFEFEA',
        floorMaterial: 'hardwood',
        showPrayerMat: false,
        prayerMatCount: 1,
        prayerMatPattern: 'classic_emerald',
        showEntryBench: false,
        showBookshelf: true,
        showIndoorPlant: true,
        showPendantLight: true,
        showWallArt: true
      };

    case 'bathroom':
      return {
        roomName: name || "Luxury Ensuite Bathroom",
        notes: "Spa bathroom with freestanding soaking tub, floating double vanity & glass shower.",
        width: 108, // 9' 0"
        depth: 132, // 11' 0"
        height: 108, // 9' 0"
        doorWidth: 34,
        doorHeight: 80,
        doorOffsetLeft: 34,
        doorRemainingRight: 40,
        doorType: 'single_swing',
        doorOpenAngle: 45,
        doorHinge: 'left',
        windowWall: 'right',
        windowWidth: 36,
        windowHeight: 36,
        windowSillHeight: 60,
        windowOffsetFront: 48,
        windowOffsetBack: 48,
        windowMullions: 'clear',
        partitionDepth: 36,
        partitionHeight: 84,
        partitionThickness: 3.5,
        partitionPositionX: 68,
        partitionAttachedTo: 'door_edge_wing',
        partitionStyle: 'fluted_glass',
        wallColor: '#F5F5F5',
        floorMaterial: 'marble',
        showPrayerMat: false,
        prayerMatCount: 1,
        prayerMatPattern: 'classic_emerald',
        showEntryBench: false,
        showBookshelf: false,
        showIndoorPlant: true,
        showPendantLight: true,
        showWallArt: false
      };

    case 'balcony':
      return {
        roomName: name || "Outdoor Garden Terrace",
        notes: "Covered open-air balcony with teak deck, glass balustrade & potted flora.",
        width: 168, // 14' 0"
        depth: 96,  // 8' 0"
        height: 120, // 10' 0"
        doorWidth: 60,
        doorHeight: 84,
        doorOffsetLeft: 54,
        doorRemainingRight: 54,
        doorType: 'sliding',
        doorOpenAngle: 60,
        doorHinge: 'right',
        windowWall: 'back',
        windowWidth: 120,
        windowHeight: 60,
        windowSillHeight: 36,
        windowOffsetFront: 24,
        windowOffsetBack: 24,
        windowMullions: 'triple',
        partitionDepth: 36,
        partitionHeight: 42,
        partitionThickness: 3,
        partitionPositionX: 114,
        partitionAttachedTo: 'door_edge_wing',
        partitionStyle: 'half_wall',
        wallColor: '#F2EFEB',
        floorMaterial: 'deck_wood',
        showPrayerMat: false,
        prayerMatCount: 1,
        prayerMatPattern: 'classic_emerald',
        showEntryBench: true,
        showBookshelf: false,
        showIndoorPlant: true,
        showPendantLight: false,
        showWallArt: false
      };

    case 'foyer':
      return {
        roomName: name || "Grand Entrance Foyer",
        notes: "Welcoming entrance gallery with terrazzo floor, shoe console & privacy screen.",
        width: 120, // 10' 0"
        depth: 132, // 11' 0"
        height: 132, // 11' 0"
        doorWidth: 48,
        doorHeight: 90,
        doorOffsetLeft: 36,
        doorRemainingRight: 36,
        doorType: 'double_swing',
        doorOpenAngle: 45,
        doorHinge: 'right',
        windowWall: 'left',
        windowWidth: 48,
        windowHeight: 48,
        windowSillHeight: 54,
        windowOffsetFront: 42,
        windowOffsetBack: 42,
        windowMullions: 'single_vertical',
        partitionDepth: 44,
        partitionHeight: 96,
        partitionThickness: 4,
        partitionPositionX: 84,
        partitionAttachedTo: 'door_edge_wing',
        partitionStyle: 'mashrabiya',
        wallColor: '#F7F6F2',
        floorMaterial: 'terrazzo',
        showPrayerMat: false,
        prayerMatCount: 1,
        prayerMatPattern: 'classic_emerald',
        showEntryBench: true,
        showBookshelf: false,
        showIndoorPlant: true,
        showPendantLight: true,
        showWallArt: true
      };

    default: // custom or raw shell
      return {
        roomName: name || "Architectural Shell",
        notes: "Configurable bare shell ready for custom interior layout and finishes.",
        width: 148,
        depth: 162,
        height: 144,
        doorWidth: 46,
        doorHeight: 80,
        doorOffsetLeft: 46,
        doorRemainingRight: 56,
        doorType: 'single_swing',
        doorOpenAngle: 45,
        doorHinge: 'right',
        windowWall: 'left',
        windowWidth: 73,
        windowHeight: 49,
        windowSillHeight: 63,
        windowOffsetFront: 44.5,
        windowOffsetBack: 44.5,
        windowMullions: 'single_vertical',
        partitionDepth: 42,
        partitionHeight: 84,
        partitionThickness: 5,
        partitionPositionX: 92,
        partitionAttachedTo: 'door_edge_wing',
        partitionStyle: 'drywall',
        wallColor: '#F5F5F3',
        floorMaterial: 'concrete',
        showPrayerMat: false,
        prayerMatCount: 1,
        prayerMatPattern: 'classic_emerald',
        showEntryBench: false,
        showBookshelf: false,
        showIndoorPlant: false,
        showPendantLight: false,
        showWallArt: false
      };
  }
}

export function createDefaultFurnitureForRoom(type: RoomType): FurnitureItem[] {
  switch (type) {
    case 'living_room':
      return [
        { id: 'f-lr-sofa', name: 'L-Shape Sectional Sofa', category: 'seating', itemType: 'sofa_sectional', x: -30, z: 20, rotation: 0, enabled: true, color: '#475569' },
        { id: 'f-lr-table', name: 'Oak Coffee Table', category: 'seating', itemType: 'coffee_table', x: 20, z: 20, rotation: 0, enabled: true, color: '#b45309' },
        { id: 'f-lr-tv', name: '75" Media Wall & Console', category: 'decor', itemType: 'tv_media_wall', x: 80, z: 20, rotation: 270, enabled: true, color: '#18181b' },
        { id: 'f-lr-plant', name: 'Fiddle Leaf Fig Tree', category: 'decor', itemType: 'indoor_plant', x: -80, z: 80, rotation: 0, enabled: true, color: '#15803d' },
        { id: 'f-lr-lamp', name: 'Arched Floor Lamp', category: 'lighting', itemType: 'pendant_light', x: -80, z: -40, rotation: 0, enabled: true, color: '#fbbf24' }
      ];

    case 'prayer_room':
      return [
        { id: 'f-pr-rug1', name: 'Emerald Velvet Sajjadah 1', category: 'prayer', itemType: 'prayer_rug', x: -20, z: 40, rotation: 0, enabled: true, color: '#047857' },
        { id: 'f-pr-rug2', name: 'Emerald Velvet Sajjadah 2', category: 'prayer', itemType: 'prayer_rug', x: 20, z: 40, rotation: 0, enabled: true, color: '#047857' },
        { id: 'f-pr-mihrab', name: 'Qibla Mihrab Arch Accent', category: 'prayer', itemType: 'mihrab_arch', x: 0, z: 75, rotation: 0, enabled: true, color: '#d97706' },
        { id: 'f-pr-quran', name: 'Rehal Quran Book Stand', category: 'prayer', itemType: 'quran_stand', x: 50, z: 50, rotation: 315, enabled: true, color: '#92400e' },
        { id: 'f-pr-bench', name: 'Entryway Shoe Bench', category: 'seating', itemType: 'entry_bench', x: -45, z: -55, rotation: 0, enabled: true, color: '#78716c' },
        { id: 'f-pr-plant', name: 'Potted Olive Tree', category: 'decor', itemType: 'indoor_plant', x: -55, z: 65, rotation: 0, enabled: true, color: '#15803d' }
      ];

    case 'master_bedroom':
      return [
        { id: 'f-mb-bed', name: 'King Bed with Upholstered Headboard', category: 'sleeping', itemType: 'king_bed', x: 0, z: 30, rotation: 180, enabled: true, color: '#334155' },
        { id: 'f-mb-stand1', name: 'Left Nightstand & Lamp', category: 'sleeping', itemType: 'nightstand', x: -55, z: 60, rotation: 0, enabled: true, color: '#b45309' },
        { id: 'f-mb-stand2', name: 'Right Nightstand & Lamp', category: 'sleeping', itemType: 'nightstand', x: 55, z: 60, rotation: 0, enabled: true, color: '#b45309' },
        { id: 'f-mb-wardrobe', name: 'Full Height Wardrobe Closet', category: 'storage', itemType: 'wardrobe', x: 75, z: -20, rotation: 270, enabled: true, color: '#e2e8f0' },
        { id: 'f-mb-bench', name: 'End-of-Bed Ottoman Bench', category: 'seating', itemType: 'entry_bench', x: 0, z: -25, rotation: 0, enabled: true, color: '#64748b' }
      ];

    case 'kitchen':
      return [
        { id: 'f-k-island', name: 'Marble Waterfall Island & Stools', category: 'kitchen', itemType: 'kitchen_island', x: 0, z: 0, rotation: 0, enabled: true, color: '#f8fafc' },
        { id: 'f-k-counters', name: 'L-Shape Kitchen Counters & Cooktop', category: 'kitchen', itemType: 'kitchen_counters', x: -45, z: 50, rotation: 0, enabled: true, color: '#0f172a' },
        { id: 'f-k-fridge', name: 'French Door Refrigerator', category: 'kitchen', itemType: 'refrigerator', x: -65, z: -40, rotation: 90, enabled: true, color: '#94a3b8' }
      ];

    case 'dining_room':
      return [
        { id: 'f-dr-table', name: '6-Seater Solid Oak Dining Table', category: 'dining', itemType: 'dining_table', x: 0, z: 0, rotation: 0, enabled: true, color: '#78350f' },
        { id: 'f-dr-pendant', name: 'Architectural Linear Chandelier', category: 'lighting', itemType: 'pendant_light', x: 0, z: 0, rotation: 0, enabled: true, color: '#fbbf24' },
        { id: 'f-dr-buffet', name: 'Credenza & Display Buffet', category: 'storage', itemType: 'bookshelf_wall', x: 0, z: 65, rotation: 0, enabled: true, color: '#57534e' }
      ];

    case 'home_office':
      return [
        { id: 'f-ho-desk', name: 'Executive Walnut Desk & Dual Monitors', category: 'office', itemType: 'desk_setup', x: 0, z: 20, rotation: 0, enabled: true, color: '#451a03' },
        { id: 'f-ho-chair', name: 'Ergonomic High-Back Chair', category: 'office', itemType: 'executive_chair', x: 0, z: 50, rotation: 0, enabled: true, color: '#1e293b' },
        { id: 'f-ho-books', name: 'Floor-to-Ceiling Bookshelf Wall', category: 'office', itemType: 'bookshelf_wall', x: -55, z: 0, rotation: 90, enabled: true, color: '#78350f' },
        { id: 'f-ho-plant', name: 'Monstera Deliciosa Plant', category: 'decor', itemType: 'indoor_plant', x: 50, z: 55, rotation: 0, enabled: true, color: '#16a34a' }
      ];

    case 'bathroom':
      return [
        { id: 'f-ba-vanity', name: 'Floating Double Vanity & LED Mirrors', category: 'bath', itemType: 'vanity_mirror', x: 0, z: 45, rotation: 0, enabled: true, color: '#334155' },
        { id: 'f-ba-tub', name: 'Freestanding Oval Soaking Tub', category: 'bath', itemType: 'bathtub', x: -35, z: -20, rotation: 90, enabled: true, color: '#ffffff' },
        { id: 'f-ba-toilet', name: 'Wall-Hung Modern Toilet', category: 'bath', itemType: 'toilet', x: 35, z: -25, rotation: 270, enabled: true, color: '#f1f5f9' }
      ];

    case 'balcony':
      return [
        { id: 'f-bc-set', name: 'Teak Bistro Table & 2 Acapulco Chairs', category: 'seating', itemType: 'balcony_set', x: 0, z: 0, rotation: 0, enabled: true, color: '#d97706' },
        { id: 'f-bc-planters', name: 'Perimeter Terrace Planter Boxes', category: 'decor', itemType: 'indoor_plant', x: 0, z: 35, rotation: 0, enabled: true, color: '#15803d' }
      ];

    default:
      return [];
  }
}

// 5 Pre-Built Full House Plan Templates
export const HOUSE_PRESETS: HousePlan[] = [
  {
    id: 'modern_luxury_villa',
    name: 'Modern Luxury Villa (4-Bed + Musalla)',
    description: 'Expansive 3,200 sq ft residence featuring open Great Room, Chef Kitchen, Tranquil Musalla Sanctuary, Master Suite, Study & Garden Terrace.',
    activeRoomId: null,
    showRoof: false,
    showExteriorGround: true,
    showRoomLabels3D: true,
    wallCutawayHeight: 0,
    rooms: [
      {
        id: 'r-villa-living',
        name: 'Grand Living Room',
        type: 'living_room',
        colorTag: '#0284C7',
        gridX: 0,
        gridZ: 0,
        specs: createDefaultRoomSpecs('living_room', 'Grand Living Room'),
        furniture: createDefaultFurnitureForRoom('living_room')
      },
      {
        id: 'r-villa-musalla',
        name: 'Tranquil Musalla (Prayer Room)',
        type: 'prayer_room',
        colorTag: '#059669',
        gridX: 204, // Adjacent right of living room
        gridZ: 0,
        specs: createDefaultRoomSpecs('prayer_room', 'Tranquil Musalla (Prayer Room)'),
        furniture: createDefaultFurnitureForRoom('prayer_room')
      },
      {
        id: 'r-villa-kitchen',
        name: "Chef's Gourmet Kitchen",
        type: 'kitchen',
        colorTag: '#D97706',
        gridX: -180, // Adjacent left of living room
        gridZ: 0,
        specs: createDefaultRoomSpecs('kitchen', "Chef's Gourmet Kitchen"),
        furniture: createDefaultFurnitureForRoom('kitchen')
      },
      {
        id: 'r-villa-master',
        name: 'Master Bedroom Suite',
        type: 'master_bedroom',
        colorTag: '#7C3AED',
        gridX: 0,
        gridZ: 228, // Behind living room
        specs: createDefaultRoomSpecs('master_bedroom', 'Master Bedroom Suite'),
        furniture: createDefaultFurnitureForRoom('master_bedroom')
      },
      {
        id: 'r-villa-office',
        name: 'Executive Study & Library',
        type: 'home_office',
        colorTag: '#475569',
        gridX: 192,
        gridZ: 186,
        specs: createDefaultRoomSpecs('home_office', 'Executive Study & Library'),
        furniture: createDefaultFurnitureForRoom('home_office')
      },
      {
        id: 'r-villa-bath',
        name: 'Luxury Ensuite Bath',
        type: 'bathroom',
        colorTag: '#0891B2',
        gridX: -120,
        gridZ: 228,
        specs: createDefaultRoomSpecs('bathroom', 'Luxury Ensuite Bath'),
        furniture: createDefaultFurnitureForRoom('bathroom')
      },
      {
        id: 'r-villa-terrace',
        name: 'Outdoor Garden Terrace',
        type: 'balcony',
        colorTag: '#65A30D',
        gridX: 0,
        gridZ: -108, // In front of living room
        specs: createDefaultRoomSpecs('balcony', 'Outdoor Garden Terrace'),
        furniture: createDefaultFurnitureForRoom('balcony')
      }
    ]
  },
  {
    id: 'contemporary_family_house',
    name: 'Contemporary Family Residence (3-Bed)',
    description: 'Practical and elegant family home with open-plan Living & Dining, Master Suite, 2 Bedrooms and Family Bathroom.',
    activeRoomId: null,
    showRoof: false,
    showExteriorGround: true,
    showRoomLabels3D: true,
    wallCutawayHeight: 0,
    rooms: [
      {
        id: 'r-fam-living',
        name: 'Family Great Room',
        type: 'living_room',
        colorTag: '#0284C7',
        gridX: 0,
        gridZ: 0,
        specs: createDefaultRoomSpecs('living_room', 'Family Great Room'),
        furniture: createDefaultFurnitureForRoom('living_room')
      },
      {
        id: 'r-fam-dining',
        name: 'Dining & Kitchen',
        type: 'dining_room',
        colorTag: '#EA580C',
        gridX: -168,
        gridZ: 0,
        specs: createDefaultRoomSpecs('dining_room', 'Dining & Kitchen'),
        furniture: createDefaultFurnitureForRoom('dining_room')
      },
      {
        id: 'r-fam-master',
        name: 'Primary Suite',
        type: 'master_bedroom',
        colorTag: '#9333EA',
        gridX: 204,
        gridZ: 0,
        specs: createDefaultRoomSpecs('master_bedroom', 'Primary Suite'),
        furniture: createDefaultFurnitureForRoom('master_bedroom')
      },
      {
        id: 'r-fam-kids',
        name: 'Kids Bedroom',
        type: 'kids_room',
        colorTag: '#F59E0B',
        gridX: 204,
        gridZ: 168,
        specs: createDefaultRoomSpecs('kids_room', 'Kids Bedroom'),
        furniture: createDefaultFurnitureForRoom('kids_room')
      },
      {
        id: 'r-fam-bath',
        name: 'Family Bathroom',
        type: 'bathroom',
        colorTag: '#06B6D4',
        gridX: 0,
        gridZ: 228,
        specs: createDefaultRoomSpecs('bathroom', 'Family Bathroom'),
        furniture: createDefaultFurnitureForRoom('bathroom')
      }
    ]
  },
  {
    id: 'urban_penthouse_loft',
    name: 'Urban Luxury Penthouse Loft',
    description: 'High-ceiling open industrial loft with floor-to-ceiling glass, marble kitchen island, master suite & private sky terrace.',
    activeRoomId: null,
    showRoof: false,
    showExteriorGround: true,
    showRoomLabels3D: true,
    wallCutawayHeight: 0,
    rooms: [
      {
        id: 'r-loft-lounge',
        name: 'Panoramic Living Lounge',
        type: 'living_room',
        colorTag: '#0284C7',
        gridX: 0,
        gridZ: 0,
        specs: createDefaultRoomSpecs('living_room', 'Panoramic Living Lounge'),
        furniture: createDefaultFurnitureForRoom('living_room')
      },
      {
        id: 'r-loft-kitchen',
        name: 'Minimalist Island Kitchen',
        type: 'kitchen',
        colorTag: '#F59E0B',
        gridX: -180,
        gridZ: 0,
        specs: createDefaultRoomSpecs('kitchen', 'Minimalist Island Kitchen'),
        furniture: createDefaultFurnitureForRoom('kitchen')
      },
      {
        id: 'r-loft-bedroom',
        name: 'Master Loft Bedroom',
        type: 'master_bedroom',
        colorTag: '#8B5CF6',
        gridX: 0,
        gridZ: 228,
        specs: createDefaultRoomSpecs('master_bedroom', 'Master Loft Bedroom'),
        furniture: createDefaultFurnitureForRoom('master_bedroom')
      },
      {
        id: 'r-loft-terrace',
        name: 'Private Sky Terrace',
        type: 'balcony',
        colorTag: '#10B981',
        gridX: 204,
        gridZ: 0,
        specs: createDefaultRoomSpecs('balcony', 'Private Sky Terrace'),
        furniture: createDefaultFurnitureForRoom('balcony')
      },
      {
        id: 'r-loft-bath',
        name: 'Spa Ensuite Bath',
        type: 'bathroom',
        colorTag: '#06B6D4',
        gridX: -120,
        gridZ: 228,
        specs: createDefaultRoomSpecs('bathroom', 'Spa Ensuite Bath'),
        furniture: createDefaultFurnitureForRoom('bathroom')
      }
    ]
  },
  {
    id: 'tranquil_sanctuary_house',
    name: 'Serene Courtyard Sanctuary Home',
    description: 'Spiritual haven centered around a tranquil Musalla with ornate Mashrabiya partitions, central courtyard, study library & peaceful guest suites.',
    activeRoomId: null,
    showRoof: false,
    showExteriorGround: true,
    showRoomLabels3D: true,
    wallCutawayHeight: 0,
    rooms: [
      {
        id: 'r-sanc-musalla',
        name: 'Grand Prayer Musalla',
        type: 'prayer_room',
        colorTag: '#059669',
        gridX: 0,
        gridZ: 0,
        specs: createDefaultRoomSpecs('prayer_room', 'Grand Prayer Musalla'),
        furniture: createDefaultFurnitureForRoom('prayer_room')
      },
      {
        id: 'r-sanc-courtyard',
        name: 'Central Majlis Courtyard',
        type: 'living_room',
        colorTag: '#0284C7',
        gridX: 0,
        gridZ: 186,
        specs: createDefaultRoomSpecs('living_room', 'Central Majlis Courtyard'),
        furniture: createDefaultFurnitureForRoom('living_room')
      },
      {
        id: 'r-sanc-library',
        name: 'Islamic Study & Library',
        type: 'home_office',
        colorTag: '#475569',
        gridX: 168,
        gridZ: 0,
        specs: createDefaultRoomSpecs('home_office', 'Islamic Study & Library'),
        furniture: createDefaultFurnitureForRoom('home_office')
      },
      {
        id: 'r-sanc-master',
        name: 'Primary Suite',
        type: 'master_bedroom',
        colorTag: '#7C3AED',
        gridX: -192,
        gridZ: 0,
        specs: createDefaultRoomSpecs('master_bedroom', 'Primary Suite'),
        furniture: createDefaultFurnitureForRoom('master_bedroom')
      },
      {
        id: 'r-sanc-foyer',
        name: 'Ablution & Entry Foyer',
        type: 'foyer',
        colorTag: '#D97706',
        gridX: 0,
        gridZ: -144,
        specs: createDefaultRoomSpecs('foyer', 'Ablution & Entry Foyer'),
        furniture: createDefaultFurnitureForRoom('foyer')
      }
    ]
  }
];

export const DEFAULT_HOUSE_PLAN = HOUSE_PRESETS[0];
