import { HousePlan, HouseRoom, RoomDimensions, RoomType, FurnitureItem } from '../types';
import { createDefaultRoomSpecs, createDefaultFurnitureForRoom } from './houseTemplates';

export interface ExpansionOption {
  id: string;
  name: string;
  subtitle: string;
  totalBedrooms: number;
  totalBathrooms: number;
  estimatedSqFt: number;
  description: string;
  includedRooms: string[];
  tags: string[];
}

export const EXPANSION_PRESETS: ExpansionOption[] = [
  {
    id: 'suburban_2bed',
    name: 'Modern 2-Bedroom Suburban Home',
    subtitle: 'Balanced Living with Open Kitchen & Guest Suite',
    totalBedrooms: 2,
    totalBathrooms: 2,
    estimatedSqFt: 1150,
    description: 'Converts your single bedroom into a full open-concept 2-bedroom home featuring a grand living room, chef island kitchen, dining area, guest bedroom, master bath, and guest powder room.',
    includedRooms: ['Grand Living Room', 'Open Island Kitchen', 'Primary Bedroom (Your Room)', 'Guest Bedroom', 'Master Bath', 'Powder Room'],
    tags: ['Popular', 'Open Concept', 'Fully Furnished']
  },
  {
    id: 'executive_3bed',
    name: 'Executive 3-Bedroom Luxury Villa',
    subtitle: 'Spacious Family Living + Prayer Sanctuary & Home Office',
    totalBedrooms: 3,
    totalBathrooms: 3,
    estimatedSqFt: 1850,
    description: 'Expands into a luxurious 3-bedroom residence featuring a dramatic high-ceiling Great Room, gourmet kitchen, dining suite, dedicated Musalla prayer room, executive study, master retreat, and 2 additional bedrooms.',
    includedRooms: ['Great Living Room', 'Gourmet Kitchen', 'Formal Dining', 'Master Bedroom Suite', 'Guest Bedroom', 'Kids Bedroom', 'Tranquil Musalla', 'Home Office', '3 Bathrooms'],
    tags: ['Luxury', 'Multi-Generation', 'Sanctuary']
  },
  {
    id: 'family_estate_4bed',
    name: 'Grand 4-Bedroom Family Estate',
    subtitle: 'Sprawling Multi-Wing Floor Plan with Garden Deck',
    totalBedrooms: 4,
    totalBathrooms: 4,
    estimatedSqFt: 2600,
    description: 'A grand architectural layout designed for large families with expansive entertaining spaces, 4 full bedrooms with ensuite baths, walk-in closets, home library, and outdoor living deck.',
    includedRooms: ['Grand Great Room', 'Chef Kitchen', 'Dining Hall', 'Master Suite & Walk-in', 'Bedroom 2', 'Bedroom 3', 'In-Law Suite', 'Home Library', 'Outdoor Deck', '4 Bathrooms'],
    tags: ['Spacious', '4 Bedrooms', 'Deck']
  },
  {
    id: 'penthouse_loft',
    name: 'Urban Penthouse Sky Loft',
    subtitle: 'High-Ceiling Open Concept with Sky Terrace',
    totalBedrooms: 2,
    totalBathrooms: 2,
    estimatedSqFt: 1400,
    description: 'Architectural loft aesthetic with panoramic living lounge, quartz waterfall kitchen, master sleeping loft, private terrace, and spa bathroom.',
    includedRooms: ['Panoramic Lounge', 'Waterfall Kitchen', 'Master Loft', 'Private Sky Terrace', 'Spa Ensuite Bath', 'Work Studio'],
    tags: ['Modern', 'Loft', 'Sky Terrace']
  }
];

/**
 * Transforms a single room / bedroom into a full house plan.
 */
export function expandBedroomToFullHouse(
  currentRoom: HouseRoom,
  presetId: string,
  customHouseName?: string
): HousePlan {
  const baseName = customHouseName || `${currentRoom.name} - Expanded Home`;

  switch (presetId) {
    case 'suburban_2bed': {
      // 1. Keep user's room as primary bedroom
      const masterRoom: HouseRoom = {
        ...currentRoom,
        id: currentRoom.id || 'r-master-expanded',
        name: currentRoom.name || 'Primary Bedroom Suite',
        type: 'master_bedroom',
        colorTag: '#8B5CF6',
        gridX: 204,
        gridZ: 0,
        furniture: currentRoom.furniture && currentRoom.furniture.length > 0
          ? currentRoom.furniture
          : createDefaultFurnitureForRoom('master_bedroom')
      };

      // 2. Add Living Room (Center)
      const livingRoom: HouseRoom = {
        id: `r-living-${Date.now()}`,
        name: 'Grand Living Room',
        type: 'living_room',
        colorTag: '#0284C7',
        gridX: 0,
        gridZ: 0,
        specs: createDefaultRoomSpecs('living_room', 'Grand Living Room'),
        furniture: createDefaultFurnitureForRoom('living_room')
      };

      // 3. Add Kitchen (Left of Living)
      const kitchen: HouseRoom = {
        id: `r-kitchen-${Date.now()}`,
        name: 'Open Island Kitchen & Dining',
        type: 'kitchen',
        colorTag: '#F59E0B',
        gridX: -192,
        gridZ: 0,
        specs: createDefaultRoomSpecs('kitchen', 'Open Island Kitchen & Dining'),
        furniture: createDefaultFurnitureForRoom('kitchen')
      };

      // 4. Add Guest Bedroom (Back Left)
      const guestRoom: HouseRoom = {
        id: `r-guest-${Date.now()}`,
        name: 'Guest Bedroom',
        type: 'guest_bedroom',
        colorTag: '#EC4899',
        gridX: -180,
        gridZ: 216,
        specs: createDefaultRoomSpecs('guest_bedroom', 'Guest Bedroom'),
        furniture: createDefaultFurnitureForRoom('guest_bedroom')
      };

      // 5. Add Master Ensuite Bath (Back Right)
      const masterBath: HouseRoom = {
        id: `r-bath-master-${Date.now()}`,
        name: 'Ensuite Bathroom',
        type: 'bathroom',
        colorTag: '#06B6D4',
        gridX: 204,
        gridZ: 204,
        specs: createDefaultRoomSpecs('bathroom', 'Ensuite Bathroom'),
        furniture: createDefaultFurnitureForRoom('bathroom')
      };

      // 6. Add Foyer / Powder Room
      const foyer: HouseRoom = {
        id: `r-foyer-${Date.now()}`,
        name: 'Entry Foyer & Coat Room',
        type: 'foyer',
        colorTag: '#10B981',
        gridX: 0,
        gridZ: -144,
        specs: createDefaultRoomSpecs('foyer', 'Entry Foyer & Coat Room'),
        furniture: createDefaultFurnitureForRoom('foyer')
      };

      return {
        id: `house-expanded-2bed-${Date.now()}`,
        name: customHouseName || 'Modern 2-Bedroom Suburban Home',
        description: 'Complete 2-bedroom residence generated from bedroom specifications, fully furnished and connected.',
        activeRoomId: masterRoom.id,
        showRoof: false,
        showExteriorGround: true,
        showRoomLabels3D: true,
        wallCutawayHeight: 0,
        rooms: [livingRoom, masterRoom, kitchen, guestRoom, masterBath, foyer]
      };
    }

    case 'executive_3bed': {
      const masterRoom: HouseRoom = {
        ...currentRoom,
        id: currentRoom.id || 'r-master-exec',
        name: currentRoom.name || 'Primary Bedroom Retreat',
        type: 'master_bedroom',
        colorTag: '#7C3AED',
        gridX: 216,
        gridZ: 0,
        furniture: currentRoom.furniture && currentRoom.furniture.length > 0
          ? currentRoom.furniture
          : createDefaultFurnitureForRoom('master_bedroom')
      };

      const greatRoom: HouseRoom = {
        id: `r-great-${Date.now()}`,
        name: 'Great Living Room',
        type: 'living_room',
        colorTag: '#0284C7',
        gridX: 0,
        gridZ: 0,
        specs: createDefaultRoomSpecs('living_room', 'Great Living Room'),
        furniture: createDefaultFurnitureForRoom('living_room')
      };

      const kitchen: HouseRoom = {
        id: `r-kitchen-${Date.now()}`,
        name: 'Gourmet Chef Kitchen',
        type: 'kitchen',
        colorTag: '#F59E0B',
        gridX: -204,
        gridZ: 0,
        specs: createDefaultRoomSpecs('kitchen', 'Gourmet Chef Kitchen'),
        furniture: createDefaultFurnitureForRoom('kitchen')
      };

      const dining: HouseRoom = {
        id: `r-dining-${Date.now()}`,
        name: 'Formal Dining Room',
        type: 'dining_room',
        colorTag: '#D97706',
        gridX: -204,
        gridZ: -180,
        specs: createDefaultRoomSpecs('dining_room', 'Formal Dining Room'),
        furniture: createDefaultFurnitureForRoom('dining_room')
      };

      const prayerRoom: HouseRoom = {
        id: `r-prayer-${Date.now()}`,
        name: 'Tranquil Musalla (Sanctuary)',
        type: 'prayer_room',
        colorTag: '#059669',
        gridX: 0,
        gridZ: 228,
        specs: createDefaultRoomSpecs('prayer_room', 'Tranquil Musalla (Sanctuary)'),
        furniture: createDefaultFurnitureForRoom('prayer_room')
      };

      const guestBed: HouseRoom = {
        id: `r-guest-${Date.now()}`,
        name: 'Guest Bedroom',
        type: 'guest_bedroom',
        colorTag: '#EC4899',
        gridX: -204,
        gridZ: 216,
        specs: createDefaultRoomSpecs('guest_bedroom', 'Guest Bedroom'),
        furniture: createDefaultFurnitureForRoom('guest_bedroom')
      };

      const kidsBed: HouseRoom = {
        id: `r-kids-${Date.now()}`,
        name: 'Bedroom 3 / Study Room',
        type: 'kids_room',
        colorTag: '#3B82F6',
        gridX: 216,
        gridZ: 216,
        specs: createDefaultRoomSpecs('kids_room', 'Bedroom 3 / Study Room'),
        furniture: createDefaultFurnitureForRoom('kids_room')
      };

      const homeOffice: HouseRoom = {
        id: `r-office-${Date.now()}`,
        name: 'Executive Home Office',
        type: 'home_office',
        colorTag: '#475569',
        gridX: 216,
        gridZ: -168,
        specs: createDefaultRoomSpecs('home_office', 'Executive Home Office'),
        furniture: createDefaultFurnitureForRoom('home_office')
      };

      const foyer: HouseRoom = {
        id: `r-foyer-${Date.now()}`,
        name: 'Grand Entry Foyer',
        type: 'foyer',
        colorTag: '#10B981',
        gridX: 0,
        gridZ: -156,
        specs: createDefaultRoomSpecs('foyer', 'Grand Entry Foyer'),
        furniture: createDefaultFurnitureForRoom('foyer')
      };

      return {
        id: `house-expanded-3bed-${Date.now()}`,
        name: customHouseName || 'Executive 3-Bedroom Luxury Villa',
        description: 'Complete 3-bedroom luxury villa with prayer sanctuary, executive study, and chef kitchen.',
        activeRoomId: masterRoom.id,
        showRoof: false,
        showExteriorGround: true,
        showRoomLabels3D: true,
        wallCutawayHeight: 0,
        rooms: [greatRoom, masterRoom, kitchen, dining, prayerRoom, guestBed, kidsBed, homeOffice, foyer]
      };
    }

    case 'family_estate_4bed': {
      const masterRoom: HouseRoom = {
        ...currentRoom,
        id: currentRoom.id || 'r-master-estate',
        name: currentRoom.name || 'Master Suite Retreat',
        type: 'master_bedroom',
        colorTag: '#7C3AED',
        gridX: 228,
        gridZ: 0,
        furniture: currentRoom.furniture && currentRoom.furniture.length > 0
          ? currentRoom.furniture
          : createDefaultFurnitureForRoom('master_bedroom')
      };

      const greatRoom: HouseRoom = {
        id: `r-great-${Date.now()}`,
        name: 'Grand Family Great Room',
        type: 'living_room',
        colorTag: '#0284C7',
        gridX: 0,
        gridZ: 0,
        specs: createDefaultRoomSpecs('living_room', 'Grand Family Great Room'),
        furniture: createDefaultFurnitureForRoom('living_room')
      };

      const kitchen: HouseRoom = {
        id: `r-kitchen-${Date.now()}`,
        name: 'Chef Kitchen & Scullery',
        type: 'kitchen',
        colorTag: '#F59E0B',
        gridX: -216,
        gridZ: 0,
        specs: createDefaultRoomSpecs('kitchen', 'Chef Kitchen & Scullery'),
        furniture: createDefaultFurnitureForRoom('kitchen')
      };

      const dining: HouseRoom = {
        id: `r-dining-${Date.now()}`,
        name: 'Formal Dining Hall',
        type: 'dining_room',
        colorTag: '#D97706',
        gridX: -216,
        gridZ: -180,
        specs: createDefaultRoomSpecs('dining_room', 'Formal Dining Hall'),
        furniture: createDefaultFurnitureForRoom('dining_room')
      };

      const bed2: HouseRoom = {
        id: `r-bed2-${Date.now()}`,
        name: 'Bedroom 2 (Ensuite)',
        type: 'guest_bedroom',
        colorTag: '#EC4899',
        gridX: -216,
        gridZ: 216,
        specs: createDefaultRoomSpecs('guest_bedroom', 'Bedroom 2 (Ensuite)'),
        furniture: createDefaultFurnitureForRoom('guest_bedroom')
      };

      const bed3: HouseRoom = {
        id: `r-bed3-${Date.now()}`,
        name: 'Bedroom 3 (Kids Suite)',
        type: 'kids_room',
        colorTag: '#3B82F6',
        gridX: 0,
        gridZ: 228,
        specs: createDefaultRoomSpecs('kids_room', 'Bedroom 3 (Kids Suite)'),
        furniture: createDefaultFurnitureForRoom('kids_room')
      };

      const bed4: HouseRoom = {
        id: `r-bed4-${Date.now()}`,
        name: 'Bedroom 4 (In-Law Suite)',
        type: 'guest_bedroom',
        colorTag: '#8B5CF6',
        gridX: 228,
        gridZ: 216,
        specs: createDefaultRoomSpecs('guest_bedroom', 'Bedroom 4 (In-Law Suite)'),
        furniture: createDefaultFurnitureForRoom('guest_bedroom')
      };

      const library: HouseRoom = {
        id: `r-library-${Date.now()}`,
        name: 'Home Library & Study',
        type: 'home_office',
        colorTag: '#475569',
        gridX: 228,
        gridZ: -168,
        specs: createDefaultRoomSpecs('home_office', 'Home Library & Study'),
        furniture: createDefaultFurnitureForRoom('home_office')
      };

      const deck: HouseRoom = {
        id: `r-deck-${Date.now()}`,
        name: 'Outdoor Patio Deck',
        type: 'balcony',
        colorTag: '#10B981',
        gridX: 0,
        gridZ: 420,
        specs: createDefaultRoomSpecs('balcony', 'Outdoor Patio Deck'),
        furniture: createDefaultFurnitureForRoom('balcony')
      };

      const foyer: HouseRoom = {
        id: `r-foyer-${Date.now()}`,
        name: 'Grand Double Foyer',
        type: 'foyer',
        colorTag: '#D97706',
        gridX: 0,
        gridZ: -156,
        specs: createDefaultRoomSpecs('foyer', 'Grand Double Foyer'),
        furniture: createDefaultFurnitureForRoom('foyer')
      };

      return {
        id: `house-expanded-4bed-${Date.now()}`,
        name: customHouseName || 'Grand 4-Bedroom Family Estate',
        description: 'Expansive 4-bedroom luxury estate with 4 bathrooms, outdoor garden deck, and library.',
        activeRoomId: masterRoom.id,
        showRoof: false,
        showExteriorGround: true,
        showRoomLabels3D: true,
        wallCutawayHeight: 0,
        rooms: [greatRoom, masterRoom, kitchen, dining, bed2, bed3, bed4, library, deck, foyer]
      };
    }

    case 'penthouse_loft':
    default: {
      const masterRoom: HouseRoom = {
        ...currentRoom,
        id: currentRoom.id || 'r-loft-bed',
        name: currentRoom.name || 'Master Sleeping Loft',
        type: 'master_bedroom',
        colorTag: '#8B5CF6',
        gridX: 0,
        gridZ: 228,
        furniture: currentRoom.furniture && currentRoom.furniture.length > 0
          ? currentRoom.furniture
          : createDefaultFurnitureForRoom('master_bedroom')
      };

      const lounge: HouseRoom = {
        id: `r-lounge-${Date.now()}`,
        name: 'Panoramic Living Lounge',
        type: 'living_room',
        colorTag: '#0284C7',
        gridX: 0,
        gridZ: 0,
        specs: createDefaultRoomSpecs('living_room', 'Panoramic Living Lounge'),
        furniture: createDefaultFurnitureForRoom('living_room')
      };

      const kitchen: HouseRoom = {
        id: `r-kitchen-${Date.now()}`,
        name: 'Minimalist Waterfall Kitchen',
        type: 'kitchen',
        colorTag: '#F59E0B',
        gridX: -192,
        gridZ: 0,
        specs: createDefaultRoomSpecs('kitchen', 'Minimalist Waterfall Kitchen'),
        furniture: createDefaultFurnitureForRoom('kitchen')
      };

      const terrace: HouseRoom = {
        id: `r-terrace-${Date.now()}`,
        name: 'Private Sky Terrace',
        type: 'balcony',
        colorTag: '#10B981',
        gridX: 204,
        gridZ: 0,
        specs: createDefaultRoomSpecs('balcony', 'Private Sky Terrace'),
        furniture: createDefaultFurnitureForRoom('balcony')
      };

      const bath: HouseRoom = {
        id: `r-bath-${Date.now()}`,
        name: 'Spa Ensuite Bath',
        type: 'bathroom',
        colorTag: '#06B6D4',
        gridX: -132,
        gridZ: 228,
        specs: createDefaultRoomSpecs('bathroom', 'Spa Ensuite Bath'),
        furniture: createDefaultFurnitureForRoom('bathroom')
      };

      return {
        id: `house-expanded-loft-${Date.now()}`,
        name: customHouseName || 'Urban Penthouse Sky Loft',
        description: 'Open concept luxury penthouse with private sky terrace and designer furnishings.',
        activeRoomId: masterRoom.id,
        showRoof: false,
        showExteriorGround: true,
        showRoomLabels3D: true,
        wallCutawayHeight: 0,
        rooms: [lounge, masterRoom, kitchen, terrace, bath]
      };
    }
  }
}

/**
 * Custom Modular Expander: lets user attach custom chosen rooms to the current bedroom
 */
export function expandCustomModularHouse(
  baseRoom: HouseRoom,
  selectedRoomTypes: RoomType[],
  houseName: string
): HousePlan {
  const rooms: HouseRoom[] = [
    {
      ...baseRoom,
      gridX: 0,
      gridZ: 0,
      furniture: baseRoom.furniture.length > 0 ? baseRoom.furniture : createDefaultFurnitureForRoom(baseRoom.type)
    }
  ];

  // Arrange around origin
  const offsets: { x: number; z: number }[] = [
    { x: 0, z: -190 },  // Front
    { x: -195, z: 0 },  // Left
    { x: 195, z: 0 },   // Right
    { x: 0, z: 190 },   // Back
    { x: -195, z: -190 }, // Front-Left
    { x: 195, z: -190 },  // Front-Right
    { x: -195, z: 190 },  // Back-Left
    { x: 195, z: 190 }    // Back-Right
  ];

  selectedRoomTypes.forEach((type, idx) => {
    const offset = offsets[idx % offsets.length];
    const specs = createDefaultRoomSpecs(type);
    const furniture = createDefaultFurnitureForRoom(type);

    rooms.push({
      id: `room-mod-${type}-${Date.now()}-${idx}`,
      name: specs.roomName,
      type: type,
      colorTag: type === 'living_room' ? '#0284C7' : type === 'kitchen' ? '#F59E0B' : type === 'prayer_room' ? '#059669' : '#8B5CF6',
      gridX: offset.x,
      gridZ: offset.z,
      specs,
      furniture
    });
  });

  return {
    id: `house-custom-modular-${Date.now()}`,
    name: houseName || 'Customized Modular Residence',
    description: `Custom home generated with ${rooms.length} fully furnished spaces.`,
    activeRoomId: baseRoom.id,
    showRoof: false,
    showExteriorGround: true,
    showRoomLabels3D: true,
    wallCutawayHeight: 0,
    rooms
  };
}
